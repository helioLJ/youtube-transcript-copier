const TRANSLATIONS = {
  en: {
    buttonText: "Copy Transcript",
    loadingText: "Copying...",
    successText: "Copied!",
    summarizePrompt: "Please summarize this video transcript:"
  },
  pt: {
    buttonText: "Copiar Transcrição",
    loadingText: "Copiando...",
    successText: "Copiado!",
    summarizePrompt: "Por favor, resuma esta transcrição do vídeo:"
  },
  es: {
    buttonText: "Copiar Transcripción",
    loadingText: "Copiando...",
    successText: "¡Copiado!",
    summarizePrompt: "Por favor, resume esta transcripción del video:"
  }
};

const saveOptions = () => {
  const includeTimestamps = document.getElementById('includeTimestamps').checked;
  const promptLanguage = document.getElementById('promptLanguage').value;
  const promptType = document.getElementById('promptType').value;
  const splitType = document.getElementById('splitType').value;
  const llmModel = document.getElementById('llmModel').value;
  const customCharLimit = parseInt(document.getElementById('customCharLimit').value) || 13000;
  
  chrome.storage.sync.set(
    {
      includeTimestamps,
      promptLanguage,
      promptType,
      splitType,
      llmModel,
      customCharLimit
    },
    () => {
      const status = document.getElementById('status');
      status.textContent = 'Settings saved';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    }
  );
};

const restoreOptions = () => {
  chrome.storage.sync.get(
    {
      includeTimestamps: true,
      promptLanguage: 'en',
      promptType: 'none',
      splitType: 'auto',
      llmModel: 'gpt35',
      customCharLimit: 13000
    },
    (items) => {
      document.getElementById('includeTimestamps').checked = items.includeTimestamps;
      document.getElementById('promptLanguage').value = items.promptLanguage;
      document.getElementById('promptType').value = items.promptType;
      document.getElementById('splitType').value = items.splitType;
      document.getElementById('llmModel').value = items.llmModel;
      document.getElementById('customCharLimit').value = items.customCharLimit;
      
      updateVisibility();
    }
  );
};

const updateVisibility = () => {
  const splitType = document.getElementById('splitType').value;
  const llmModel = document.getElementById('llmModel').value;
  
  document.getElementById('modelContainer').classList.toggle('hidden', splitType !== 'auto');
  document.getElementById('customLimitContainer').classList.toggle('hidden', 
    splitType !== 'auto' || llmModel !== 'custom');
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('includeTimestamps').addEventListener('change', saveOptions);
document.getElementById('promptLanguage').addEventListener('change', saveOptions);
document.getElementById('promptType').addEventListener('change', saveOptions);
document.getElementById('splitType').addEventListener('change', () => {
  updateVisibility();
  saveOptions();
});
document.getElementById('llmModel').addEventListener('change', () => {
  updateVisibility();
  saveOptions();
});
document.getElementById('customCharLimit').addEventListener('change', saveOptions);
  