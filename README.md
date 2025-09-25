# Permit AI Helper (Chrome Extension)

Permit AI Helper is a browser extension for Chromium-based browsers that adds an AI assistant sidebar to any webpage. The assistant is tuned for environmental review and permitting workflows: it can analyze forms, explain fields, and draft or refine text directly inside the page.

## Features

- **Persistent assistant sidebar** – Opens alongside the current tab without blocking the page. You can toggle it using the “Permit AI” tab.
- **Form discovery** – Automatically detects inputs, textareas, and selects. Each field shows quick actions to focus, request guidance, or improve the existing answer.
- **On-page editing** – Accepted improvements are written back into the form and trigger standard `input`/`change` events for compatibility with validation scripts.
- **Context-aware prompts** – Sends the page URL, title, and recent field metadata to the AI model so responses stay relevant to the current task.
- **OpenAI integration** – Uses the Chat Completions API (default model: `gpt-4o-mini`). The API key is stored locally via Chrome sync storage and never leaves the browser except for OpenAI requests.

## Getting started

1. Clone or download this repository.
2. Open `chrome://extensions` (or the equivalent page in your Chromium browser).
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the repository folder.
5. Open the extension **Options** page and add your OpenAI API key.

After loading, a “Permit AI” tab appears on the right edge of every page. Click it to open the assistant.

## Development guide

- All source files are plain JavaScript/HTML/CSS—no build step required.
- Background logic lives in [`background.js`](background.js) and communicates with the content script via `chrome.runtime.sendMessage`.
- The sidebar UI is injected by [`contentScript.js`](contentScript.js) using a shadow DOM to avoid style conflicts with the host page.
- User settings (currently just the OpenAI API key) are managed through [`options.html`](options.html) and [`options.js`](options.js).

### Testing tips

- Use Chrome’s **Extensions** page to inspect the background service worker for logs.
- When validating form autofill, open DevTools on the target page and watch for `input`/`change` events.
- If the assistant reports missing credentials, revisit the options page and confirm the API key is saved.

## Security & privacy considerations

- The extension requests `<all_urls>` host permissions so it can read forms on any page where the assistant is opened.
- API keys are stored with `chrome.storage.sync`; remove the key from the options page if you no longer want the extension to access OpenAI.
- Only detected form metadata and the text you send are included in prompts. Sensitive data should be reviewed before submission.

## License

This project is currently provided without a specific license. Contact the repository owner if you require different terms.
