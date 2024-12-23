console.log('Content script loaded'); // Debug log

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
    show: ({ message, type = 'info', duration = 3000, actions = [] }) => {
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

const addCopyButton = () => {
  const existingButton = document.querySelector("#copy-transcription-button");
  if (existingButton) return;

  // Find the like/dislike/share buttons container
  const buttonsContainer = document.querySelector("#top-level-buttons-computed");
  if (!buttonsContainer) return;

  // Create button container to match YouTube's style
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "style-scope ytd-menu-renderer";
  buttonContainer.style.marginLeft = "8px"; // Add margin for spacing
  
  // Create button with YouTube's style
  const copyButton = document.createElement("button");
  copyButton.id = "copy-transcription-button";
  copyButton.className = "yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-leading";
  
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
  
  // Add spinner animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    #copy-transcription-button.success {
      background-color: #2ba640 !important;
      color: white !important;
    }
  `;
  document.head.appendChild(style);

  // Detect page language and set initial button text
  const pageLang = document.documentElement.lang.split('-')[0] || 'en';
  const translations = {
    en: {
      buttonText: "Copy Transcript",
      loadingText: "Copying...",
      successText: (chars) => `Copied ${formatCharCount(chars)} chars!`,
      prompts: {
        general: "Summarize the following YouTube video transcript in English, highlighting the main points and key takeaways:",
        detailed: "Provide a detailed analysis in English of the following YouTube video transcript, including key topics discussed and any conclusions drawn:",
        bullet: "Summarize the following transcript into concise bullet points in English, emphasizing the most important information:",
        section: "Divide the following transcript into its main sections and provide a brief summary for each in English:"
      },
      splitOptions: {
        title: "Split Options",
        auto: "Auto-split for ChatGPT",
        manual: "Manual split (minutes)",
        none: "No split"
      },
      partIndicator: "Part {current} of {total}",
      errorTooLong: "Warning: This transcript might be too long for ChatGPT",
      copied: "copied to clipboard",
      copyNext: "Copy Next Part",
      errorTooLong: "This transcript is too long for ChatGPT. Would you like to enable auto-splitting?"
    },
    pt: {
      buttonText: "Copiar Transcrição",
      loadingText: "Copiando...",
      successText: (chars) => `Copiado ${formatCharCount(chars)} caracteres!`,
      prompts: {
        general: "Resuma em português a seguinte transcrição do vídeo do YouTube, destacando os pontos principais e as principais conclusões:",
        detailed: "Forneça uma análise detalhada em português da seguinte transcrição do vídeo do YouTube, incluindo os principais tópicos discutidos e quaisquer conclusões tiradas:",
        bullet: "Resuma em português a seguinte transcrição em tópicos concisos, enfatizando as informações mais importantes:",
        section: "Divida a seguinte transcrição em suas seções principais e forneça um breve resumo em português para cada uma:"
      },
      splitOptions: {
        title: "Opções de Divisão",
        auto: "Divisão automática para ChatGPT",
        manual: "Divisão manual (minutos)",
        none: "Sem divisão"
      },
      partIndicator: "Parte {current} de {total}",
      errorTooLong: "Aviso: Esta transcrição pode ser muito longa para o ChatGPT",
      copied: "copiado para a área de transferência",
      copyNext: "Copiar Próxima Parte",
      errorTooLong: "Esta transcrição é muito longa para o ChatGPT. Deseja ativar a divisão automática?"
    },
    es: {
      buttonText: "Copiar Transcripción",
      loadingText: "Copiando...",
      successText: (chars) => `¡Copiado ${formatCharCount(chars)} caracteres!`,
      prompts: {
        general: "Resume en español la siguiente transcripción del video de YouTube, destacando los puntos principales y las conclusiones clave:",
        detailed: "Proporciona un análisis detallado en español de la siguiente transcripción del video de YouTube, incluyendo los temas clave discutidos y las conclusiones extraídas:",
        bullet: "Resume en español la siguiente transcripción en puntos concisos, enfatizando la información más importante:",
        section: "Divide la siguiente transcripción en sus secciones principales y proporciona un breve resumen en español para cada una:"
      },
      splitOptions: {
        title: "Opciones de División",
        auto: "División automática para ChatGPT",
        manual: "División manual (minutos)",
        none: "Sin división"
      },
      partIndicator: "Parte {current} de {total}",
      errorTooLong: "Advertencia: Esta transcripción puede ser demasiado larga para ChatGPT",
      copied: "copiado al portapapeles",
      copyNext: "Copiar Siguiente Parte",
      errorTooLong: "Esta transcripción es demasiado larga para ChatGPT. ¿Desea activar la división automática?"
    }
  };

  textDiv.textContent = translations[pageLang]?.buttonText || translations.en.buttonText;

  // Assemble button
  copyButton.appendChild(iconDiv);
  copyButton.appendChild(textDiv);
  buttonContainer.appendChild(copyButton);
  
  // Insert button after the share button
  buttonsContainer.appendChild(buttonContainer);
  
  // Add this function to split transcript by character limit
  const getCharLimit = (options) => {
    if (options.splitType === 'manual') {
      return options.customCharLimit;
    }
    
    if (options.splitType === 'auto') {
      switch (options.llmModel) {
        case 'gpt4':
          return 400000;
        case 'gpt35':
          return 13000;
        case 'custom':
          return options.customCharLimit;
        default:
          return 13000;
      }
    }
    
    return Infinity;
  };

  const splitTranscript = (segments, options) => {
    const parts = [];
    let currentPart = [];
    let currentLength = 0;
    const maxChars = getCharLimit(options);

    for (const segment of segments) {
      const timeStr = options.includeTimestamps ? `${segment.time} ` : '';
      const segmentText = timeStr + segment.text;
      const segmentLength = segmentText.length + 1; // +1 for newline

      if (currentLength + segmentLength > maxChars && currentPart.length > 0) {
        parts.push(currentPart.join('\n'));
        currentPart = [segmentText];
        currentLength = segmentLength;
      } else {
        currentPart.push(segmentText);
        currentLength += segmentLength;
      }
    }

    if (currentPart.length > 0) {
      parts.push(currentPart.join('\n'));
    }

    return parts;
  };

  copyButton.addEventListener("click", async () => {
    try {
      const currentScroll = window.scrollY;
      textDiv.textContent = translations[pageLang].loadingText;
      copyButton.disabled = true;

      let transcriptPanel = document.querySelector(
        "ytd-transcript-segment-list-renderer"
      );
      
      if (!transcriptPanel) {
        const transcriptButton = document.querySelector(
          'button[aria-label="Mostrar transcrição"]'
        );
        
        if (transcriptButton) {
          transcriptButton.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          transcriptPanel = document.querySelector(
            "ytd-transcript-segment-list-renderer"
          );
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
          promptLanguage: pageLang,
          promptType: 'none',
          splitType: 'auto',
          llmModel: 'gpt35',
          customCharLimit: 13000
        });

        if (options.splitType === 'none') {
          // For "No Split", create a single part with the complete transcript
          const fullText = segments.map(segment => 
            options.includeTimestamps ? `${segment.time} ${segment.text}` : segment.text
          ).join('\n');

          let finalText = '';
          if (options.promptType !== 'none') {
            finalText += translations[options.promptLanguage].prompts[options.promptType] + '\n\n';
          }
          finalText += fullText;

          // Copy the text regardless of length
          await navigator.clipboard.writeText(finalText);
          
          // Show warning if too long, but still copy and animate
          if (finalText.length > 12000) {
            notify.show({
              message: translations[pageLang].errorTooLong,
              type: 'warning',
              duration: 5000,
              actions: [
                {
                  label: translations[pageLang].splitOptions.auto,
                  onClick: () => {
                    chrome.storage.sync.set({ splitType: 'auto' });
                    copyButton.click();
                  }
                }
              ]
            });
          }

          // Show success animation
          copyButton.classList.add('success');
          textDiv.textContent = translations[pageLang].successText(finalText.length);
          
          setTimeout(() => {
            copyButton.classList.remove('success');
            textDiv.textContent = translations[pageLang].buttonText;
            copyButton.disabled = false;
          }, 2000);
          return;
        }

        // Both auto and manual now use the same splitting logic
        parts = splitTranscript(segments, options);

        // Calculate total characters before starting to copy
        const totalCharacters = parts.reduce((sum, part) => sum + part.length, 0);

        for (let i = 0; i < parts.length; i++) {
          let finalText = '';
          
          if (options.promptType !== 'none') {
            finalText += translations[options.promptLanguage].prompts[options.promptType] + '\n\n';
          }

          if (parts.length > 1) {
            finalText += translations[pageLang].partIndicator
              .replace('{current}', i + 1)
              .replace('{total}', parts.length) + '\n\n';
          }

          finalText += parts[i];

          await navigator.clipboard.writeText(finalText);
          
          if (parts.length > 1 && i < parts.length - 1) {
            await new Promise(resolve => {
              const notification = notify.show({
                message: `${translations[pageLang].partIndicator
                  .replace('{current}', i + 1)
                  .replace('{total}', parts.length)} ${translations[pageLang].copied}`,
                duration: 0,
                actions: [
                  {
                    label: translations[pageLang].copyNext,
                    onClick: () => {
                      notification.remove();
                      resolve();
                    }
                  }
                ]
              });
            });
          }

          // Only show success animation on the last part, but with total character count
          if (i === parts.length - 1) {
            copyButton.classList.add('success');
            textDiv.textContent = translations[pageLang].successText(totalCharacters);
            
            setTimeout(() => {
              copyButton.classList.remove('success');
              textDiv.textContent = translations[pageLang].buttonText;
              copyButton.disabled = false;
            }, 2000);
          }
        }
      }

      window.scrollTo(0, currentScroll);

    } catch (error) {
      console.error("Error:", error);
      textDiv.textContent = translations[pageLang].buttonText;
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

// Set up observer for dynamic content
const observer = new MutationObserver(() => {
  if (isVideoPage() && isTranscriptionAvailable()) {
    console.log('Transcription became available'); // Debug log
    addCopyButton();
  }
});

// Start observing with more specific options
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});

// Add this helper function
const formatCharCount = (count) => {
  if (count >= 1000) {
    return `${Math.round(count / 1000)}k`;
  }
  return count.toString();
};
  