let config = {
  clientId: "",
  clientSecret: "",
  channel: "",
  obsPassword: "",
  scenes: [],
  hasSeenTutorial: false
};

console.log("renderer.js ok");

function isValidConfig(config) {
  return (
    typeof config.channel === 'string' &&
    typeof config.clientId === 'string' &&
    typeof config.clientSecret === 'string' &&
    typeof config.obsPassword === 'string' &&
    Array.isArray(config.scenes)
  );
}

async function loadConfig() {
  const saved = await window.electronAPI.getConfig();
  if (saved) {
    config = saved;
    document.getElementById("channel").value = config.channel ?? "";
    document.getElementById("clientId").value = config.clientId ?? "";
    document.getElementById("clientSecret").value = config.clientSecret ?? "";
    document.getElementById("obsPassword").value = config.obsPassword ?? "";
    renderSceneTable();
  }

  if (!config.hasSeenTutorial) {
    showTutorialPopup();
    config.hasSeenTutorial = true;
    await window.electronAPI.saveConfig(config);
  }
}

function setupAutoSave() {
  ["clientId", "clientSecret", "channel", "obsPassword"].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", () => {
      config[id] = input.value;
      window.electronAPI.saveConfig(config);
    });
  });
}

function renderSceneTable() {
  const sceneList = document.getElementById("sceneList");
  sceneList.innerHTML = "";

  config.scenes.forEach((scene, index) => {
    const tr = document.createElement("tr");
    tr.classList.add("scene-row");

    const tdCommand = document.createElement("td");
    const inputCommand = document.createElement("input");
    inputCommand.value = scene.command;
    inputCommand.addEventListener("input", (e) => updateScene(index, "command", e.target.value));
    tdCommand.appendChild(inputCommand);

    const tdScene = document.createElement("td");
    const inputScene = document.createElement("input");
    inputScene.value = scene.scene;
    inputScene.addEventListener("input", (e) => updateScene(index, "scene", e.target.value));
    tdScene.appendChild(inputScene);

    const tdSource = document.createElement("td");
    tdSource.classList.add("input");
    const inputSource = document.createElement("input");
    inputSource.value = scene.source;
    inputSource.addEventListener("input", (e) => updateScene(index, "source", e.target.value));
    tdSource.appendChild(inputSource);

    const tdDelai = document.createElement("td");
    tdDelai.classList.add("last-input");
    const inputDelai = document.createElement("input");
    inputDelai.type = "number";
    inputDelai.min = "0";
    inputDelai.placeholder = "Expire après (sec)";
    inputDelai.value = scene.delai !== undefined ? scene.delai : "";
    inputDelai.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      updateScene(index, "delai", val === "" ? null : parseInt(val, 10));
    });
    tdDelai.appendChild(inputDelai);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
    deleteBtn.addEventListener("click", () => {
      removeScene(index);
    });
    tdDelai.appendChild(deleteBtn);

    tr.appendChild(tdCommand);
    tr.appendChild(tdScene);
    tr.appendChild(tdSource);
    tr.appendChild(tdDelai);

    sceneList.appendChild(tr);
  });
}

function showTutorialPopup() {
  const modal = document.getElementById("tutorialModal");
  const closeBtn = document.getElementById("closeTutorial");

  modal.classList.remove("hidden");

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}

window.updateScene = (index, field, value) => {
  config.scenes[index][field] = value;
  window.electronAPI.saveConfig(config);
  console.log("config scenes:", config.scenes);
};

window.removeScene = (index) => {
  config.scenes.splice(index, 1);
  window.electronAPI.saveConfig(config);
  console.log("config scenes:", config.scenes);
  renderSceneTable();
};

window.addEventListener("DOMContentLoaded", async () => {
  const isNodeInstalled = await window.electronAPI.checkNodeInstalled();

  if (!isNodeInstalled) {
    const install = confirm("Node.js n'est pas installé sur ce PC et est nécessaire pour le bon fonctionnement de l'application. Souhaitez-vous ouvrir la page d'installation ?");
    if (install) {
      window.open("https://nodejs.org/", "_blank");
    }
  }
  
  document.getElementById("addScene").addEventListener("click", () => {
    config.scenes.push({ command: "", scene: "", source: "", delai: null });
    window.electronAPI.saveConfig(config);
    renderSceneTable();
  });

  document.getElementById("startBot").addEventListener("click", async () => {
    config.channel = document.getElementById("channel").value;
    config.clientId = document.getElementById("clientId").value;
    config.clientSecret = document.getElementById("clientSecret").value;
    config.obsPassword = document.getElementById("obsPassword").value;

    if (!isValidConfig(config)) {
      alert("Merci de remplir correctement tous les champs (Client ID, clientSecret et Nom de chaîne).");
      return;
    }

    await window.electronAPI.saveConfig(config);
    await window.electronAPI.startBot(config);
    alert("Bot lancé ! Tapez une commande dans le chat.");
  });

  document.getElementById("helpButton").addEventListener("click", showTutorialPopup);

  document.getElementById('updateStatus').addEventListener('click', () => {
    const updateModal = document.getElementById('updateStatus');
    updateModal.classList.add('hidden');
  });
});

window.electronAPI.onUpdateMessage((message) => {
  console.log('Update status:', message);

  const updateModal = document.getElementById('updateStatus');

  // Affiche le message dans la modale
  updateModal.innerText = message;

  // Affiche la modale si ce n’est pas déjà visible
  if (updateModal.classList.contains('hidden')) {
    updateModal.classList.remove('hidden');

    // Auto-hide après 10 secondes (optionnel)
    setTimeout(() => {
      updateModal.classList.add('hidden');
    }, 10000);
  }
});

loadConfig().then(() => {
  setupAutoSave();
});