const DEFAULT_COPILOTKIT_ENDPOINT = 'https://api.cloud.copilotkit.ai/copilotkit';
const COPILOTKIT_MUTATION = `
  mutation GenerateCopilotResponse($input: GenerateCopilotResponseInput!) {
    generateCopilotResponse(data: $input) {
      messages {
        __typename
        ... on TextMessageOutput {
          id
          role
          content
        }
        ... on ActionExecutionMessageOutput {
          id
          name
          arguments
        }
        ... on ResultMessageOutput {
          id
          actionName
          result
        }
      }
      status {
        __typename
        code
        ... on FailedResponseStatus {
          reason
          details
        }
      }
      threadId
      runId
    }
  }
`;

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
  const settingsRecord = await chrome.storage.sync.get('copilotkitSettings');
  const apiKey = settingsRecord?.copilotkitSettings?.apiKey?.trim();
  const endpoint = settingsRecord?.copilotkitSettings?.endpoint?.trim() || DEFAULT_COPILOTKIT_ENDPOINT;

  if (!apiKey) {
    return {
      error: 'Add your Copilot Cloud public API key in the Permit AI Helper options page before using the assistant.'
    };
  }

  if (!endpoint) {
    return {
      error: 'Set a valid CopilotKit endpoint URL in the options page.'
    };
  }

  const { messages = [], context = {} } = payload;
  const sanitizedMessages = Array.isArray(messages)
    ? messages.slice(-12).map(mapMessage)
    : [];

  if (!sanitizedMessages.length) {
    return { error: 'No conversation context was provided to CopilotKit.' };
  }

  const frontend = { actions: [] };
  if (context && typeof context.url === 'string' && context.url) {
    frontend.url = context.url;
  }

  const graphInput = {
    metadata: { requestType: 'Chat' },
    messages: sanitizedMessages,
    frontend
  };

  const contextEntries = buildContextEntries(context);
  if (contextEntries.length) {
    graphInput.context = contextEntries;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CopilotCloud-Public-API-Key': apiKey
      },
      body: JSON.stringify({
        query: COPILOTKIT_MUTATION,
        variables: { input: graphInput }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Permit AI Helper] CopilotKit API error', errorText);
      return { error: 'The CopilotKit service returned an error. Check the console for details.' };
    }

    const data = await response.json();
    if (Array.isArray(data?.errors) && data.errors.length) {
      console.error('[Permit AI Helper] CopilotKit GraphQL errors', data.errors);
      return { error: data.errors[0]?.message || 'CopilotKit reported an error while processing the request.' };
    }

    const runtimeResponse = data?.data?.generateCopilotResponse;
    if (!runtimeResponse) {
      return { error: 'Received an unexpected response from CopilotKit.' };
    }

    const status = runtimeResponse.status;
    if (status?.__typename === 'FailedResponseStatus') {
      const reason = status?.reason || 'CopilotKit request failed.';
      console.error('[Permit AI Helper] CopilotKit reported failure', status);
      return { error: reason };
    }

    const message = extractAssistantMessage(runtimeResponse.messages);
    if (!message) {
      return { error: 'CopilotKit did not return any assistant message.' };
    }

    return { message };
  } catch (error) {
    console.error('[Permit AI Helper] Failed to reach CopilotKit', error);
    return { error: 'Could not reach the CopilotKit service. Verify your endpoint and network connection.' };
  }
}

function mapMessage(msg, index, allMessages) {
  if (!msg || typeof msg !== 'object') {
    return buildTextMessage('user', String(msg), index, allMessages.length);
  }

  const allowedRoles = ['system', 'user', 'assistant', 'developer'];
  const role = allowedRoles.includes(msg.role) ? msg.role : 'user';
  const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);

  return buildTextMessage(role, content, index, allMessages.length);
}

function buildTextMessage(role, content, index, total) {
  const offsetMs = (total - index) * 1000;
  const createdAt = new Date(Date.now() - offsetMs).toISOString();
  return {
    id: typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${index}`,
    createdAt,
    textMessage: {
      role,
      content
    }
  };
}

function buildContextEntries(context) {
  if (!context || typeof context !== 'object') return [];
  const entries = [];

  if (context.url) {
    entries.push({ description: 'Current URL', value: String(context.url) });
  }

  if (context.title) {
    entries.push({ description: 'Page title', value: String(context.title) });
  }

  if (Array.isArray(context.fields) && context.fields.length) {
    const fieldDescriptions = context.fields.slice(0, 10).map((field, index) => {
      const label = field?.label || field?.name || field?.placeholder || field?.tagName || `Field ${index + 1}`;
      const id = field?.id || field?.name || '';
      const value = field?.value ? String(field.value) : '(empty)';
      const identifier = id ? ` • ${id}` : '';
      return `• ${label}${identifier}: ${value}`;
    });

    entries.push({
      description: 'Visible form fields',
      value: fieldDescriptions.join('\n')
    });
  }

  if (context.field) {
    const field = context.field;
    const details = [];
    if (field.label || field.name || field.placeholder || field.tagName) {
      details.push(`Label: ${field.label || field.name || field.placeholder || field.tagName}`);
    }
    if (field.id) details.push(`ID: ${field.id}`);
    if (field.placeholder) details.push(`Placeholder: ${field.placeholder}`);
    if (field.value) details.push(`Current value: ${field.value}`);

    if (details.length) {
      entries.push({
        description: 'Active field details',
        value: details.join('\n')
      });
    }
  }

  return entries;
}

function extractAssistantMessage(messages) {
  if (!Array.isArray(messages)) return '';

  const assistantTexts = [];
  const actionBlocks = [];

  for (const message of messages) {
    if (!message || typeof message !== 'object') continue;
    if (message.__typename === 'TextMessageOutput' && message.role === 'assistant') {
      const content = Array.isArray(message.content) ? message.content.join('') : message.content;
      if (content) {
        assistantTexts.push(String(content).trim());
      }
    } else if (message.__typename === 'ActionExecutionMessageOutput' && Array.isArray(message.arguments)) {
      const serialized = message.arguments
        .map(arg => (typeof arg === 'string' ? arg.trim() : JSON.stringify(arg)))
        .filter(Boolean)
        .join('\n');
      if (serialized) {
        actionBlocks.push(['```action', serialized, '```'].join('\n'));
      }
    }
  }

  const combined = [...assistantTexts, ...actionBlocks].filter(Boolean).join('\n\n').trim();
  return combined;
}
