import TextProcessor from './textProcessor.js';

// Initialize text processor
const textProcessor = new TextProcessor();

// DOM Elements
const summarizeBtn = document.getElementById('summarizeBtn');
const resultsDiv = document.getElementById('results');
const summaryDiv = document.getElementById('summary');
const keywordsDiv = document.getElementById('keywords');
const wordCountDiv = document.getElementById('wordCount');
const readingTimeDiv = document.getElementById('readingTime');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const languageSelect = document.getElementById('languageSelect');
const themeController = document.querySelector('.theme-controller');

// Check if all required elements are present
if (!summarizeBtn || !resultsDiv || !summaryDiv || !keywordsDiv || 
    !wordCountDiv || !readingTimeDiv || !copyBtn || !downloadBtn || 
    !languageSelect || !themeController) {
    console.error('Some required DOM elements are missing');
}

// Theme handling
function setTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme === 'dark');
if (themeController) {
    themeController.checked = savedTheme === 'dark';
}

// Theme toggle
if (themeController) {
    themeController.addEventListener('change', (e) => {
        setTheme(e.target.checked);
    });
}

// Language handling
function setLanguage(lang) {
    localStorage.setItem('language', lang);
    updateUI(lang);
}

function updateUI(lang) {
    const translations = {
        en: {
            generate: 'Generate Summary',
            wordCount: 'Word Count',
            readingTime: 'Reading Time',
            summary: 'Summary',
            keywords: 'Keywords',
            copy: 'Copy',
            download: 'Download',
            error: 'Error generating summary. Please try again.'
        },
        es: {
            generate: 'Generar Resumen',
            wordCount: 'Conteo de Palabras',
            readingTime: 'Tiempo de Lectura',
            summary: 'Resumen',
            keywords: 'Palabras Clave',
            copy: 'Copiar',
            download: 'Descargar',
            error: 'Error al generar el resumen. Por favor, inténtelo de nuevo.'
        }
    };

    const t = translations[lang];
    if (summarizeBtn) summarizeBtn.textContent = t.generate;
    
    const statTitles = document.querySelectorAll('.stat-title');
    if (statTitles.length >= 2) {
        statTitles[0].textContent = t.wordCount;
        statTitles[1].textContent = t.readingTime;
    }
    
    const cardTitles = document.querySelectorAll('.card-title');
    if (cardTitles.length >= 2) {
        cardTitles[0].textContent = t.summary;
        cardTitles[1].textContent = t.keywords;
    }
    
    if (copyBtn) copyBtn.textContent = t.copy;
    if (downloadBtn) downloadBtn.textContent = t.download;
}

// Initialize language
const savedLang = localStorage.getItem('language') || 'en';
if (languageSelect) {
    languageSelect.value = savedLang;
    updateUI(savedLang);

    languageSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });
}

