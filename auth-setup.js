const { BrowserWindow, app } = require('electron');
const fs = require('fs');
const path = require('path');
const http = require('http');
const fetch = require('node-fetch');
const url = require('url');

async function getUserId(accessToken, clientId) {
  try {
    const response = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': clientId
      }
    });

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.text();
      } catch {
        errorBody = '<impossible de lire le corps de la réponse>';
      }
      throw new Error(`Erreur Twitch API: ${response.status} ${response.statusText}, corps: ${errorBody}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error("La réponse n'est pas au format JSON");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return data.data[0].id;
    } else {
      throw new Error("Réponse Twitch vide ou invalide");
    }
  } catch (err) {
    console.error("Erreur récupération userId:", err);
    throw err;
  }
}

function createAuthUrl({ clientId, redirectUri, scopes }) {
  const scopeStr = encodeURIComponent(scopes.join(' '));
  return `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopeStr}`;
}

async function exchangeCodeForToken({ code, clientId, clientSecret, redirectUri }) {
  try {
    const tokenUrl = `https://id.twitch.tv/oauth2/token`;
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!response.ok) {
      let errorBody;
      try {
        // Essaye JSON, sinon texte brut
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const errJson = await response.json();
          errorBody = JSON.stringify(errJson);
        } else {
          errorBody = await response.text();
        }
      } catch {
        errorBody = '<impossible de lire le corps de la réponse>';
      }
      throw new Error(`Erreur lors de l'échange de token: ${response.status} ${response.statusText}, corps: ${errorBody}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error("La réponse n'est pas au format JSON");
    }

    return await response.json();

  } catch (err) {
    console.error("❌ Erreur exchangeCodeForToken:", err.message);
    if (err.stack) console.error(err.stack);
    throw err;
  }
}

async function startAuthFlow(userConfig) {
  const { clientId, clientSecret } = userConfig;
  const redirectUri = 'http://localhost:5137/';
  const scopes = ['chat:read', 'chat:edit', "user:read:broadcast", "user:read:email"];
  const tokenPath = path.join(__dirname, 'tokens.json');

  return new Promise((resolve, reject) => {
    let authWindow;

    const server = http.createServer(async (req, res) => {
      const query = url.parse(req.url, true).query;

      if (query.code) {
        try {
          const tokenData = await exchangeCodeForToken({
            code: query.code,
            clientId,
            clientSecret,
            redirectUri
          });

          const userId = await getUserId(tokenData.access_token, clientId);

          const fullToken = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            scope: tokenData.scope || scopes,
            expiresIn: tokenData.expires_in,
            tokenType: tokenData.token_type,
            userId
          };

          fs.writeFileSync(tokenPath, JSON.stringify(fullToken, null, 2));
          console.log('✅ Token + userId sauvegardés dans tokens.json');

          res.writeHead(200, { 'Content-Type': 'text/html' });
          fs.createReadStream(path.join(__dirname, 'success.html')).pipe(res);

          setTimeout(() => {
            if (authWindow) authWindow.close();
            server.close();
            resolve(true);
          }, 2000);
        } catch (err) {
          console.error("Erreur d'échange de token :", err);
          res.writeHead(500);
          res.end("Erreur d'authentification.");
          reject(err);
        }
      } else {
        res.writeHead(400);
        res.end("Code manquant.");
      }
    });

    server.listen(5137, () => {
      const authUrl = createAuthUrl({ clientId, redirectUri, scopes });
      console.log("➡️ Ouverture de la fenêtre d'auth...");
      authWindow = new BrowserWindow({
        width: 600,
        height: 800,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      authWindow.loadURL(authUrl);
    });
  });
}

module.exports = { startAuthFlow };