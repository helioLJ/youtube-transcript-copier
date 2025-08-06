console.log('Content script loaded for YouTube Transcript Copier v1.0'); // Debug log

// Debug function to check current page state
const debugPageState = () => {
  console.log('=== YouTube Transcript Copier Debug ===');
  console.log('Current URL:', window.location.href);
  console.log('Is video page:', isVideoPage());
  console.log('Transcript available:', isTranscriptionAvailable());
  console.log('Existing button:', !!document.querySelector("#yt-transcript-copier-button"));
  
  // Check for transcript button variants
  const transcriptButtons = [
    "button[aria-label*='transcript']",
    "button[aria-label*='Transcript']", 
    "button[aria-label*='transcrição']",
    "button[aria-label*='transcripción']",
    "ytd-video-description-transcript-section-renderer button"
  ];
  
  transcriptButtons.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`Found transcript button with selector "${selector}":`, elements[0]);
    }
  });
  
  // Check for button containers
  const containers = [
    "#top-level-buttons-computed",
    "#menu-container #top-level-buttons",
    "#actions #top-level-buttons-computed"
  ];
  
  containers.forEach(selector => {
    const container = document.querySelector(selector);
    console.log(`Container "${selector}":`, !!container);
  });
  
  console.log('=======================================');
};

// Get interface language from storage
const getInterfaceLanguage = async () => {
  const result = await chrome.storage.sync.get({
    interfaceLanguage: 'en'
  });
  return result.interfaceLanguage;
};

// Create notification system
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
const notify = createNotificationSystem().show;

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
  const existingButton = document.querySelector("#yt-transcript-copier-button");
  if (existingButton) return;

  const interfaceLanguage = await getInterfaceLanguage();
  
  // Try multiple possible button containers
  const possibleContainers = [
    "#top-level-buttons-computed",
    "#menu-container #top-level-buttons",
    ".ytd-menu-renderer #top-level-buttons-computed",
    "#actions #top-level-buttons-computed",
    "#actions-inner #top-level-buttons-computed"
  ];
  
  let buttonsContainer = null;
  for (const selector of possibleContainers) {
    buttonsContainer = document.querySelector(selector);
    if (buttonsContainer) break;
  }
  
  if (!buttonsContainer) {
    console.log("Could not find buttons container");
    return;
  }

  // Create the button
  const copyButton = document.createElement("button");
  copyButton.id = "yt-transcript-copier-button";
  copyButton.className = "yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-button";
  copyButton.setAttribute("aria-label", "Copy Transcript");
  copyButton.style.marginRight = "8px"; // Add right margin
  
  // Set icon-only button HTML
  copyButton.innerHTML = `
    <div class="yt-spec-button-shape-next__icon" aria-hidden="true">
      <svg height="24" viewBox="0 0 24 24" width="24" focusable="false">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
      </svg>
    </div>
  `;

  // Insert as first child of the buttons container
  buttonsContainer.insertBefore(copyButton, buttonsContainer.firstChild);

  // Add click event listener
  copyButton.addEventListener("click", async () => {
    // Get current settings
    const settings = await chrome.storage.sync.get({
      includeTimestamps: true,
      promptLanguage: 'en',
      promptType: 'none',
      splitType: 'auto',
      llmModel: 'gpt35',
      customCharLimit: 13000
    });

    // Find and click the transcript button if it exists
    const transcriptSelectors = [
      "ytd-video-description-transcript-section-renderer button",
      "button[aria-label*='transcript']",
      "button[aria-label*='Transcript']",
      "button[aria-label*='transcrição']",
      "button[aria-label*='transcripción']",
      "[aria-label*='Show transcript']",
      "[aria-label*='Mostrar transcrição']",
      "[aria-label*='Mostrar transcripción']"
    ];
    
    let transcriptButton = null;
    for (const selector of transcriptSelectors) {
      transcriptButton = document.querySelector(selector);
      if (transcriptButton) break;
    }
    
    if (transcriptButton) {
      transcriptButton.click();
    }

    // Wait for transcript panel to open and content to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get transcript text with better error handling
    const transcriptSegmentSelectors = [
      "ytd-transcript-segment-renderer",
      ".ytd-transcript-segment-renderer",
      "[role='button'] .ytd-transcript-segment-renderer"
    ];
    
    let transcriptItems = [];
    for (const selector of transcriptSegmentSelectors) {
      transcriptItems = document.querySelectorAll(selector);
      if (transcriptItems.length > 0) break;
    }
    
    if (transcriptItems.length === 0) {
      console.error("No transcript segments found. Available selectors:", 
        transcriptSegmentSelectors.map(s => document.querySelectorAll(s).length));
      notify({
        message: "No transcript found. Make sure transcripts are available for this video.",
        type: 'warning'
      });
      return;
    }
    
    console.log(`Found ${transcriptItems.length} transcript segments`); // Debug log

    // Build transcript text with optional timestamps
    const transcriptText = Array.from(transcriptItems)
      .map(segment => {
        const textElement = segment.querySelector("[class*='segment-text']") || 
                           segment.querySelector("#content") ||
                           segment.querySelector("#text");
        const timestampElement = segment.querySelector("[class*='segment-timestamp']") ||
                                segment.querySelector("#timestamp");
        
        const text = textElement ? textElement.textContent.trim() : '';
        const timestamp = timestampElement ? timestampElement.textContent.trim() : '';
        
        return settings.includeTimestamps ? `${timestamp} ${text}` : text;
      })
      .filter(text => text)
      .join("\n");

    // Add prompt if selected
    let finalText = transcriptText;
    if (settings.promptType !== 'none') {
      const prompt = translations[settings.promptLanguage].prompts[settings.promptType];
      finalText = `${prompt}\n\n${transcriptText}`;
    }

    // Handle text splitting if auto-split is enabled
    if (settings.splitType === 'auto') {
      const charLimit = settings.llmModel === 'gpt4' ? 400000 :
                       settings.llmModel === 'gpt35' ? 13000 :
                       settings.customCharLimit;

      if (finalText.length > charLimit) {
        const parts = splitText(finalText, charLimit);
        let currentPart = 0;

        const copyNextPart = async () => {
          await navigator.clipboard.writeText(parts[currentPart]);
          
          if (currentPart < parts.length - 1) {
            notify({
              message: translations[settings.promptLanguage].partIndicator
                .replace('{current}', currentPart + 1)
                .replace('{total}', parts.length),
              type: 'info',
              duration: 0,
              actions: [{
                label: translations[settings.promptLanguage].copyNext,
                onClick: () => {
                  currentPart++;
                  copyNextPart();
                }
              }]
            });
          } else {
            notify({
              message: translations[settings.promptLanguage].successText(finalText.length),
              type: 'success'
            });
          }
        };

        // Start copying the first part immediately
        copyNextPart();
        return;
      }
    }

    // Copy to clipboard if no splitting needed
    try {
      await navigator.clipboard.writeText(finalText);
      notify({
        message: translations[settings.promptLanguage].successText(finalText.length),
        type: 'success'
      });
    } catch (err) {
      console.error("Failed to copy transcript:", err);
    }
  });
};

