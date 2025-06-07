const { ChatClient } = require('@twurple/chat');
const { RefreshingAuthProvider } = require('@twurple/auth'); // pas besoin d'importer Intents ici
const OBSWebSocket = require('obs-websocket-js').OBSWebSocket;
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

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

async function start(config) {

  try {
    const tokenPath = path.join(__dirname, 'tokens.json');

    let tokenData = {};
    if (fs.existsSync(tokenPath)) {
      tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
    } else {
      console.error("Le fichier tokens.json est introuvable.");
      return;
    }

    // Si userId absent, on le récupère depuis Twitch
    if (!tokenData.userId) {
      try {
        tokenData.userId = await getUserId(tokenData.accessToken, config.clientId);
        fs.writeFileSync(tokenPath, JSON.stringify(tokenData, null, 2));
        console.log("userId récupéré et sauvegardé :", tokenData.userId);
      } catch (e) {
        console.error("Erreur récupération userId:", e);
        return;
      }
    }

    // scopes sous forme de tableau
    const scopesArray = Array.isArray(tokenData.scope)
      ? tokenData.scope
      : (typeof tokenData.scope === 'string' ? tokenData.scope.split(' ') : []);

    // Intents sous forme de tableau de chaînes (par ex. ['chat'])
    const twitchIntents = ['chat'];

    // Création du RefreshingAuthProvider
    const authProvider = new RefreshingAuthProvider(
      {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        onRefresh: (newTokenData) => {
          const refreshedScopesArray = Array.isArray(newTokenData.scope)
            ? newTokenData.scope
            : (typeof newTokenData.scope === 'string' ? newTokenData.scope.split(' ') : []);
          const tokenToSave = {
            accessToken: newTokenData.accessToken,
            refreshToken: newTokenData.refreshToken,
            scope: refreshedScopesArray,
            expiresIn: newTokenData.expiresIn,
            tokenType: newTokenData.tokenType,
            userId: tokenData.userId
          };
          fs.writeFileSync(tokenPath, JSON.stringify(tokenToSave, null, 2));
          console.log("Token rafraîchi et sauvegardé.");
        }
      },
      {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresIn: tokenData.expiresIn,
        scope: scopesArray,
        tokenType: tokenData.tokenType
      }
    );

    // Ajout de l'utilisateur avec son token et les intents (tableau simple)
    await authProvider.addUserForToken({
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresIn: tokenData.expiresIn,
      scope: scopesArray,
      tokenType: tokenData.tokenType
    }, twitchIntents);

    console.log("events:", authProvider.events);

    if (authProvider.events && typeof authProvider.events.on === 'function') {
      authProvider.events.on('tokenRefreshed', (newTokenData) => {
        const tokenToSave = {
          accessToken: newTokenData.accessToken,
          refreshToken: newTokenData.refreshToken,
          scope: newTokenData.scope,
          expiresIn: newTokenData.expiresIn,
          tokenType: newTokenData.tokenType,
          userId: tokenData.userId
        };
        fs.writeFileSync(tokenPath, JSON.stringify(tokenToSave, null, 2));
        console.log("Token rafraîchi et sauvegardé.");
      });
    } else {
      console.warn("L'authProvider n'a pas d'événement 'events', la gestion du refresh ne sera pas automatique.");
    }

    const twitchClient = new ChatClient({ authProvider, channels: [config.channel] });
    const obs = new OBSWebSocket();

    async function connectOBS() {
      try {
        await obs.connect(`ws://localhost:4455`, config.obsPassword);
        console.log("Connecté à OBS");
      } catch (err) {
        console.error("Connexion OBS échouée :", err);
      }
    }

    async function setSourceEnabled(sceneName, sourceName, enabled) {
      try {
        const { sceneItems } = await obs.call('GetSceneItemList', { sceneName });
        const item = sceneItems.find(s => s.sourceName === sourceName);
        if (!item) throw new Error("Source non trouvée");

        await obs.call('SetSceneItemEnabled', {
          sceneName,
          sceneItemId: item.sceneItemId,
          sceneItemEnabled: enabled
        });

      } catch (err) {
        console.error("Erreur avec OBS :", err);
      }
    }

    twitchClient.onMessage(async (channel, user, message) => {
      console.log(`Message reçu dans ${channel} de ${user}: ${message}`);
      const cmd = message.trim();
      const match = config.scenes.find(s => s.command === cmd);

      if (match) {
        console.log(`Commande reconnue: ${cmd}, scène: ${match.scene}, source: ${match.source}, délai: ${match.delai}`);

        // Active la source
        await setSourceEnabled(match.scene, match.source, true);

        // Si délai défini et > 0, planifie la désactivation
        if (match.delai && Number(match.delai) > 0) {
          setTimeout(async () => {
            console.log(`Désactivation de la source ${match.source} dans la scène ${match.scene} après ${match.delai} sec`);
            await setSourceEnabled(match.scene, match.source, false);
          }, match.delai * 1000);
        }

      } else {
        console.log(`Commande non reconnue: ${cmd}`);
      }
    });

    await twitchClient.connect();
    console.log("Connecté à Twitch");
    await connectOBS();

  } catch (err) {
    console.error("Erreur dans start:", err);
  }
}

module.exports = { start };