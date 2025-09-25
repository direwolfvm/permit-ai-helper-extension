const form = document.getElementById('options-form');
const input = document.getElementById('api-key');
const clearButton = document.getElementById('clear');
const status = document.getElementById('status');

init();

async function init() {
  try {
    const stored = await chrome.storage.sync.get('permitAiApiKey');
    if (stored?.permitAiApiKey) {
      input.value = stored.permitAiApiKey;
    }
  } catch (error) {
    console.error('[Permit AI Helper] Failed to read API key', error);
    renderStatus('Unable to load stored key.', true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) {
    renderStatus('Enter a valid API key.', true);
    return;
  }
  try {
    await chrome.storage.sync.set({ permitAiApiKey: value });
    renderStatus('API key saved. You can close this tab.', false);
  } catch (error) {
    console.error('[Permit AI Helper] Failed to store API key', error);
    renderStatus('Failed to store the key. Try again.', true);
  }
});

clearButton.addEventListener('click', async () => {
  try {
    await chrome.storage.sync.remove('permitAiApiKey');
    input.value = '';
    renderStatus('API key removed.', false);
  } catch (error) {
    console.error('[Permit AI Helper] Failed to clear API key', error);
    renderStatus('Could not clear the key. Try again.', true);
  }
});

function renderStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', Boolean(isError));
}