// Helper function to split text
const splitText = (text, limit) => {
  const parts = [];
  let currentPart = '';
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if ((currentPart + sentence).length > limit) {
      if (currentPart) {
        parts.push(currentPart.trim());
        currentPart = '';
      }
      if (sentence.length > limit) {
        // Handle very long sentences by splitting at spaces
        const words = sentence.split(/\s+/);
        let chunk = '';
        for (const word of words) {
          if ((chunk + ' ' + word).length > limit) {
            parts.push(chunk.trim());
            chunk = word;
          } else {
            chunk = chunk ? chunk + ' ' + word : word;
          }
        }
        if (chunk) {
          currentPart = chunk + ' ';
        }
      } else {
        currentPart = sentence + ' ';
      }
    } else {
      currentPart += sentence + ' ';
    }
  }

  if (currentPart) {
    parts.push(currentPart.trim());
  }

  return parts;
};

// Function to check if we're on a video page
const isVideoPage = () => window.location.pathname.includes('/watch');

// Function to check if transcription is available
const isTranscriptionAvailable = () => {
  // Check for transcript button with various language labels
  const transcriptSelectors = [
    "button[aria-label*='transcript']",
    "button[aria-label*='Transcript']", 
    "button[aria-label*='transcrição']",
    "button[aria-label*='transcripción']",
    "button[aria-label*='transkription']",
    "button[aria-label*='字幕']",
    "ytd-video-description-transcript-section-renderer button",
    "[aria-label*='Show transcript']",
    "[aria-label*='Mostrar transcrição']",
    "[aria-label*='Mostrar transcripción']"
  ];
  
  return transcriptSelectors.some(selector => document.querySelector(selector));
};

// Initial check with retry mechanism
const initializeButton = () => {
  debugPageState(); // Debug current state
  
  if (isVideoPage()) {
    console.log('Video page detected'); // Debug log
    
    // Wait for page to fully load, then check multiple times
    const checkTranscript = (attempt = 0) => {
      if (attempt > 10) {
        console.log('Max attempts reached, transcript may not be available');
        return;
      }
      
      if (isTranscriptionAvailable()) {
        console.log('Transcription button found'); // Debug log
        addCopyButton();
      } else {
        console.log(`Transcript check attempt ${attempt + 1}/10`); // Debug log
        setTimeout(() => checkTranscript(attempt + 1), 1000); // Retry every second
      }
    };
    
    // Start checking after a brief delay
    setTimeout(() => checkTranscript(), 2000);
  }
};

// Add manual debug function accessible from console
window.debugYouTubeTranscriptCopier = debugPageState;

initializeButton();

// Update the observer to be more specific and handle navigation
const observer = new MutationObserver((mutations) => {
  // Check for URL changes (YouTube is a SPA)
  if (window.location.href !== observer.lastUrl) {
    observer.lastUrl = window.location.href;
    if (isVideoPage()) {
      // New video loaded, reinitialize
      setTimeout(() => {
        if (isTranscriptionAvailable()) {
          addCopyButton();
        }
      }, 3000); // Wait longer for new video to load
    }
  }
  
  // Also check if transcript becomes available on current page
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

// Initialize the observer's URL tracking
observer.lastUrl = window.location.href;

// Make the observer more specific to reduce unnecessary checks
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});
  
