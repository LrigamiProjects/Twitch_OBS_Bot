const { ChatClient } = require('@twurple/chat');
const { StaticAuthProvider } = require('@twurple/auth');
const OBSWebSocket = require('obs-websocket-js').default;

async function start(config) {
  const authProvider = new StaticAuthProvider(config.clientId, config.oauth, [ 'chat:read', 'chat:edit' ]);
  
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

  async function toggleSource(sceneName, sourceName) {
    try {
      const { sceneItems } = await obs.call('GetSceneItemList', { sceneName });
      const item = sceneItems.find(s => s.sourceName === sourceName);
      if (!item) throw new Error("Source non trouvée");

      await obs.call('SetSceneItemEnabled', {
        sceneName,
        sceneItemId: item.sceneItemId,
        sceneItemEnabled: true
      });
    } catch (err) {
      console.error("Erreur avec OBS :", err);
    }
  }

  twitchClient.onMessage(async (message) => {
    const cmd = message.trim();
    const match = config.scenes.find(s => s.command === cmd);

    if (match) {
      await toggleSource(match.scene, match.source);
    }
  });

  await twitchClient.connect();
  await connectOBS();
}

module.exports = { start };