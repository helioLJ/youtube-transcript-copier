console.log('Content script loaded'); // Debug log

// Get interface language from storage
const getInterfaceLanguage = async () => {
  const result = await chrome.storage.sync.get({
    interfaceLanguage: 'en'
  });
  return result.interfaceLanguage;
};

const createNotificationSystem = () => {
  const notificationContainer = document.createElement('div');
  notificationContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
  document.body.appendChild(notificationContainer);

  return {
    show: async ({ message, type = 'info', duration = 3000, actions = [] }) => {
      const interfaceLanguage = await getInterfaceLanguage();
      const notification = document.createElement('div');
      notification.style.cssText = `
        background-color: ${type === 'warning' ? '#ffd700' : '#2ba640'};
        color: ${type === 'warning' ? '#000' : '#fff'};
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 400px;
        opacity: 0;
        transform: translateX(50px);
        transition: all 0.3s ease;
      `;

      const messageDiv = document.createElement('div');
      messageDiv.textContent = message;
      messageDiv.style.flex = '1';
      notification.appendChild(messageDiv);

      // Add action buttons if any
      actions.forEach(({ label, onClick }) => {
        const button = document.createElement('button');
        button.textContent = label;
        button.style.cssText = `
          background: none;
          border: 1px solid ${type === 'warning' ? '#000' : '#fff'};
          color: ${type === 'warning' ? '#000' : '#fff'};
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        `;
        button.onclick = () => {
          onClick();
          notification.remove();
        };
        notification.appendChild(button);
      });

      notificationContainer.appendChild(notification);
      
      // Trigger animation
      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
      }, 50);

      if (duration > 0) {
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transform = 'translateX(50px)';
          setTimeout(() => notification.remove(), 300);
        }, duration);
      }

      return notification;
    }
  };
};

// Initialize notification system
const notify = createNotificationSystem();

// Listen for changes in storage
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.interfaceLanguage) {
    // Update button text when language changes
    const copyButton = document.querySelector("#copy-transcription-button");
    if (copyButton) {
      const textDiv = copyButton.querySelector(".yt-spec-button-shape-next__button-text-content");
      if (textDiv) {
        textDiv.textContent = translations[changes.interfaceLanguage.newValue].buttonText;
      }
    }
  }
});

const translations = {
  en: {
    buttonText: "Copy Transcript",
    loadingText: "Copying...",
    successText: (chars) => `Copied ${formatCharCount(chars)} chars!`,
    errorTooLong: "This transcript is quite long. Would you like to split it automatically?",
    partIndicator: "Part {current} of {total}",
    copied: "copied!",
    copyNext: "Copy Next Part",
    splitOptions: {
      auto: "Auto-split for ChatGPT"
    },
    prompts: {
      none: "",
      general: "Please provide a summary of this content, highlighting the main points and key takeaways. The output should be in english.",
      detailed: "Please provide a detailed analysis of this content, including main topics, conclusions, and important details. The output should be in english.",
      bullet: "Please summarize this content in bullet points, highlighting the key information. The output should be in english.",
      section: "Please divide this content into main sections and provide a summary for each section. The output should be in english."
    }
  },
  pt: {
    buttonText: "Copiar Transcrição",
    loadingText: "Copiando...",
    successText: (chars) => `Copiado ${formatCharCount(chars)} caracteres!`,
    errorTooLong: "Esta transcrição é muito longa. Deseja ativar a divisão automática?",
    partIndicator: "Parte {current} de {total}",
    copied: "copiado!",
    copyNext: "Copiar Próxima Parte",
    splitOptions: {
      auto: "Divisão automática para ChatGPT"
    },
    prompts: {
      none: "",
      general: "Por favor, forneça um resumo deste conteúdo, destacando os pontos principais e as conclusões-chave. O output deve ser em português.",
      detailed: "Por favor, forneça uma análise detalhada deste conteúdo, incluindo tópicos principais, conclusões e detalhes importantes. O output deve ser em português.",
      bullet: "Por favor, resuma este conteúdo em tópicos, destacando as informações principais. O output deve ser em português.",
      section: "Por favor, divida este conteúdo em seções principais e forneça um resumo para cada seção. O output deve ser em português."
    }
  },
  es: {
    buttonText: "Copiar Transcripción",
    loadingText: "Copiando...",
    successText: (chars) => `¡Copiado ${formatCharCount(chars)} caracteres!`,
    errorTooLong: "Esta transcripción es muy larga. ¿Deseas activar la división automática?",
    partIndicator: "Parte {current} de {total}",
    copied: "¡copiado!",
    copyNext: "Copiar Siguiente Parte",
    splitOptions: {
      auto: "División automática para ChatGPT"
    },
    prompts: {
      none: "",
      general: "Por favor, proporciona un resumen de este contenido, destacando los puntos principales y las conclusiones clave. El output debe ser en español.",
      detailed: "Por favor, proporciona un análisis detallado de este contenido, incluyendo temas principales, conclusiones y detalles importantes. El output debe ser en español.",
      bullet: "Por favor, resume este contenido en puntos, destacando la información clave. El output debe ser en español.",
      section: "Por favor, divide este contenido en secciones principales y proporciona un resumen para cada sección. El output debe ser en español."
    }
  }
};