// Clean text function
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/class="[^"]*"/g, '')
        .replace(/data-testid="[^"]*"/g, '')
        .replace(/sc-[a-f0-9-]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Generate summary
summarizeBtn.addEventListener('click', async () => {
    try {
        // Show loading state
        summarizeBtn.disabled = true;
        summarizeBtn.innerHTML = '<span class="loading loading-spinner"></span> Generating...';
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                // Remove unwanted elements first
                const clone = document.body.cloneNode(true);
                const unwantedSelectors = [
                    'script', 'style', 'nav', 'header', 'footer',
                    '.nav', '.header', '.footer', '.ad', '.social',
                    '.share', '.follow', '.sidebar', '.menu', '.navigation',
                    '.sponsored', '.advertisement', '.ads', '.related',
                    '.comments', '.newsletter', '.cookie-notice',
                    '[role="complementary"]', '[role="navigation"]',
                    '[role="banner"]', '[role="contentinfo"]',
                    '.social-share', '.social-buttons', '.social-links',
                    '.newsletter-signup', '.cookie-banner', '.ad-container',
                    '.sponsored-content', '.related-articles', '.popular-articles',
                    '.trending-articles', '.most-read', '.recommended',
                    '.news-grid', '.news-list', '.news-feed',
                    '.weather-widget', '.weather-forecast',
                    '.portada', '.front-page', '.home-page',
                    '.breaking-news', '.latest-news',
                    '.newsletter-box', '.subscription-box',
                    '.ad-box', '.promo-box', '.sponsored-box',
                    '.social-box', '.share-box', '.comment-box',
                    '.related-box', '.popular-box', '.trending-box',
                    '.newsletter-signup-box', '.cookie-notice-box',
                    '.weather-box', '.portada-box', '.front-page-box',
                    '.breaking-news-box', '.latest-news-box',
                    '.author-box', '.byline', '.date',
                    '.newsletter-signup', '.subscription',
                    '.advertisement', '.sponsored',
                    '.related-content', '.popular-content',
                    '.trending-content', '.most-read-content',
                    '.recommended-content', '.news-grid-content',
                    '.news-list-content', '.news-feed-content',
                    '.weather-content', '.portada-content',
                    '.front-page-content', '.home-page-content',
                    '.breaking-news-content', '.latest-news-content'
                ];

                unwantedSelectors.forEach(selector => {
                    const elements = clone.querySelectorAll(selector);
                    elements.forEach(el => el.remove());
                });

                // Try to find the main content area
                const selectors = [
                    'article',
                    'main',
                    '[role="main"]',
                    '.content',
                    '.article',
                    '.post',
                    '#content',
                    '#article',
                    '#post',
                    '.main-content',
                    '#main-content',
                    '.article-content',
                    '.post-content',
                    '.entry-content',
                    '.story-content',
                    '.news-content',
                    '.article-body',
                    '.post-body',
                    '.entry-body',
                    '.story-body',
                    '.news-body',
                    '.article-text',
                    '.post-text',
                    '.entry-text',
                    '.story-text',
                    '.news-text',
                    '.article-main',
                    '.post-main',
                    '.entry-main',
                    '.story-main',
                    '.news-main'
                ];

                let content = '';
                
                // Try each selector
                for (const selector of selectors) {
                    const element = clone.querySelector(selector);
                    if (element) {
                        content = element.innerText;
                        break;
                    }
                }

                // If no content found, try to get the body content
                if (!content) {
                    content = clone.innerText;
                }

                // Clean up the content
                content = content
                    .replace(/\s+/g, ' ')
                    .replace(/\n+/g, '\n')
                    .replace(/Patrocinado|Sponsored|Advertisement|Anuncio/g, '')
                    .replace(/RRSS|Social Media|Share/g, '')
                    .replace(/Comentar|Comment|Compartir|Share/g, '')
                    .replace(/Lo más leído|Most Read|Popular|Trending/g, '')
                    .replace(/Contenido para ti|Content for you|Recommended/g, '')
                    .replace(/Registrarse|Sign up|Subscribe/g, '')
                    .replace(/Clic|Click|Ver más|Read more/g, '')
                    .replace(/URL|Link|Enlace/g, '')
                    .replace(/\d+\s*min\s*read/g, '')
                    .replace(/\d+\s*palabras/g, '')
                    .replace(/\d+\s*words/g, '')
                    .replace(/\d{1,2}\s*[A-Z]{3}\s*\d{4}/g, '')
                    .replace(/\d{1,2}:\d{2}/g, '')
                    .replace(/\d{1,2}\s*[A-Z]{3}\s*\d{4}\s*\d{1,2}:\d{2}/g, '')
                    .replace(/El tiempo en|Weather in|Forecast for/g, '')
                    .replace(/Noticias relacionadas|Related news|More news/g, '')
                    .replace(/Lo último|Latest|Breaking/g, '')
                    .replace(/VIDA Y ESTILO|LIFE AND STYLE/g, '')
                    .replace(/FUNDAE|Sponsored|Advertisement/g, '')
                    .replace(/Deshacer|Undo|Close/g, '')
                    .replace(/Copiar|Copy|Link/g, '')
                    .replace(/Cerrar|Close|Exit/g, '')
                    .replace(/Noticia guardada|Saved news|Bookmarked/g, '')
                    .replace(/Ver noticias guardadas|View saved news|View bookmarks/g, '')
                    .replace(/Aceléralo gratis|Speed up for free/g, '')
                    .replace(/Outbyte Driver Updater|Driver Updater/g, '')
                    .replace(/Ofertas de Cruceros|Cruise Offers/g, '')
                    .replace(/Cruceros todo incluido|All-inclusive Cruises/g, '')
                    .replace(/propelvibeline|CFD Trading/g, '')
                    .replace(/Regístrese ahora|Sign up now/g, '')
                    .replace(/aprenda a beneficiarse|learn to benefit/g, '')
                    .replace(/de los mejores valores|from the best values/g, '')
                    .replace(/del mercado|of the market/g, '')
                    .replace(/Más información|More information/g, '')
                    .replace(/Comenta esta noticia|Comment on this news/g, '')
                    .replace(/WhatsApp|Facebook|Twitter|email/g, '')
                    .replace(/La portada de|The cover of|Front page of/g, '')
                    .replace(/EL PERIÓDICO|THE NEWSPAPER/g, '')
                    .replace(/\d{1,2}\s+de\s+[A-Za-z]+\s+de\s+\d{4}/g, '')
                    .replace(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/g, '')
                    .replace(/\d{1,2}\s+[A-Za-z]+/g, '')
                    .replace(/\d{4}/g, '')
                    .replace(/\d{1,2}/g, '')
                    .replace(/Por qué confiar en|Why trust in/g, '')
                    .replace(/Periodista|Journalist/g, '')
                    .replace(/ventana emergente|popup window/g, '')
                    .replace(/\s+/g, ' ')
                    .replace(/\n+/g, '\n')
                    .replace(/([.!?])\s*/g, '$1\n\n')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();

                return content;
            }
        });

        if (!result) {
            throw new Error('No content found');
        }

        // Clean and process content
        const cleanContent = cleanText(result);
        if (!cleanContent) {
            throw new Error('No content after cleaning');
        }

        const { summary, keywords } = textProcessor.generateSummary(cleanContent, savedLang);
        const wordCount = cleanContent.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

        // Update UI
        summaryDiv.innerHTML = summary.split('\n').map(p => `<p>${p}</p>`).join('');
        keywordsDiv.innerHTML = keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('');
        wordCountDiv.textContent = `${wordCount} words`;
        readingTimeDiv.textContent = `${readingTime} min read`;
        resultsDiv.classList.remove('hidden');
        resultsDiv.classList.add('animate-fade-in');
    } catch (error) {
        console.error('Error generating summary:', error);
        const t = savedLang === 'en' ? 'Error generating summary. Please try again.' : 'Error al generar el resumen. Por favor, inténtelo de nuevo.';
        summaryDiv.innerHTML = `<p class="text-error">${t}</p>`;
        resultsDiv.classList.remove('hidden');
    } finally {
        // Reset button state
        summarizeBtn.disabled = false;
        summarizeBtn.textContent = savedLang === 'en' ? 'Generate Summary' : 'Generar Resumen';
    }
});

// Copy functionality
copyBtn.addEventListener('click', () => {
    const text = `${summaryDiv.innerText}\n\nKeywords: ${Array.from(keywordsDiv.children).map(k => k.textContent).join(', ')}`;
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>Copy';
        }, 2000);
    });
});

// Download functionality
downloadBtn.addEventListener('click', () => {
    const text = `${summaryDiv.innerText}\n\nKeywords: ${Array.from(keywordsDiv.children).map(k => k.textContent).join(', ')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}); 