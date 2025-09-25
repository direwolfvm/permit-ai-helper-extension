(() => {
  const ROOT_ID = 'permit-ai-helper-root';
  if (document.getElementById(ROOT_ID)) {
    return;
  }

  const container = document.createElement('div');
  container.id = ROOT_ID;
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.right = '0';
  container.style.height = '100vh';
  container.style.zIndex = '2147483640';
  document.documentElement.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host {
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #0f172a;
    }

    .toggle-button {
      position: fixed;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      padding: 8px 12px;
      background: #134e4a;
      color: white;
      border-radius: 6px 0 0 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.25);
      border: none;
      transition: background 0.2s ease;
      pointer-events: auto;
    }

    .toggle-button:hover {
      background: #0f766e;
    }

    .panel {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: 360px;
      max-width: 100vw;
      background: #f8fafc;
      border-left: 1px solid rgba(15, 23, 42, 0.1);
      box-shadow: -12px 0 30px rgba(15, 23, 42, 0.12);
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.25s ease;
      pointer-events: none;
    }

    .panel.open {
      transform: translateX(0);
      pointer-events: auto;
    }

    header {
      padding: 16px;
      background: #134e4a;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    header h1 {
      font-size: 16px;
      margin: 0;
    }

    header button {
      background: transparent;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section {
      background: white;
      border-radius: 12px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section h2 {
      font-size: 14px;
      font-weight: 600;
      margin: 0;
      color: #0f172a;
    }

    .section p {
      font-size: 13px;
      margin: 0;
      line-height: 1.5;
      color: #475569;
    }

    .field-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 220px;
      overflow-y: auto;
    }

    .field-card {
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 8px;
      padding: 8px;
      background: #f1f5f9;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-card h3 {
      font-size: 13px;
      margin: 0;
      font-weight: 600;
    }

    .field-card small {
      font-size: 12px;
      color: #64748b;
    }

    .field-actions {
      display: flex;
      gap: 6px;
    }

    .field-actions button,
    .chat-input button,
    .section button.secondary {
      background: #0f766e;
      border: none;
      color: white;
      padding: 6px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .field-actions button.secondary,
    .section button.secondary,
    .chat-input button.secondary {
      background: #e2e8f0;
      color: #0f172a;
    }

    .chat-log {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 220px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .message {
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 13px;
      line-height: 1.5;
    }

    .message.user {
      background: #e0f2fe;
      align-self: flex-end;
    }

    .message.assistant {
      background: #ecfeff;
      align-self: flex-start;
    }

    .chat-input {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .chat-input textarea {
      flex: 1;
      resize: vertical;
      min-height: 50px;
      max-height: 120px;
      border-radius: 8px;
      border: 1px solid rgba(15, 23, 42, 0.2);
      padding: 8px;
      font-size: 13px;
      font-family: inherit;
    }

    .status {
      font-size: 12px;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status span.loader {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid rgba(15, 23, 42, 0.15);
      border-top-color: #0f766e;
      animation: spin 0.9s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .hidden {
      display: none !important;
    }
  `;
  shadow.appendChild(style);

  const toggleButton = document.createElement('button');
  toggleButton.className = 'toggle-button';
  toggleButton.textContent = 'Permit AI';
  shadow.appendChild(toggleButton);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `
    <header>
      <h1>Permit AI Helper</h1>
      <button type="button" title="Close">×</button>
    </header>
    <div class="content">
      <section class="section" id="overview">
        <h2>Form navigator</h2>
        <p>Review detected form fields and ask the assistant to clarify or enhance your input.</p>
        <div class="field-list" id="field-list"></div>
      </section>
      <section class="section" id="assistant">
        <h2>Assistant</h2>
        <div class="chat-log" id="chat-log"></div>
        <div class="chat-input">
          <textarea id="chat-input" placeholder="Ask for help with permitting or environmental review..."></textarea>
          <button id="chat-send" type="button">Send</button>
        </div>
        <div class="status hidden" id="status"><span class="loader"></span>Thinking...</div>
      </section>
    </div>
  `;
  shadow.appendChild(panel);

  const closeButton = panel.querySelector('header button');
  const fieldListEl = panel.querySelector('#field-list');
  const chatLogEl = panel.querySelector('#chat-log');
  const chatInputEl = panel.querySelector('#chat-input');
  const chatSendEl = panel.querySelector('#chat-send');
  const statusEl = panel.querySelector('#status');

  const formFieldCache = new Map();
  const conversation = [{
    role: 'system',
    content: 'You are Permit AI, an expert environmental review and permitting assistant embedded inside a browser extension. Help the user interpret web form fields, improve their text responses with professional tone, and keep answers concise and actionable. Always ask for clarification if the request is ambiguous.'
  }];
  const fieldSummaryCache = new Map();
  let isOpen = false;
  let isBusy = false;
  let pendingFieldUpdate = null;

  function togglePanel(forceState) {
    if (typeof forceState === 'boolean') {
      isOpen = forceState;
    } else {
      isOpen = !isOpen;
    }
    panel.classList.toggle('open', isOpen);
  }

  toggleButton.addEventListener('click', () => togglePanel(true));
  closeButton.addEventListener('click', () => togglePanel(false));

  function highlightField(el) {
    if (!el) return;
    const originalOutline = el.style.outline;
    const originalTransition = el.style.transition;
    el.style.transition = 'outline 0.2s ease';
    el.style.outline = '3px solid #0f766e';
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      el.style.outline = originalOutline;
      el.style.transition = originalTransition;
    }, 1500);
  }

  function getLabelText(field) {
    if (field.labels && field.labels.length > 0) {
      return Array.from(field.labels).map(label => label.textContent.trim()).join(' / ');
    }
    let labelText = '';
    const id = field.id;
    if (id) {
      const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (label) {
        labelText = label.textContent.trim();
      }
    }
    if (!labelText) {
      const wrapperLabel = field.closest('label');
      if (wrapperLabel) {
        labelText = wrapperLabel.textContent.trim();
      }
    }
    if (!labelText && field.placeholder) {
      labelText = field.placeholder.trim();
    }
    return labelText;
  }

  function setFieldValue(field, value) {
    if (!field) return;

    const tagName = field.tagName?.toLowerCase();
    const canUseValueSetter = tagName === 'input' || tagName === 'textarea' || tagName === 'select';

    if (canUseValueSetter || typeof field.value !== 'undefined') {
      const ownDescriptor = Object.getOwnPropertyDescriptor(field, 'value');
      const prototype = Object.getPrototypeOf(field);
      const protoDescriptor = prototype ? Object.getOwnPropertyDescriptor(prototype, 'value') : undefined;
      const setter = ownDescriptor?.set || protoDescriptor?.set;

      if (setter) {
        setter.call(field, value);
      } else {
        field.value = value;
      }
    } else if ('textContent' in field) {
      field.textContent = value;
    }

    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function summarizeField(field) {
    let identifier = field.dataset.permitAiHelperId || field.id || field.name;
    if (!identifier) {
      identifier = `field-${Math.random().toString(16).slice(2)}`;
      field.dataset.permitAiHelperId = identifier;
    } else if (!field.dataset.permitAiHelperId) {
      field.dataset.permitAiHelperId = identifier;
    }

    return {
      id: identifier,
      tagName: field.tagName.toLowerCase(),
      type: field.type,
      name: field.name,
      label: getLabelText(field),
      value: field.value || '',
      placeholder: field.placeholder || '',
      required: field.required,
      dataset: { ...field.dataset },
      ariaLabel: field.getAttribute('aria-label') || '',
      maxLength: field.maxLength > 0 ? field.maxLength : undefined
    };
  }

  function collectFields() {
    const selectors = 'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';
    const fields = Array.from(document.querySelectorAll(selectors));
    formFieldCache.clear();
    fieldSummaryCache.clear();
    return fields.map(field => {
      const summary = summarizeField(field);
      formFieldCache.set(summary.id, field);
      fieldSummaryCache.set(summary.id, summary);
      return summary;
    });
  }

  function renderFieldList(fields) {
    fieldListEl.innerHTML = '';
    if (!fields.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No form fields detected on this page.';
      fieldListEl.appendChild(empty);
      return;
    }

    fields.forEach(field => {
      const card = document.createElement('div');
      card.className = 'field-card';
      const title = field.label || field.name || field.placeholder || field.tagName;
      card.innerHTML = `
        <h3>${title}</h3>
        <small>${field.tagName}${field.type ? ` • ${field.type}` : ''}${field.required ? ' • required' : ''}</small>
        <div class="field-actions">
          <button data-action="improve" data-field-id="${field.id}">Improve</button>
          <button class="secondary" data-action="explain" data-field-id="${field.id}">Explain</button>
          <button class="secondary" data-action="focus" data-field-id="${field.id}">Focus</button>
        </div>
      `;
      card.addEventListener('mouseenter', () => highlightField(formFieldCache.get(field.id)));
      fieldListEl.appendChild(card);
    });
  }

  function appendMessage(role, content) {
    const bubble = document.createElement('div');
    bubble.className = `message ${role}`;
    bubble.textContent = content;
    chatLogEl.appendChild(bubble);
    chatLogEl.scrollTop = chatLogEl.scrollHeight;
  }

  function recordMessage(role, content) {
    appendMessage(role, content);
    conversation.push({ role, content });
  }

  function setStatus(visible) {
    statusEl.classList.toggle('hidden', !visible);
  }

  function normalizeText(text) {
    const lower = text.toLowerCase();
    const normalized = typeof lower.normalize === 'function' ? lower.normalize('NFKD') : lower;
    return normalized.replace(/[\u0300-\u036f]/g, '').trim();
  }

  function scoreMatch(candidate, query) {
    if (!candidate || !query) return 0;
    const normalizedCandidate = normalizeText(candidate);
    if (!normalizedCandidate) return 0;
    if (normalizedCandidate === query) {
      return 100;
    }
    if (normalizedCandidate.includes(query)) {
      return query.length / normalizedCandidate.length * 10;
    }
    const queryWords = query.split(/\s+/).filter(Boolean);
    if (!queryWords.length) return 0;
    const matches = queryWords.filter(word => normalizedCandidate.includes(word));
    if (!matches.length) return 0;
    return matches.length + matches.reduce((acc, word) => acc + word.length, 0) / 10;
  }

  function findFieldByDescription(description) {
    const query = normalizeText(description).replace(/\b(field|input|textbox|box)\b/g, '').trim();
    if (!query) return null;
    if (!fieldSummaryCache.size) {
      collectFields();
    }
    let bestFieldId = null;
    let bestScore = 0;
    fieldSummaryCache.forEach((summary, id) => {
      const candidates = [
        summary.label,
        summary.name,
        summary.placeholder,
        summary.ariaLabel,
        summary.tagName,
        id
      ];
      for (const candidate of candidates) {
        const score = scoreMatch(candidate, query);
        if (score > bestScore) {
          bestScore = score;
          bestFieldId = id;
        }
      }
    });
    if (!bestFieldId || bestScore < 1) return null;
    return formFieldCache.get(bestFieldId) || null;
  }

  function extractQuotedValue(text) {
    const match = text.match(/["'“”‘’]([^"'“”‘’]+)["'“”‘’]/);
    if (!match) return null;
    return match[1].trim();
  }

  function parseFieldCommand(message) {
    const lowered = message.toLowerCase();
    const verbs = ['put', 'type', 'enter', 'fill', 'set', 'update'];
    if (!verbs.some(verb => lowered.includes(verb))) {
      return null;
    }

    let value = extractQuotedValue(message);
    let remainder = message;
    if (value) {
      remainder = message.replace(/["'“”‘’][^"'“”‘’]+["'“”‘’]/, '');
    }

    const fieldMatch = remainder.match(/(?:in|into|to|for)\s+(?:the\s+)?([\w\s-]+?)(?:\s+(?:field|input|box|textbox))?(?:[?.!,]|$)/i);
    let fieldDescription = fieldMatch ? fieldMatch[1] : '';

    if (!value) {
      const setMatch = message.match(/(?:set|update)\s+(?:the\s+)?([\w\s-]+?)(?:\s+(?:field|input|box|textbox))?\s+(?:to|as)\s+([^?.!,]+)/i);
      if (setMatch) {
        fieldDescription = fieldDescription || setMatch[1];
        value = setMatch[2].trim();
      }
    }

    if (!value) {
      const simpleMatch = message.match(/(?:put|type|enter|fill)\s+(.+?)\s+(?:in|into|to)\s+(?:the\s+)?([\w\s-]+)(?:\s+(?:field|input|box|textbox))?/i);
      if (simpleMatch) {
        value = simpleMatch[1].trim();
        fieldDescription = fieldDescription || simpleMatch[2];
      }
    }

    if (value) {
      value = value.replace(/[?.!,]+$/, '').trim();
    }
    if (fieldDescription) {
      fieldDescription = fieldDescription.replace(/[?.!,]+$/, '').trim();
    }

    if (!value || !fieldDescription) {
      return null;
    }

    return { value, fieldDescription };
  }

  function isAffirmativeResponse(message) {
    if (!message) return false;
    return /^(?:yes|yep|yeah|sure|ok|okay|affirmative|please|do it|go ahead|sounds good|absolutely|of course)/i.test(
      message.trim()
    );
  }

  function isNegativeResponse(message) {
    if (!message) return false;
    return /^(?:no|nope|nah|not now|maybe later|don't|do not|stop)/i.test(message.trim());
  }

  function applyFieldCommand(command, { acknowledge = true } = {}) {
    if (!command) return false;
    const field = findFieldByDescription(command.fieldDescription);
    if (!field) return false;

    setFieldValue(field, command.value);
    field.focus({ preventScroll: false });
    highlightField(field);

    if (acknowledge) {
      acknowledgeFieldUpdate(field, command.value);
    } else {
      const summary = summarizeField(field);
      fieldSummaryCache.set(summary.id, summary);
    }

    return true;
  }

  function acknowledgeFieldUpdate(field, value) {
    const summary = summarizeField(field);
    fieldSummaryCache.set(summary.id, summary);
    const label = summary.label || summary.name || summary.placeholder || summary.tagName || 'field';
    recordMessage('assistant', `Set "${value}" in the ${label}. Let me know if you need anything else.`);
  }

  function extractAssistantFieldSuggestion(message) {
    if (!message || typeof message !== 'string') return null;
    const command = parseFieldCommand(message);
    if (!command) return null;

    const lowered = message.toLowerCase();
    const needsConfirmation = /would you like me to|should i (?:go ahead and )?update|let me know if you want me to update/i.test(
      lowered
    );
    const alreadyApplied = /i (?:have|just) (?:updated|set)|it's (?:all )?set|done\b/.test(lowered);

    return {
      command,
      needsConfirmation: needsConfirmation && !alreadyApplied,
      alreadyApplied
    };
  }

  function handleAssistantMessageActions(message) {
    const suggestion = extractAssistantFieldSuggestion(message);
    if (!suggestion) {
      return;
    }

    if (suggestion.needsConfirmation) {
      pendingFieldUpdate = suggestion.command;
      return;
    }

    pendingFieldUpdate = null;
    const applied = applyFieldCommand(suggestion.command, { acknowledge: false });
    if (!applied) {
      recordMessage(
        'assistant',
        `I couldn't automatically update the ${suggestion.command.fieldDescription} field. Please adjust it manually.`
      );
    }
  }

  function handleDirectFieldCommand(message) {
    const trimmed = message.trim();
    if (!trimmed) return false;

    if (pendingFieldUpdate) {
      if (isAffirmativeResponse(trimmed)) {
        const command = pendingFieldUpdate;
        pendingFieldUpdate = null;
        recordMessage('user', message);
        if (!applyFieldCommand(command)) {
          recordMessage(
            'assistant',
            `I couldn't automatically update the ${command.fieldDescription} field. Please adjust it manually.`
          );
        }
        return true;
      }
      if (isNegativeResponse(trimmed)) {
        pendingFieldUpdate = null;
        recordMessage('user', message);
        recordMessage('assistant', 'Okay, I will leave that field unchanged.');
        return true;
      }
    }

    const command = parseFieldCommand(message);
    if (!command) return false;
    const field = findFieldByDescription(command.fieldDescription);
    if (!field) return false;

    pendingFieldUpdate = null;
    recordMessage('user', message);
    setFieldValue(field, command.value);
    field.focus({ preventScroll: false });
    highlightField(field);
    acknowledgeFieldUpdate(field, command.value);
    return true;
  }

  async function callAssistant(userContent, context = {}, { skipChatMessage = false, onAssistantMessage } = {}) {
    if (isBusy) return;
    isBusy = true;
    setStatus(true);

    if (!skipChatMessage) {
      recordMessage('user', userContent);
    } else {
      conversation.push({ role: 'user', content: userContent });
    }

    try {
      const response = await new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(
            {
              type: 'callAI',
              payload: {
                messages: conversation,
                context
              }
            },
            (resp) => {
              const error = chrome.runtime.lastError;
              if (error) {
                reject(error);
                return;
              }
              resolve(resp);
            }
          );
        } catch (err) {
          reject(err);
        }
      });

      if (!response || response.error) {
        const message = response && response.error ? response.error : 'Unable to reach Permit AI service. Check your API key in extension options.';
        recordMessage('assistant', message);
        return message;
      }

      const assistantReply = (response.message || 'I did not receive a response.').trim();
      recordMessage('assistant', assistantReply);
      handleAssistantMessageActions(assistantReply);
      if (onAssistantMessage) {
        onAssistantMessage(assistantReply);
      }
      return assistantReply;
    } catch (error) {
      const message = 'Permit AI encountered an unexpected error.';
      console.error('[Permit AI Helper] Failed to call assistant', error);
      recordMessage('assistant', message);
      return message;
    } finally {
      isBusy = false;
      setStatus(false);
    }
  }

  async function handleImprove(fieldId) {
    const field = formFieldCache.get(fieldId);
    if (!field) return;
    const summary = summarizeField(field);
    const prompt = `Improve the following response for an environmental permitting form. Respond with a refined version only.\nField label: ${summary.label || summary.name || summary.placeholder || summary.tagName}\nCurrent value: ${summary.value || '(empty)'}\nContext: ${summary.placeholder || 'n/a'}`;
    await callAssistant(prompt, {
      type: 'improve-field',
      field: summary,
      url: location.href
    }, {
      skipChatMessage: false,
      onAssistantMessage: text => {
        setFieldValue(field, text);
      }
    });
  }

  async function handleExplain(fieldId) {
    const field = formFieldCache.get(fieldId);
    if (!field) return;
    const summary = summarizeField(field);
    const prompt = `Explain what information should go into the following form field for permitting. Provide helpful guidance and examples.\nField label: ${summary.label || summary.name || summary.placeholder || summary.tagName}\nPlaceholder: ${summary.placeholder || 'None'}\nCurrent value: ${summary.value || '(empty)'}`;
    await callAssistant(prompt, {
      type: 'explain-field',
      field: summary,
      url: location.href
    });
  }

  function focusField(fieldId) {
    const field = formFieldCache.get(fieldId);
    if (!field) return;
    field.focus({ preventScroll: false });
    highlightField(field);
  }

  fieldListEl.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const action = target.getAttribute('data-action');
    if (!action) return;
    const fieldId = target.getAttribute('data-field-id');
    if (!fieldId) return;
    switch (action) {
      case 'improve':
        handleImprove(fieldId);
        break;
      case 'explain':
        handleExplain(fieldId);
        break;
      case 'focus':
        focusField(fieldId);
        break;
      default:
        break;
    }
  });

  chatSendEl.addEventListener('click', () => {
    const value = chatInputEl.value.trim();
    if (!value) return;
    chatInputEl.value = '';
    if (handleDirectFieldCommand(value)) {
      return;
    }
    callAssistant(value, {
      type: 'general',
      fields: collectFields().slice(0, 20),
      url: location.href,
      title: document.title
    });
  });

  chatInputEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      chatSendEl.click();
    }
  });

  function updateFields() {
    const fields = collectFields();
    renderFieldList(fields);
  }

  updateFields();

  let pendingUpdate = null;
  const observer = new MutationObserver(() => {
    if (pendingUpdate) {
      window.clearTimeout(pendingUpdate);
    }
    pendingUpdate = window.setTimeout(() => {
      pendingUpdate = null;
      updateFields();
    }, 400);
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['value', 'placeholder']
  });

  window.addEventListener('beforeunload', () => observer.disconnect());
})();