const formatCharCount = (count) => {
  if (count >= 1000) {
    return `${Math.round(count / 1000)}k`;
  }
  return count.toString();
};

const addCopyButton = async () => {
  // Check for existing button by our specific ID
  const existingButton = document.querySelector("#yt-transcript-copier-button");
  if (existingButton) return;

  const interfaceLanguage = await getInterfaceLanguage();
  
  // Find the FIRST like/dislike/share buttons container only
  const buttonsContainer = document.querySelector("#top-level-buttons-computed");
  if (!buttonsContainer) return;

  // Create button container to match YouTube's style
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "style-scope ytd-menu-renderer";
  buttonContainer.style.cssText = `
    margin-left: 8px;
    margin-right: -7.5px;
    padding: 0;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
  `;
  
  // Create button with YouTube's style and our specific ID
  const copyButton = document.createElement("button");
  copyButton.id = "yt-transcript-copier-button";
  copyButton.className = "yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-leading";
  copyButton.style.cssText = `
    margin: 0;
    padding-right: 16px;
  `;
  
  // Add success animation styles
  const style = document.createElement('style');
  style.textContent = `
    #yt-transcript-copier-button.success {
      background-color: #2ba640 !important;
      color: white !important;
      transition: all 0.3s ease;
    }
    #yt-transcript-copier-button.success svg {
      fill: white !important;
    }
    #yt-transcript-copier-button svg {
      fill: currentColor;
    }
  `;
  document.head.appendChild(style);

  // Create icon container
  const iconDiv = document.createElement("div");
  iconDiv.className = "yt-spec-button-shape-next__icon";
  iconDiv.innerHTML = `
    <svg height="24" viewBox="0 0 24 24" width="24" focusable="false">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
    </svg>
  `;

  // Create text container
  const textDiv = document.createElement("div");
  textDiv.className = "yt-spec-button-shape-next__button-text-content";
  textDiv.textContent = translations[interfaceLanguage].buttonText;

  // Assemble button
  copyButton.appendChild(iconDiv);
  copyButton.appendChild(textDiv);
  buttonContainer.appendChild(copyButton);
  
  // Insert button after the share button
  buttonsContainer.appendChild(buttonContainer);

  // Add click event listener
  copyButton.addEventListener("click", async () => {
    try {
      const currentScroll = window.scrollY;
      textDiv.textContent = translations[interfaceLanguage].loadingText;
      copyButton.disabled = true;

      let transcriptPanel = document.querySelector(
        "ytd-transcript-segment-list-renderer"
      );
      
      if (!transcriptPanel) {
        // First try by aria-label in different languages
        let transcriptButton = document.querySelector(
          'button[aria-label="Show transcript"], button[aria-label="Mostrar transcrição"], button[aria-label="Mostrar transcripción"]'
        );
        
        // If not found by aria-label, try by the exact YouTube class structure
        if (!transcriptButton) {
          transcriptButton = document.querySelector(
            '#button-container ytd-button-renderer button.yt-spec-button-shape-next--outline'
          );
          
          // Additional fallback using more specific selectors
          if (!transcriptButton) {
            transcriptButton = document.querySelector(
              'ytd-video-description-transcript-section-renderer ytd-button-renderer button.yt-spec-button-shape-next'
            );
          }
        }
        
        if (transcriptButton) {
          transcriptButton.click();
          // Wait for transcript panel to load
          await new Promise((resolve) => {
            const checkPanel = setInterval(() => {
              const panel = document.querySelector("ytd-transcript-segment-list-renderer");
              if (panel) {
                clearInterval(checkPanel);
                transcriptPanel = panel;
                resolve();
              }
            }, 100);
            // Timeout after 5 seconds
            setTimeout(() => {
              clearInterval(checkPanel);
              resolve();
            }, 5000);
          });
        }
      }
      
      if (transcriptPanel) {
        const segments = Array.from(transcriptPanel.querySelectorAll(
          "ytd-transcript-segment-renderer"
        )).map(segment => ({
          time: segment.querySelector(".segment-timestamp")?.textContent.trim() || "",
          text: segment.querySelector(".segment-text")?.textContent.trim() || ""
        }));

        const options = await chrome.storage.sync.get({
          includeTimestamps: true,
          promptLanguage: 'en',
          promptType: 'none',
          splitType: 'auto',
          llmModel: 'gpt35',
          customCharLimit: 13000
        });

        // Create the full text with timestamps if enabled
        const transcriptText = segments.map(segment => 
          options.includeTimestamps ? `${segment.time} ${segment.text}` : segment.text
        ).join('\n');

        // Add the selected prompt if one is chosen
        const selectedPrompt = translations[options.promptLanguage].prompts[options.promptType];
        const fullText = selectedPrompt 
          ? `${selectedPrompt}\n\n${transcriptText}`
          : transcriptText;

        await navigator.clipboard.writeText(fullText);

        // Show success animation
        copyButton.classList.add('success');
        textDiv.textContent = translations[interfaceLanguage].successText(fullText.length);
        
        setTimeout(() => {
          copyButton.classList.remove('success');
          textDiv.textContent = translations[interfaceLanguage].buttonText;
          copyButton.disabled = false;
        }, 2000);
      }

      window.scrollTo(0, currentScroll);

    } catch (error) {
      console.error("Error:", error);
      textDiv.textContent = translations[interfaceLanguage].buttonText;
      copyButton.disabled = false;
      copyButton.classList.remove('success');
    }
  });
};

// Function to check if we're on a video page
const isVideoPage = () => window.location.pathname.includes('/watch');

// Function to check if transcription is available
const isTranscriptionAvailable = () => {
  return !!document.querySelector("button[aria-label='Mostrar transcrição']");
};

// Initial check
if (isVideoPage()) {
  console.log('Video page detected'); // Debug log
  if (isTranscriptionAvailable()) {
    console.log('Transcription button found'); // Debug log
    addCopyButton();
  }
}

// Update the observer to be more specific
const observer = new MutationObserver((mutations) => {
  if (isVideoPage() && isTranscriptionAvailable()) {
    // Remove any duplicate buttons first
    const buttons = document.querySelectorAll("#yt-transcript-copier-button");
    if (buttons.length > 1) {
      // Keep only the first button, remove others
      for (let i = 1; i < buttons.length; i++) {
        buttons[i].remove();
      }
    }
    // Only add a new button if none exists
    if (buttons.length === 0) {
      addCopyButton();
    }
  }
});

// Make the observer more specific to reduce unnecessary checks
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});
  