const MODEL = 'gpt-4o-mini';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'callAI') {
    handleCallAi(message.payload)
      .then(sendResponse)
      .catch((error) => {
        console.error('[Permit AI Helper] Background error', error);
        sendResponse({ error: 'Unexpected error while contacting the AI service.' });
      });
    return true;
  }
  return undefined;
});

async function handleCallAi(payload = {}) {
  const apiKeyRecord = await chrome.storage.sync.get('permitAiApiKey');
  const apiKey = apiKeyRecord?.permitAiApiKey?.trim();
  if (!apiKey) {
    return {
      error: 'Add your OpenAI API key in the Permit AI Helper options page before using the assistant.'
    };
  }

  const { messages = [], context = {} } = payload;
  const sanitizedMessages = Array.isArray(messages)
    ? messages.slice(-12).map(mapMessage)
    : [];

  const contextMessage = buildContextMessage(context);
  if (contextMessage) {
    sanitizedMessages.push(contextMessage);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        messages: sanitizedMessages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Permit AI Helper] API error', errorText);
      return { error: 'The AI service returned an error. Check the console for details.' };
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content;
    return { message };
  } catch (error) {
    console.error('[Permit AI Helper] Failed to reach OpenAI', error);
    return { error: 'Could not reach the AI service. Verify your internet connection.' };
  }
}

function mapMessage(msg) {
  if (!msg || typeof msg !== 'object') {
    return { role: 'user', content: String(msg) };
  }
  const role = ['system', 'user', 'assistant'].includes(msg.role) ? msg.role : 'user';
  return {
    role,
    content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
  };
}

function buildContextMessage(context) {
  if (!context || typeof context !== 'object') return null;
  const snippets = [];
  if (context.url) {
    snippets.push(`Current URL: ${context.url}`);
  }
  if (context.title) {
    snippets.push(`Page title: ${context.title}`);
  }
  if (Array.isArray(context.fields) && context.fields.length) {
    const fieldDescriptions = context.fields
      .slice(0, 10)
      .map((field, index) => {
        const label = field?.label || field?.name || field?.placeholder || field?.tagName || `Field ${index + 1}`;
        const value = field?.value ? `Value: ${field.value}` : 'Value: (empty)';
        const id = field?.id ? `ID: ${field.id}` : field?.name ? `Name: ${field.name}` : null;
        const idSuffix = id ? ` • ${id}` : '';
        return `• ${label} (${field?.tagName || 'input'}${idSuffix}): ${value}`;
      })
      .join('\n');
    snippets.push('Visible form fields:\n' + fieldDescriptions);
  }
  if (context.field) {
    const field = context.field;
    snippets.push(`Active field label: ${field.label || field.name || field.placeholder || field.tagName}`);
    if (field.id) snippets.push(`Active field ID: ${field.id}`);
    if (field.placeholder) snippets.push(`Field placeholder: ${field.placeholder}`);
    if (field.value) snippets.push(`Current value: ${field.value}`);
  }
  if (!snippets.length) return null;
  return {
    role: 'system',
    content: `Additional page context for this conversation:\n${snippets.join('\n')}`
  };
}
