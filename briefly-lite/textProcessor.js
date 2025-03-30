// Text processing utilities for Briefly Lite
class TextProcessor {
  constructor() {
    // Common stop words in English and Spanish
    this.stopWords = {
      en: new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']),
      es: new Set(['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'en', 'por', 'para', 'con', 'sin', 'sobre', 'entre', 'detrás', 'después'])
    };
  }

  // Calculate TF-IDF score for a word
  calculateTFIDF(word, document, allDocuments) {
    const tf = this.calculateTF(word, document);
    const idf = this.calculateIDF(word, allDocuments);
    return tf * idf;
  }

  // Calculate Term Frequency
  calculateTF(word, document) {
    const words = document.toLowerCase().split(/\s+/);
    const wordCount = words.filter(w => w === word.toLowerCase()).length;
    return wordCount / words.length;
  }

  // Calculate Inverse Document Frequency
  calculateIDF(word, documents) {
    const docsWithWord = documents.filter(doc => 
      doc.toLowerCase().includes(word.toLowerCase())
    ).length;
    return Math.log(documents.length / (docsWithWord + 1));
  }

  // Extract keywords using TF-IDF
  extractKeywords(text, language = 'en') {
    if (!text) return [];
    
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = {};
    
    // Count word frequencies
    words.forEach(word => {
      if (!this.stopWords[language].has(word) && word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Sort by frequency and get top keywords
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Extract important sentences
  extractImportantSentences(text, numSentences = 5) {
    if (!text) return [];
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceScores = sentences.map(sentence => {
      const words = sentence.toLowerCase().split(/\s+/);
      const score = words.reduce((acc, word) => {
        if (!this.stopWords.en.has(word) && word.length > 3) {
          return acc + 1;
        }
        return acc;
      }, 0);
      return { sentence, score };
    });

    return sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .map(item => item.sentence.trim());
  }

  // Clean HTML content
  cleanHTML(html) {
    if (!html) return '';
    
    // Remove script tags
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove style tags
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    // Remove comments
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    // Remove navigation elements
    html = html.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
    // Remove footer elements
    html = html.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
    // Remove header elements
    html = html.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');
    // Remove ads and social media elements
    html = html.replace(/<div[^>]*class="[^"]*(?:ad|social|share|follow)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
    
    return html;
  }

  // Extract main content from HTML
  extractMainContent(html) {
    if (!html) return '';
    
    // Clean HTML first
    html = this.cleanHTML(html);
    
    // Try to find main content area
    const mainContent = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                       html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                       html.match(/<div[^>]*class="[^"]*(?:content|article|post)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    
    if (mainContent) {
      return mainContent[1];
    }
    
    // If no main content found, return body content
    return html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  }

  // Generate summary
  generateSummary(text, language = 'en') {
    if (!text) {
      return {
        summary: '',
        keywords: []
      };
    }

    const importantSentences = this.extractImportantSentences(text);
    const keywords = this.extractKeywords(text, language);
    
    return {
      summary: importantSentences.join('\n\n'),
      keywords: keywords
    };
  }
}

// Export the TextProcessor class
export default TextProcessor; 