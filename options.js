const form = document.getElementById('options-form');
const apiKeyInput = document.getElementById('api-key');
const endpointInput = document.getElementById('endpoint');
const clearButton = document.getElementById('clear');
const status = document.getElementById('status');

init();

async function init() {
  try {
    const stored = await chrome.storage.sync.get('copilotkitSettings');
    const settings = stored?.copilotkitSettings;
    if (settings?.apiKey) {
      apiKeyInput.value = settings.apiKey;
    }
    if (settings?.endpoint) {
      endpointInput.value = settings.endpoint;
    }
  } catch (error) {
    console.error('[Permit AI Helper] Failed to read CopilotKit settings', error);
    renderStatus('Unable to load stored CopilotKit settings.', true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value.trim();
  const endpoint = endpointInput.value.trim();

  if (!apiKey) {
    renderStatus('Enter a valid Copilot Cloud API key.', true);
    return;
  }
  try {
    const settings = {
      apiKey,
      endpoint: endpoint || undefined
    };
    await chrome.storage.sync.set({ copilotkitSettings: settings });
    renderStatus('CopilotKit settings saved. You can close this tab.', false);
  } catch (error) {
    console.error('[Permit AI Helper] Failed to store CopilotKit settings', error);
    renderStatus('Failed to store the settings. Try again.', true);
  }
});

clearButton.addEventListener('click', async () => {
  try {
    await chrome.storage.sync.remove('copilotkitSettings');
    apiKeyInput.value = '';
    endpointInput.value = '';
    renderStatus('CopilotKit settings removed.', false);
  } catch (error) {
    console.error('[Permit AI Helper] Failed to clear CopilotKit settings', error);
    renderStatus('Could not clear the settings. Try again.', true);
  }
});

function renderStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', Boolean(isError));
}
