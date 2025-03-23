document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveApiBtn = document.getElementById('saveApi');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const loadingDiv = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');
  const summaryDiv = document.getElementById('summary');
  const topicsDiv = document.getElementById('topics');

  // Load saved API key
  chrome.storage.sync.get(['apiKey'], function(result) {
    if (result.apiKey) apiKeyInput.value = result.apiKey;
  });

  // Save API key
  saveApiBtn.addEventListener('click', function() {
    const apiKey = apiKeyInput.value;

    if (!apiKey) {
      alert('Please enter your Google API key');
      return;
    }

    chrome.storage.sync.set({
      apiKey: apiKey
    }, function() {
      alert('API key saved successfully!');
    });
  });

  // Summarize button click handler
  summarizeBtn.addEventListener('click', async function() {
    // Check if API key is set
    chrome.storage.sync.get(['apiKey'], async function(credentials) {
      if (!credentials.apiKey) {
        alert('Please save your Google API key first');
        return;
      }

      // Show loading state
      loadingDiv.classList.remove('hidden');
      resultsDiv.classList.add('hidden');

      try {
        // Get the current tab's content
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Execute content script to get page content
        const [{result: pageContent}] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            // Get main content, excluding scripts, styles, and other non-content elements
            const content = document.body.innerText;
            return content;
          }
        });

        console.log('API Key being used:', credentials.apiKey.substring(0, 5) + '...');
        console.log('Content length:', pageContent.length);

        // Call Google API for summarization
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${credentials.apiKey}`;
        console.log('API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Please analyze this text and provide:
                1. A concise summary (2-3 sentences)
                2. The main topics discussed (as a list)
                
                Text to analyze: ${pageContent}`
              }]
            }]
          })
        });

        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.error) {
          throw new Error(`API Error: ${data.error.message}\nDetails: ${JSON.stringify(data.error)}`);
        }

        // Parse the response and display results
        const responseText = data.candidates[0].content.parts[0].text;
        const [summary, topics] = responseText.split('\n\n');
        
        summaryDiv.textContent = summary;
        topicsDiv.innerHTML = topics.split('\n').map(topic => 
          `<div class="topic-item">
            <span class="topic-dot"></span>
            <span class="topic-text">${topic}</span>
          </div>`
        ).join('');

        resultsDiv.classList.remove('hidden');
      } catch (error) {
        console.error('Full error:', error);
        alert(`Error: ${error.message}\n\nPlease check the console for more details.`);
      } finally {
        loadingDiv.classList.add('hidden');
      }
    });
  });
}); 