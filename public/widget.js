(() => {
  const currentScript = document.currentScript || Array.from(document.scripts).find((script) => script.src && script.src.includes('/widget.js'));
  const baseUrl = currentScript ? new URL(currentScript.src).origin : 'https://cashofferchat.com';
  const siteId = currentScript?.getAttribute('data-site-id') || 'demo';
  const primaryColor = currentScript?.getAttribute('data-primary-color') || '#0f2440';
  const accentColor = currentScript?.getAttribute('data-accent-color') || '#f5b84b';
  const title = currentScript?.getAttribute('data-title') || 'Seller Intake Assistant';

  if (window.__cashOfferChatLoaded) return;
  window.__cashOfferChatLoaded = true;

  const css = `
    .coc-root * { box-sizing: border-box; }
    .coc-bubble {
      position: fixed; right: 22px; bottom: 22px; z-index: 2147483647;
      border: 0; border-radius: 999px; background: ${primaryColor}; color: #fff;
      padding: 15px 18px; font: 700 15px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      box-shadow: 0 18px 45px rgba(15,36,64,.28); cursor: pointer;
    }
    .coc-panel {
      position: fixed; right: 22px; bottom: 88px; z-index: 2147483647;
      width: min(420px, calc(100vw - 28px)); height: min(680px, calc(100vh - 110px));
      background: #fff; border: 1px solid #e2e8f0; border-radius: 26px; overflow: hidden;
      box-shadow: 0 28px 80px rgba(15,36,64,.28); display: none;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .coc-panel.coc-open { display: flex; flex-direction: column; }
    .coc-header { background: ${primaryColor}; color: #fff; padding: 16px 18px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .coc-title { font-weight: 800; font-size: 16px; margin: 0; }
    .coc-status { margin: 3px 0 0; font-size: 12px; opacity: .72; }
    .coc-close { border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.1); color:#fff; border-radius: 999px; width: 34px; height: 34px; cursor:pointer; font-size: 20px; line-height: 30px; }
    .coc-top-cta { padding: 12px 14px; background:#fff; border-bottom:1px solid #e2e8f0; }
    .coc-open-quote { width:100%; border:0; background:${accentColor}; color:#0f2440; border-radius:999px; padding:12px 14px; font-weight:900; cursor:pointer; font-size:14px; }
    .coc-top-cta p { margin:7px 4px 0; color:#64748b; font-size:12px; line-height:1.35; }
    .coc-messages { flex: 1; overflow-y: auto; padding: 16px; background: #f8fafc; }
    .coc-msg { max-width: 86%; padding: 12px 14px; border-radius: 18px; margin: 0 0 10px; font-size: 14px; line-height: 1.45; white-space: pre-wrap; }
    .coc-assistant { background: #fff; color: #334155; border: 1px solid #e2e8f0; border-bottom-left-radius: 6px; }
    .coc-user { background: ${accentColor}; color: #0f2440; margin-left: auto; border-bottom-right-radius: 6px; font-weight: 600; }
    .coc-actions { display:flex; flex-wrap:wrap; gap:8px; padding: 10px 14px 0; background:#f8fafc; }
    .coc-chip { border:1px solid #dbe3ee; background:#fff; color:#334155; border-radius:999px; padding:8px 10px; font-weight:700; font-size:12px; cursor:pointer; }
    .coc-intake-btn { border: 0; background: ${accentColor}; color: #0f2440; border-radius: 999px; padding: 9px 12px; font-weight: 800; cursor:pointer; margin-top: 8px; }
    .coc-composer { display:flex; gap:8px; padding: 12px; border-top:1px solid #e2e8f0; background:#fff; }
    .coc-input { flex:1; border:1px solid #cbd5e1; border-radius:999px; padding: 12px 14px; outline:0; font-size:14px; }
    .coc-send { border:0; border-radius:999px; background:${primaryColor}; color:#fff; padding: 0 15px; font-weight:800; cursor:pointer; }
    .coc-form-wrap { display:none; flex:1; overflow-y:auto; padding:16px; background:#fff; }
    .coc-panel.coc-form-mode .coc-top-cta, .coc-panel.coc-form-mode .coc-messages, .coc-panel.coc-form-mode .coc-actions, .coc-panel.coc-form-mode .coc-composer { display:none; }
    .coc-panel.coc-form-mode .coc-form-wrap { display:block; }
    .coc-form-title { font-size:20px; font-weight:900; color:#0f2440; margin:0; }
    .coc-form-help { color:#64748b; font-size:13px; line-height:1.5; margin:8px 0 16px; }
    .coc-label { display:block; color:#334155; font-weight:800; font-size:13px; margin: 0 0 11px; }
    .coc-field, .coc-textarea, .coc-select { width:100%; margin-top:5px; border:1px solid #cbd5e1; border-radius:14px; padding:11px 12px; font: 400 14px system-ui, sans-serif; outline:0; background:#fff; }
    .coc-textarea { min-height: 86px; resize: vertical; }
    .coc-submit { width:100%; border:0; background:${accentColor}; color:#0f2440; border-radius:999px; padding:13px; font-weight:900; cursor:pointer; margin-top:5px; }
    .coc-back { width:100%; border:1px solid #cbd5e1; background:#fff; color:#0f2440; border-radius:999px; padding:11px; font-weight:800; cursor:pointer; margin-top:9px; }
    .coc-error { background:#fef2f2; color:#b91c1c; border-radius:12px; padding:10px; font-size:13px; margin: 0 0 12px; }
    .coc-success { background:#ecfdf5; color:#064e3b; border-radius:12px; padding:10px; font-size:13px; margin: 0 0 12px; }
    @media (max-width: 560px) {
      .coc-bubble { right: 14px; bottom: 14px; }
      .coc-panel { right: 8px; bottom: 72px; width: calc(100vw - 16px); height: min(690px, calc(100vh - 86px)); border-radius: 20px; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'coc-root';
  root.innerHTML = `
    <button class="coc-bubble" type="button">Questions? Chat with us</button>
    <section class="coc-panel" aria-label="CashOfferChat seller assistant">
      <header class="coc-header">
        <div><p class="coc-title">${escapeHtml(title)}</p><p class="coc-status">Answers questions and collects property basics</p></div>
        <button class="coc-close" type="button" aria-label="Close">×</button>
      </header>
      <div class="coc-top-cta"><button class="coc-open-quote" type="button">Enter House Info for a Quote</button><p>Ask a question below, or enter your property details when you’re ready.</p></div>
      <div class="coc-messages"></div>
      <div class="coc-actions">
        <button class="coc-chip" type="button" data-msg="Do you buy as-is?">Do you buy as-is?</button>
        <button class="coc-chip" type="button" data-msg="How fast can I close?">How fast can I close?</button>
        <button class="coc-chip" type="button" data-msg="Do you buy houses with tenants?">Tenants?</button>
        <button class="coc-chip" type="button" data-action="open-form">Get a review</button>
      </div>
      <form class="coc-composer">
        <input class="coc-input" name="message" placeholder="Ask a question..." autocomplete="off" />
        <button class="coc-send" type="submit">Send</button>
      </form>
      <div class="coc-form-wrap">
        <p class="coc-form-title">Enter house information for a quote</p>
        <p class="coc-form-help">Share the property basics so the team can review it and follow up. There is no obligation.</p>
        <div class="coc-form-status"></div>
        <form class="coc-lead-form">
          <label class="coc-label">Property city *<input class="coc-field" name="propertyCity" placeholder="Austin" /></label>
          <label class="coc-label">Property address *<input class="coc-field" name="propertyAddress" placeholder="Street address" /></label>
          <label class="coc-label">What best describes the situation?<select class="coc-select" name="situation"><option value="">Select one</option><option>Needs repairs</option><option>Inherited property</option><option>Tenant occupied</option><option>Vacant property</option><option>Behind on payments</option><option>Just want to sell fast</option><option>Other</option></select></label>
          <label class="coc-label">Timeline<select class="coc-select" name="timeline"><option value="">Select one</option><option>ASAP</option><option>Within 30 days</option><option>1–3 months</option><option>Just exploring</option></select></label>
          <label class="coc-label">Property condition<textarea class="coc-textarea" name="propertyCondition" placeholder="Repairs, tenants, roof, foundation, cleanout, etc."></textarea></label>
          <label class="coc-label">Name *<input class="coc-field" name="name" placeholder="Your name" /></label>
          <label class="coc-label">Phone number *<input class="coc-field" name="phone" placeholder="Best phone number" /></label>
          <label class="coc-label">Email<input class="coc-field" name="email" type="email" placeholder="Optional backup email" /></label>
          <label class="coc-label">Anything else?<textarea class="coc-textarea" name="notes" placeholder="Anything else the team should know?"></textarea></label>
          <button class="coc-submit" type="submit">Submit My House Info</button>
          <button class="coc-back" type="button">Back to Chat</button>
        </form>
      </div>
    </section>
  `;
  document.body.appendChild(root);

  const panel = root.querySelector('.coc-panel');
  const bubble = root.querySelector('.coc-bubble');
  const close = root.querySelector('.coc-close');
  const messages = root.querySelector('.coc-messages');
  const composer = root.querySelector('.coc-composer');
  const input = root.querySelector('.coc-input');
  const form = root.querySelector('.coc-lead-form');
  const formStatus = root.querySelector('.coc-form-status');
  const back = root.querySelector('.coc-back');
  let conversationId = null;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function addMessage(role, content, showIntake) {
    const div = document.createElement('div');
    div.className = `coc-msg ${role === 'user' ? 'coc-user' : 'coc-assistant'}`;
    div.textContent = content;
    if (showIntake && role === 'assistant') {
      const btn = document.createElement('button');
      btn.className = 'coc-intake-btn';
      btn.type = 'button';
      btn.textContent = 'Enter House Info for a Quote';
      btn.addEventListener('click', openForm);
      div.appendChild(document.createElement('br'));
      div.appendChild(btn);
    }
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function openPanel() { panel.classList.add('coc-open'); bubble.style.display = 'none'; }
  function closePanel() { panel.classList.remove('coc-open'); bubble.style.display = ''; }
  function openForm() { panel.classList.add('coc-form-mode'); }
  function closeForm() { panel.classList.remove('coc-form-mode'); }

  bubble.addEventListener('click', openPanel);
  close.addEventListener('click', closePanel);
  back.addEventListener('click', closeForm);
  root.querySelectorAll('.coc-chip').forEach((btn) => btn.addEventListener('click', () => {
    if (btn.getAttribute('data-action') === 'open-form') { openForm(); return; }
    sendMessage(btn.getAttribute('data-msg'));
  }));
  root.querySelector('.coc-open-quote').addEventListener('click', openForm);

  addMessage('assistant', 'Hi! I can answer questions about selling a house as-is for cash. To request a review, click “Enter House Info for a Quote” above. There is no obligation.');

  async function sendMessage(content) {
    const text = String(content || '').trim();
    if (!text) return;
    addMessage('user', text);
    input.value = '';
    addMessage('assistant', 'Typing...');
    const typing = messages.lastChild;
    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: text, sourceUrl: window.location.href, siteId }),
      });
      const data = await response.json();
      if (data.conversationId) conversationId = data.conversationId;
      typing.remove();
      addMessage('assistant', data.reply || 'I can answer questions, or open the short intake form when you are ready.', Boolean(data.showIntake));
      if (data.showIntake) setTimeout(openForm, 550);
    } catch (error) {
      typing.remove();
      addMessage('assistant', 'I can answer questions, or open the short intake form when you are ready.');
    }
  }

  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formStatus.innerHTML = '';
    const data = Object.fromEntries(new FormData(form).entries());
    const missing = [];
    if (!String(data.name || '').trim()) missing.push('name');
    if (!String(data.phone || '').trim()) missing.push('phone number');
    if (!String(data.propertyCity || '').trim() && !String(data.propertyAddress || '').trim()) missing.push('property city or address');
    if (missing.length) {
      formStatus.innerHTML = `<div class="coc-error">Missing required field${missing.length > 1 ? 's' : ''}: ${escapeHtml(missing.join(', '))}</div>`;
      return;
    }
    formStatus.innerHTML = '<div class="coc-success">Saving lead...</div>';
    try {
      const response = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, conversationId, sourceUrl: window.location.href, siteId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Lead save failed');
      formStatus.innerHTML = '<div class="coc-success">Thanks. The details were saved for follow-up.</div>';
      addMessage('assistant', 'Thanks. The property details have been saved for follow-up. The team can review the information and contact the seller.');
    } catch (error) {
      formStatus.innerHTML = `<div class="coc-error">${escapeHtml(error.message || 'Lead could not be saved.')}</div>`;
    }
  });
})();
