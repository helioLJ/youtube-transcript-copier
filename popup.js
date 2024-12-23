const TRANSLATIONS = {
  en: {
    buttonText: "Copy Transcript",
    loadingText: "Copying...",
    successText: "Copied!",
    summarizePrompt: "Please summarize this video transcript:",
    interfaceLanguage: "Interface Language",
    splitOptions: "Split Options",
    llmModel: "LLM Model",
    characterLimit: "Character Limit",
    includeTimestamps: "Include timestamps in copied text",
    settingsSaved: "Settings saved",
    autoSplit: "Auto-split for LLMs",
    noSplit: "No split",
    customLimit: "Custom limit",
    extensionSettings: "Extension Settings",
    promptLanguage: "Prompt Language",
    promptType: "Prompt Type",
    noPrompt: "No Prompt",
    generalSummary: "General Summary",
    detailedAnalysis: "Detailed Analysis",
    bulletPoints: "Bullet Point Summary",
    sectionSummary: "Section-wise Summary",
    chars: "chars",
    gpt4: "GPT-4 (400k chars)",
    gpt35: "GPT-3.5 (13k chars)",
    customLimitOption: "Custom limit"
  },
  pt: {
    buttonText: "Copiar Transcrição",
    loadingText: "Copiando...",
    successText: "Copiado!",
    summarizePrompt: "Por favor, resuma esta transcrição do vídeo:",
    interfaceLanguage: "Idioma da Interface",
    splitOptions: "Opções de Divisão",
    llmModel: "Modelo LLM",
    characterLimit: "Limite de Caracteres",
    includeTimestamps: "Incluir marcadores de tempo no texto copiado",
    settingsSaved: "Configurações salvas",
    autoSplit: "Divisão automática para LLMs",
    noSplit: "Sem divisão",
    customLimit: "Limite personalizado",
    extensionSettings: "Configurações da Extensão",
    promptLanguage: "Idioma do Prompt",
    promptType: "Tipo de Prompt",
    noPrompt: "Sem Prompt",
    generalSummary: "Resumo Geral",
    detailedAnalysis: "Análise Detalhada",
    bulletPoints: "Resumo em Tópicos",
    sectionSummary: "Resumo por Seções",
    chars: "caracteres",
    gpt4: "GPT-4 (400k caracteres)",
    gpt35: "GPT-3.5 (13k caracteres)",
    customLimitOption: "Limite personalizado"
  },
  es: {
    buttonText: "Copiar Transcripción",
    loadingText: "Copiando...",
    successText: "¡Copiado!",
    summarizePrompt: "Por favor, resume esta transcripción del video:",
    interfaceLanguage: "Idioma de la Interfaz",
    splitOptions: "Opciones de División",
    llmModel: "Modelo LLM",
    characterLimit: "Límite de Caracteres",
    includeTimestamps: "Incluir marcas de tiempo en el texto copiado",
    settingsSaved: "Configuración guardada",
    autoSplit: "División automática para LLMs",
    noSplit: "Sin división",
    customLimit: "Límite personalizado",
    extensionSettings: "Configuración de la Extensión",
    promptLanguage: "Idioma del Prompt",
    promptType: "Tipo de Prompt",
    noPrompt: "Sin Prompt",
    generalSummary: "Resumen General",
    detailedAnalysis: "Análisis Detallado",
    bulletPoints: "Resumen en Puntos",
    sectionSummary: "Resumen por Secciones",
    chars: "caracteres",
    gpt4: "GPT-4 (400k caracteres)",
    gpt35: "GPT-3.5 (13k caracteres)",
    customLimitOption: "Límite personalizado"
  }
};

const saveOptions = () => {
  const interfaceLanguage = document.getElementById('interfaceLanguage').value;
  const includeTimestamps = document.getElementById('includeTimestamps').checked;
  const promptLanguage = document.getElementById('promptLanguage').value;
  const promptType = document.getElementById('promptType').value;
  const splitType = document.getElementById('splitType').value;
  const llmModel = document.getElementById('llmModel').value;
  const customCharLimit = parseInt(document.getElementById('customCharLimit').value) || 13000;
  
  chrome.storage.sync.set(
    {
      interfaceLanguage,
      includeTimestamps,
      promptLanguage,
      promptType,
      splitType,
      llmModel,
      customCharLimit
    },
    () => {
      updateInterfaceLanguage(interfaceLanguage);
      const status = document.getElementById('status');
      status.textContent = TRANSLATIONS[interfaceLanguage].settingsSaved;
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    }
  );
};

const restoreOptions = () => {
  chrome.storage.sync.get(
    {
      interfaceLanguage: 'en',
      includeTimestamps: true,
      promptLanguage: 'en',
      promptType: 'none',
      splitType: 'auto',
      llmModel: 'gpt35',
      customCharLimit: 13000
    },
    (items) => {
      document.getElementById('interfaceLanguage').value = items.interfaceLanguage;
      document.getElementById('includeTimestamps').checked = items.includeTimestamps;
      document.getElementById('promptLanguage').value = items.promptLanguage;
      document.getElementById('promptType').value = items.promptType;
      document.getElementById('splitType').value = items.splitType;
      document.getElementById('llmModel').value = items.llmModel;
      document.getElementById('customCharLimit').value = items.customCharLimit;
      
      updateInterfaceLanguage(items.interfaceLanguage);
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

const updateInterfaceLanguage = (language) => {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (TRANSLATIONS[language][key]) {
      if (element.tagName === 'LABEL') {
        const textNode = Array.from(element.childNodes)
          .find(node => node.nodeType === Node.TEXT_NODE);
        if (textNode) {
          textNode.textContent = TRANSLATIONS[language][key];
        }
      } else {
        element.textContent = TRANSLATIONS[language][key];
      }
    }
  });

  document.querySelectorAll('option[data-i18n]').forEach(option => {
    const key = option.getAttribute('data-i18n');
    if (TRANSLATIONS[language][key]) {
      option.textContent = TRANSLATIONS[language][key];
    }
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('interfaceLanguage').addEventListener('change', saveOptions);
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
  