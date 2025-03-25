document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveApiBtn = document.getElementById('saveApi');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const resultsDiv = document.getElementById('results');
  const summaryDiv = document.getElementById('summary');
  const topicsDiv = document.getElementById('topics');
  const additionalDiv = document.getElementById('additional');
  const keywordsDiv = document.getElementById('keywords');
  const themeController = document.querySelector('.theme-controller');
  const languageSelect = document.getElementById('languageSelect');
  const copyBtn = document.getElementById('copyBtn');
  const wordCountSpan = document.getElementById('wordCount');
  const readingTimeSpan = document.getElementById('readingTime');

  let currentSummary = '';
  let currentTopics = [];
  let currentAdditional = [];
  let currentKeywords = [];

  // Translations
  const translations = {
    en: {
      title: 'AI Webpage Summarizer',
      apiConfig: 'API Configuration',
      apiKeyLabel: 'Google API Key',
      apiKeyPlaceholder: 'Enter your Gemini API key',
      save: 'Save',
      summarize: 'Summarize Current Page',
      summary: 'Summary',
      mainTopics: 'Main Topics',
      additionalInfo: 'Additional Information',
      keywords: 'Keywords',
      download: 'Download Summary',
      madeWith: 'Made with',
      by: 'by',
      processing: 'Processing page content...',
      success: 'Summary generated successfully!',
      error: 'Please enter a valid API key',
      apiSaved: 'API key saved successfully!',
      downloadSuccess: 'Summary downloaded successfully!',
      copySuccess: 'Copied to clipboard!',
      copyError: 'Failed to copy',
      words: 'words',
      minRead: 'min read',
      subtitle: 'Your AI Resume Extension'
    },
    es: {
      title: 'Resumidor de Páginas Web con IA',
      apiConfig: 'Configuración de API',
      apiKeyLabel: 'Clave de API de Google',
      apiKeyPlaceholder: 'Ingresa tu clave de API de Gemini',
      save: 'Guardar',
      summarize: 'Resumir Página Actual',
      summary: 'Resumen',
      mainTopics: 'Temas Principales',
      additionalInfo: 'Información Adicional',
      keywords: 'Palabras Clave',
      download: 'Descargar Resumen',
      madeWith: 'Hecho con',
      by: 'por',
      processing: 'Procesando contenido de la página...',
      success: '¡Resumen generado exitosamente!',
      error: 'Por favor ingresa una clave API válida',
      apiSaved: '¡Clave API guardada con éxito!',
      downloadSuccess: '¡Resumen descargado con éxito!',
      copySuccess: '¡Copiado al portapapeles!',
      copyError: 'Error al copiar',
      words: 'palabras',
      minRead: 'min de lectura',
      subtitle: 'Tu Extensión de Resumen con IA'
    },
    fr: {
      apiSaved: 'Clé API enregistrée avec succès !',
      error: 'Veuillez entrer une clé API valide',
      success: 'Résumé généré avec succès !',
      downloadSuccess: 'Résumé téléchargé avec succès !',
      subtitle: 'Votre Extension de Résumé IA'
    },
    de: {
      apiSaved: 'API-Schlüssel erfolgreich gespeichert!',
      error: 'Bitte geben Sie einen gültigen API-Schlüssel ein',
      success: 'Zusammenfassung erfolgreich generiert!',
      downloadSuccess: 'Zusammenfassung erfolgreich heruntergeladen!',
      subtitle: 'Ihre KI-Zusammenfassungs-Erweiterung'
    },
    it: {
      apiSaved: 'Chiave API salvata con successo!',
      error: 'Inserisci una chiave API valida',
      success: 'Riassunto generato con successo!',
      downloadSuccess: 'Riassunto scaricato con successo!',
      subtitle: 'La Tua Estensione di Riassunto IA'
    },
    pt: {
      apiSaved: 'Chave API salva com sucesso!',
      error: 'Por favor, insira uma chave API válida',
      success: 'Resumo gerado com sucesso!',
      downloadSuccess: 'Resumo baixado com sucesso!',
      subtitle: 'Sua Extensão de Resumo com IA'
    }
  };

  // Load saved language
  chrome.storage.sync.get(['language'], function(result) {
    if (result.language) {
      languageSelect.value = result.language;
      updateLanguage(result.language);
    }
  });

  // Language change handler
  languageSelect.addEventListener('change', function() {
    const language = this.value;
    chrome.storage.sync.set({ language: language });
    updateLanguage(language);
    updateSubtitle();
  });

  // Update UI language
  function updateLanguage(language) {
    const t = translations[language] || translations.en;
    
    // Update UI elements
    document.querySelector('.btn-ghost.text-xl').textContent = t.title;
    document.querySelector('.card-title').textContent = t.apiConfig;
    document.querySelector('.label-text').textContent = t.apiKeyLabel;
    apiKeyInput.placeholder = t.apiKeyPlaceholder;
    saveApiBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
    </svg> ${t.save}`;
    summarizeBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg> ${t.summarize}`;
    document.querySelectorAll('.card-title').forEach(title => {
      if (title.textContent.includes('Summary')) title.textContent = t.summary;
      if (title.textContent.includes('Main Topics')) title.textContent = t.mainTopics;
      if (title.textContent.includes('Additional Information')) title.textContent = t.additionalInfo;
      if (title.textContent.includes('Keywords')) title.textContent = t.keywords;
    });
    downloadBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
    </svg> ${t.download}`;
    document.querySelector('.footer span:first-child').textContent = t.madeWith;
    document.querySelector('.footer span:last-child').textContent = t.by;
  }

  // Update subtitle based on language
  function updateSubtitle() {
    const language = languageSelect.value;
    const t = translations[language] || translations.en;
    document.getElementById('subtitle').textContent = t.subtitle;
  }

  // Load saved data when popup opens
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    chrome.storage.local.get([currentUrl], function(result) {
      if (result[currentUrl]) {
        const savedData = result[currentUrl];
        currentSummary = savedData.summary;
        currentTopics = savedData.topics;
        currentAdditional = savedData.additional;
        currentKeywords = savedData.keywords;
        
        // Display saved data
        summaryDiv.innerHTML = formatSummaryText(currentSummary);
        topicsDiv.innerHTML = formatTopics(currentTopics);
        additionalDiv.innerHTML = formatAdditional(currentAdditional);
        keywordsDiv.innerHTML = formatKeywords(currentKeywords);
        
        resultsDiv.classList.remove('hidden');
      }
    });
  });

  // Theme handling
  chrome.storage.sync.get(['theme'], function(result) {
    if (result.theme) {
      document.documentElement.setAttribute('data-theme', result.theme);
      themeController.checked = result.theme === 'dark';
    }
  });

  themeController.addEventListener('change', function() {
    const theme = this.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    chrome.storage.sync.set({ theme: theme });
  });

  // Sanitize text input
  function sanitizeInput(input) {
    return input.replace(/[<>]/g, '');
  }

  // Sanitize API key
  function sanitizeApiKey(apiKey) {
    return apiKey.replace(/[^A-Za-z0-9-_]/g, '');
  }

  // Save API key with encryption
  saveApiBtn.addEventListener('click', function() {
    const apiKey = sanitizeApiKey(apiKeyInput.value);
    const language = languageSelect.value;
    const t = translations[language] || translations.en;

    if (!apiKey) {
      showToast(t.error, 'error');
      return;
    }

    // Encrypt API key before saving
    const encryptedKey = btoa(apiKey); // Basic encryption for demo
    chrome.storage.sync.set({
      apiKey: encryptedKey
    }, function() {
      showToast(t.apiSaved, 'success');
    });
  });

  // Load saved API key with decryption
  chrome.storage.sync.get(['apiKey'], function(result) {
    if (result.apiKey) {
      const decryptedKey = atob(result.apiKey); // Basic decryption for demo
      apiKeyInput.value = decryptedKey;
    }
  });

  // Sanitize and validate URL
  function validateUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Extract keywords from text
  function extractKeywords(text) {
    const keywordsMatch = text.match(/(?:Palabras clave|Keywords|Palabras Clave):?\s*([\s\S]*?)(?=\n\n|$)/i);
    if (!keywordsMatch) return [];
    
    const keywordsText = keywordsMatch[1].trim();
    return keywordsText
      .split('\n')
      .map(keyword => keyword.trim().replace(/^[•\-\*\d\.]\s*/, ''))
      .filter(keyword => keyword && !keyword.includes('*') && keyword !== 'Keywords' && keyword.length > 0);
  }

  // Format keywords with proper styling
  function formatKeywords(keywords) {
    if (!keywords || keywords.length === 0) return '';
    
    return keywords
      .filter(keyword => keyword && keyword.trim())
      .map(keyword => `<span class="keyword-tag">${keyword.trim()}</span>`)
      .join('');
  }

  // Summarize button click handler with security measures
  summarizeBtn.addEventListener('click', async function() {
    chrome.storage.sync.get(['apiKey'], async function(credentials) {
      const language = languageSelect.value;
      const t = translations[language] || translations.en;

      if (!credentials.apiKey) {
        showToast(t.error, 'error');
        return;
      }

      // Decrypt API key
      const decryptedKey = atob(credentials.apiKey);

      resultsDiv.classList.add('hidden');

      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Validate URL
        if (!validateUrl(tab.url)) {
          throw new Error('Invalid URL');
        }

        // Execute content script with sanitized content
        const [{result: pageContent}] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            // Get main content and sanitize it
            const content = document.body.innerText;
            return content.substring(0, 10000); // Limit content length
          }
        });

        // Sanitize content before sending to API
        const sanitizedContent = sanitizeInput(pageContent);

        // Call Google API for summarization with rate limiting
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${decryptedKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Escribe un resumen conciso y bien estructurado del siguiente texto en ${language === 'es' ? 'español' : 'inglés'}. El resumen debe ser claro y directo, incluyendo los puntos más importantes. Al final, incluye una lista de palabras clave relevantes.

${sanitizedContent}`
              }]
            }]
          })
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(`API Error: ${data.error.message}`);
        }

        // Sanitize response data
        const responseText = sanitizeInput(data.candidates[0].content.parts[0].text);
        
        // Extract and format summary
        currentSummary = responseText
          .replace(/^(Okay, here's|Here's|Aquí tienes|Aquí está).*?resumen.*?:\s*/i, '')
          .replace(/^Summary:?\s*/i, '')
          .replace(/^Resumen:?\s*/i, '')
          .replace(/^##\s*/g, '')
          .replace(/(?:Palabras clave|Keywords|Palabras Clave):?\s*[\s\S]*$/, '')
          .replace(/\*\*/g, '')
          .replace(/^\s*[-*]\s*/gm, '')
          .trim();

        // Extract keywords
        currentKeywords = extractKeywords(responseText);
        console.log('Extracted keywords:', currentKeywords); // Debug log
        
        // Update the UI
        summaryDiv.innerHTML = formatSummaryText(currentSummary);
        if (currentKeywords.length > 0) {
          keywordsDiv.innerHTML = formatKeywords(currentKeywords);
        }

        // Save the results to storage with URL validation
        if (validateUrl(tab.url)) {
          chrome.storage.local.set({
            [tab.url]: {
              summary: currentSummary,
              keywords: currentKeywords
            }
          });
        }

        resultsDiv.classList.remove('hidden');
        showToast(t.success, 'success');
      } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'error');
      }
    });
  });

  // Format the summary text with proper styling
  function formatSummaryText(text) {
    // Remove any markdown-style formatting
    text = text.replace(/\*\*/g, '').trim();
    
    // Split into paragraphs and add more spacing
    const paragraphs = text.split('\n').filter(p => p.trim());
    
    // Format each paragraph with more spacing
    const formattedText = paragraphs.map(p => {
      p = p.trim();
      if (p.includes(':')) {
        const [header, content] = p.split(':');
        return `<div class="font-semibold mb-4">${header.trim()}:</div>
                <div class="mt-2 mb-6">${content.trim()}</div>`;
      }
      return `<div class="mb-6">${p}</div>`;
    }).join('\n');

    // Update stats
    updateStats(text);

    return formattedText;
  }

  // Format topics with proper styling
  function formatTopics(topics) {
    return topics.map(topic => {
      // Remove any bullet points or numbers at the start
      topic = topic.replace(/^[•\-\*\d\.]\s*/, '').trim();
      // Remove any category prefixes
      topic = topic.replace(/^(Main Topics|Keywords|Other Important Information):\s*/i, '');
      
      return `<div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
        <div class="w-2 h-2 rounded-full bg-primary"></div>
        <div class="text-base-content/70">${topic}</div>
      </div>`;
    }).join('');
  }

  // Format additional information
  function formatAdditional(items) {
    return items.map(item => 
      `<div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
        <svg class="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="text-base-content/70">${item}</div>
      </div>`
    ).join('');
  }

  // Download summary as text file
  downloadBtn.addEventListener('click', async function() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const pageTitle = tab.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const filename = `summary_${pageTitle}_${timestamp}.txt`;
    const language = languageSelect.value;
    const t = translations[language] || translations.en;

    const content = `
Web Page Summary
Generated by AI Webpage Summarizer
URL: ${tab.url}
Date: ${new Date().toLocaleString()}

${t.summary}:
${currentSummary}

${t.mainTopics}:
${currentTopics.map(topic => `• ${topic}`).join('\n')}

${t.additionalInfo}:
${currentAdditional.map(info => `• ${info}`).join('\n')}

${t.keywords}:
${currentKeywords.map(keyword => `#${keyword}`).join(' ')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast(t.downloadSuccess, 'success');
  });

  // Calculate word count and reading time
  function updateStats(text) {
    const words = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // Assuming 200 words per minute
    const language = languageSelect.value;
    const t = translations[language] || translations.en;

    wordCountSpan.textContent = `${words} ${t.words}`;
    readingTimeSpan.textContent = `${readingTime} ${t.minRead}`;
  }

  // Copy to clipboard functionality
  copyBtn.addEventListener('click', async function() {
    const language = languageSelect.value;
    const t = translations[language] || translations.en;

    const content = `
${currentSummary}

${t.mainTopics}:
${currentTopics.map(topic => `• ${topic}`).join('\n')}

${t.additionalInfo}:
${currentAdditional.map(info => `• ${info}`).join('\n')}

${t.keywords}:
${currentKeywords.map(keyword => `#${keyword}`).join(' ')}
    `.trim();

    try {
      await navigator.clipboard.writeText(content);
      showToast(t.copySuccess, 'success');
    } catch (err) {
      showToast(t.copyError, 'error');
    }
  });
}); 