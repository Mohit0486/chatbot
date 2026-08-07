(function () {
  const currentScript = document.currentScript;
  const token = currentScript?.getAttribute('data-chatbot-token');
  const workspaceId = currentScript?.getAttribute('data-workspace-id');
  const apiBase = currentScript?.getAttribute('data-api-base') || 'http://localhost:4000';

  if (!token || !workspaceId) {
    console.error('[AI Agent Widget] missing token or workspace id');
    return;
  }

  const root = document.createElement('div');
  root.style.position = 'fixed';
  root.style.bottom = '24px';
  root.style.right = '24px';
  root.style.width = '360px';
  root.style.height = '520px';
  root.style.border = '1px solid #e2e8f0';
  root.style.borderRadius = '12px';
  root.style.background = '#ffffff';
  root.style.boxShadow = '0 10px 30px rgba(0,0,0,0.16)';
  root.style.display = 'flex';
  root.style.flexDirection = 'column';
  root.style.zIndex = '2147483000';

  const header = document.createElement('div');
  header.style.padding = '12px';
  header.style.background = '#0f172a';
  header.style.color = '#fff';
  header.style.fontWeight = '600';
  header.innerText = 'AI Assistant';
  root.appendChild(header);

  const messages = document.createElement('div');
  messages.style.flex = '1';
  messages.style.padding = '12px';
  messages.style.overflowY = 'auto';
  root.appendChild(messages);

  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.gap = '8px';
  form.style.padding = '12px';
  form.style.borderTop = '1px solid #e2e8f0';

  const input = document.createElement('input');
  input.placeholder = 'Ask a question...';
  input.style.flex = '1';
  input.style.border = '1px solid #cbd5e1';
  input.style.borderRadius = '8px';
  input.style.padding = '8px';

  const button = document.createElement('button');
  button.type = 'submit';
  button.innerText = 'Send';
  button.style.border = 'none';
  button.style.background = '#2563eb';
  button.style.color = '#fff';
  button.style.borderRadius = '8px';
  button.style.padding = '8px 12px';

  form.appendChild(input);
  form.appendChild(button);
  root.appendChild(form);

  const appendMessage = (sender, text) => {
    const row = document.createElement('div');
    row.style.marginBottom = '8px';
    row.style.fontSize = '14px';
    row.innerHTML = '<strong>' + sender + ':</strong> ' + text;
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  };

  let conversationId = '';

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    appendMessage('You', value);
    input.value = '';

    try {
      const response = await fetch(apiBase + '/conversations/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspaceId,
          chatbotId: token,
          message: value,
          conversationId: conversationId || undefined,
        }),
      });
      const data = await response.json();
      conversationId = data.conversationId || conversationId;
      appendMessage('AI', data.reply || 'No response');
    } catch (error) {
      appendMessage('AI', 'Connection error');
    }
  });

  document.body.appendChild(root);
})();
