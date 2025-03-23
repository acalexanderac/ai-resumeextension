# AI Webpage Summarizer Chrome Extension

A Chrome extension that uses Google's Gemini Pro API to summarize web pages and extract main topics.

## Features

- Beautiful UI with Tailwind CSS
- Secure API key storage
- Webpage content summarization
- Main topics extraction
- Loading states and error handling

## Setup

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. Get your Google API key and secret from the Google Cloud Console
6. Click the extension icon and enter your API credentials

## Usage

1. Navigate to any webpage you want to summarize
2. Click the extension icon
3. Click "Summarize Current Page"
4. Wait for the analysis to complete
5. View the summary and main topics

## Security

- API credentials are stored securely using Chrome's storage API
- Credentials are never exposed in the page content
- All API calls are made over HTTPS

## Requirements

- Google API key and secret
- Chrome browser
- Internet connection for API calls