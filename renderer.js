const { ipcRenderer } = require("electron");

let config = {
  clientId: "",
  oauth: "",
  channel: "",
  obsPassword: "",
  scenes: [],
};

async function loadConfig() {
  const saved = await ipcRenderer.invoke("get-config");
  if (saved) {
    config = saved;
    document.getElementById("channel").value = config.channel ?? "";
    document.getElementById("clientId").value = config.clientId ?? "";
    document.getElementById("oauth").value = config.oauth ?? "";
    document.getElementById("obsPassword").value = config.obsPassword ?? "";
    renderSceneTable();
  }
}

function setupAutoSave() {
  ["clientId", "oauth", "channel", "obsPassword"].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", () => {
      config[id] = input.value;
      ipcRenderer.invoke("save-config", config);
    });
  });
}

function renderSceneTable() {
  const sceneList = document.getElementById("sceneList");
  sceneList.innerHTML = "";

  config.scenes.forEach((scene, index) => {
    const tr = document.createElement("tr");
    tr.classList.add("scene-row");
    tr.innerHTML = `
      <td><input value="${scene.command}" onchange="updateScene(${index}, 'command', this.value)" /></td>
      <td><input value="${scene.scene}" onchange="updateScene(${index}, 'scene', this.value)" /></td>
      <td><input value="${scene.source}" onchange="updateScene(${index}, 'source', this.value)" /></td>
      <td><button style="cursor: pointer" onclick="removeScene(${index})">🗑 Supprimer</button></td>
    `;
    sceneList.appendChild(tr);
  });
}

window.updateScene = (index, field, value) => {
  config.scenes[index][field] = value;
  ipcRenderer.invoke("save-config", config);
};

window.removeScene = (index) => {
  config.scenes.splice(index, 1);
  ipcRenderer.invoke("save-config", config);
  renderSceneTable();
};

document.getElementById("addScene").addEventListener("click", () => {
  config.scenes.push({ command: "", scene: "", source: "" });
  ipcRenderer.invoke("save-config", config);
  renderSceneTable();
});

document.getElementById("startBot").addEventListener("click", async () => {
  config.channel = document.getElementById("channel").value;
  config.clientId = document.getElementById("clientId").value;
  config.oauth = document.getElementById("oauth").value;
  config.obsPassword = document.getElementById("obsPassword").value;

  if (!config.oauth || !config.channel || !config.clientId) {
    alert("Merci de remplir tous les champs !");
    return;
  }

  await ipcRenderer.invoke("save-config", config);
  await ipcRenderer.invoke("start-bot", config);
  alert("Bot lancé ! Tapez une commande dans le chat.");
});

loadConfig().then(() => {
  setupAutoSave();
});
