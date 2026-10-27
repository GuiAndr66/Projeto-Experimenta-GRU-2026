/* ConnectGRU: preferências locais, leitura e notificações demonstrativas. */
(() => {
  'use strict';
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const status = document.createElement('p');
  status.className = 'sr-only'; status.setAttribute('role', 'status'); document.body.append(status);
  const announce = message => { status.textContent = message; };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { announce('Não foi possível salvar. As opções continuam ativas nesta página.'); } };
  const defaults = { fontScale: 1, highContrast: false, darkMode: null, reducedMotion: null, highlightLinks: false, letterSpacing: false, lineSpacing: false, strongFocus: false, hideDecoration: false, simpleReading: false, speechRate: 1 };
  let preferences = { ...defaults, ...read('connectgru.accessibility', {}) };
  preferences.fontScale = Math.max(.8, Math.min(2, Number(preferences.fontScale) || 1));
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const classes = { highContrast: 'high-contrast', darkMode: 'dark-mode', reducedMotion: 'reduced-motion', highlightLinks: 'highlight-links', letterSpacing: 'letter-spacing', lineSpacing: 'line-spacing', strongFocus: 'strong-focus', hideDecoration: 'hide-decoration', simpleReading: 'simple-reading' };
  const effective = key => preferences[key] === null ? (key === 'darkMode' ? dark.matches : motion.matches) : preferences[key] === true;
  function apply() {
    document.documentElement.style.setProperty('--font-scale', preferences.fontScale);
    if (preferences.reducedMotion === null) delete document.documentElement.dataset.motionChoice;
    else document.documentElement.dataset.motionChoice = String(preferences.reducedMotion);
    Object.entries(classes).forEach(([key, value]) => document.body.classList.toggle(value, effective(key)));
    document.querySelectorAll('[data-preference]').forEach(input => { input.checked = effective(input.dataset.preference); });
    const output = document.getElementById('fontValue');
    if (output) output.textContent = `${Math.round(preferences.fontScale * 100)}%`;
  }
  apply(); dark.addEventListener('change', apply); motion.addEventListener('change', apply);
  function panel(id, title) {
    const element = document.createElement('dialog'); element.id = id; element.className = 'utility-panel';
    element.setAttribute('aria-labelledby', `${id}Title`);
    element.innerHTML = `<header><h2 id="${id}Title">${title}</h2><button type="button" aria-label="Fechar ${title}">Fechar</button></header>`;
    document.body.append(element); element.querySelector('button').onclick = () => element.close();
    element.addEventListener('click', event => { if (event.target === element) { const rect = element.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) element.close(); } });
    return element;
  }
  function connect(button, dialog) {
    if (!button) return;
    button.hidden = false;
    button.onclick = () => {
      document.querySelectorAll('.utility-panel[open]').forEach(other => other.close());
      if (typeof closeMobileMenu === 'function') closeMobileMenu();
      dialog.showModal(); button.setAttribute('aria-expanded', 'true');
    };
    dialog.addEventListener('close', () => { button.setAttribute('aria-expanded', 'false'); button.focus(); });
  }
  const toggle = document.createElement('button'); toggle.className = 'accessibility-toggle'; toggle.id = 'accessibilityToggle';
  toggle.setAttribute('aria-label', 'Abrir acessibilidade'); toggle.setAttribute('aria-haspopup', 'dialog'); toggle.setAttribute('aria-controls', 'accessibilityPanel'); toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="16" cy="16" r="14"/><circle cx="16" cy="8" r="2" fill="currentColor"/><path d="M7 12l9 2 9-2M16 14v7m0-3-5 8m5-8 5 8"/></svg>';
  document.body.append(toggle);
  const accessibility = panel('accessibilityPanel', 'Acessibilidade');
  const options = entries => entries.map(([key, label]) => `<label><input type="checkbox" data-preference="${key}">${label}</label>`).join('');
  accessibility.insertAdjacentHTML('beforeend', `<p>Escolha como deseja navegar. Suas preferências ficam salvas neste navegador.</p>
    <fieldset><legend>Texto</legend><div class="control-row"><button id="fontDown" aria-label="Diminuir fonte">A−</button><output id="fontValue"></output><button id="fontUp" aria-label="Aumentar fonte">A+</button><button id="fontReset">Fonte original</button></div>${options([['letterSpacing','Espaçar letras'],['lineSpacing','Espaçar linhas']])}</fieldset>
    <fieldset><legend>Aparência e navegação</legend>${options([['highContrast','Alto contraste'],['darkMode','Modo escuro'],['highlightLinks','Destacar links'],['strongFocus','Reforçar foco do teclado']])}</fieldset>
    <fieldset><legend>Conforto de leitura</legend>${options([['simpleReading','Leitura simplificada'],['reducedMotion','Reduzir animações'],['hideDecoration','Ocultar decoração']])}</fieldset>
    <fieldset id="speechControls"><legend>Ouvir o conteúdo</legend><p>Selecione um texto ou ouça os títulos e parágrafos visíveis da página. O trecho atual recebe um contorno.</p><label for="speechRate">Velocidade <select id="speechRate"><option value="0.75">0,75×</option><option value="1">1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label><div class="control-row"><button id="speechStart">Iniciar</button><button id="speechPause" disabled>Pausar</button><button id="speechResume" disabled>Continuar</button><button id="speechStop" disabled>Interromper</button></div><p id="speechStatus" role="status"></p></fieldset>
    <p>Modo escuro e animações seguem o sistema até você escolher uma opção.</p><button id="preferencesReset">Restaurar configurações padrão</button>`);
  const commit = () => { apply(); save('connectgru.accessibility', preferences); };
  accessibility.querySelectorAll('[data-preference]').forEach(input => input.onchange = () => { preferences[input.dataset.preference] = input.checked; commit(); });
  document.getElementById('fontUp').onclick = () => { preferences.fontScale = Math.min(2, +(preferences.fontScale + .1).toFixed(1)); commit(); };
  document.getElementById('fontDown').onclick = () => { preferences.fontScale = Math.max(.8, +(preferences.fontScale - .1).toFixed(1)); commit(); };
  document.getElementById('fontReset').onclick = () => { preferences.fontScale = 1; commit(); };
  document.getElementById('preferencesReset').onclick = () => { stop(); preferences = { ...defaults }; rate.value = '1'; commit(); announce('Configurações padrão restauradas.'); };
  connect(toggle, accessibility); apply();
  document.getElementById('loginModal')?.addEventListener('cancel', event => { event.preventDefault(); closeLoginModal(); });
  const viewport = window.visualViewport;
  const resizePanels = () => {
    document.querySelectorAll('.utility-panel').forEach(element => {
      element.style.maxHeight = `${Math.max(120, (viewport?.height || innerHeight) - 24)}px`;
      element.style.bottom = `${Math.max(0, innerHeight - (viewport?.height || innerHeight) - (viewport?.offsetTop || 0)) + 8}px`;
    });
  };
  viewport?.addEventListener('resize', resizePanels);
  viewport?.addEventListener('scroll', resizePanels);
  window.addEventListener('resize', resizePanels);
  resizePanels();
  const rate = document.getElementById('speechRate'); rate.value = String(preferences.speechRate);
  const speechStatus = document.getElementById('speechStatus');
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let queue = [], current = 0, active = false, generation = 0;
  const speechButtons = state => ['Start','Pause','Resume','Stop'].forEach(name => { document.getElementById(`speech${name}`).disabled = !supported || !({ idle: ['Start'], reading: ['Start','Pause','Stop'], paused: ['Start','Resume','Stop'] }[state].includes(name)); });
  function clearHighlight() { document.querySelectorAll('.speaking').forEach(node => node.classList.remove('speaking')); }
  function stop() { generation++; active = false; if (supported) speechSynthesis.cancel(); clearHighlight(); speechButtons('idle'); speechStatus.textContent = 'Leitura interrompida.'; }
  function speakNext() {
    clearHighlight();
    if (!active || current >= queue.length) { active = false; speechButtons('idle'); speechStatus.textContent = 'Leitura concluída.'; return; }
    const item = queue[current]; item.node?.classList.add('speaking');
    const utterance = new SpeechSynthesisUtterance(item.text); utterance.lang = 'pt-BR'; utterance.rate = Number(rate.value);
    const voice = speechSynthesis.getVoices().find(voice => voice.lang.toLowerCase() === 'pt-br'); if (voice) utterance.voice = voice;
    const token = generation;
    speechStatus.textContent = `Lendo trecho ${current + 1} de ${queue.length}.`;
    utterance.onend = () => { if (token === generation) { current++; speakNext(); } };
    utterance.onerror = () => { if (token === generation) { stop(); speechStatus.textContent = 'Não foi possível ler. Verifique se há uma voz em português instalada.'; } };
    speechSynthesis.speak(utterance);
  }
  document.getElementById('speechStart').onclick = () => {
    const selection = window.getSelection().toString().trim(); stop();
    queue = selection ? [{ text: selection }] : [...document.querySelectorAll('main h1,main h2,main h3,main p')].filter(node => node.getClientRects().length).map(node => ({ node, text: node.textContent.trim() })).filter(item => item.text);
    current = 0; active = true; speechButtons('reading'); speakNext();
  };
  document.getElementById('speechPause').onclick = () => { speechSynthesis.pause(); speechButtons('paused'); speechStatus.textContent = 'Leitura pausada.'; };
  document.getElementById('speechResume').onclick = () => { speechSynthesis.resume(); speechButtons('reading'); speechStatus.textContent = 'Leitura retomada.'; };
  document.getElementById('speechStop').onclick = stop;
  rate.onchange = () => { preferences.speechRate = Number(rate.value); commit(); if (active) { generation++; speechSynthesis.cancel(); speechButtons('reading'); speakNext(); } };
  speechButtons('idle'); if (!supported) speechStatus.textContent = 'Este navegador não oferece leitura em voz alta. Você pode usar o leitor de tela do dispositivo.';
  window.addEventListener('pagehide', () => { if (supported) speechSynthesis.cancel(); });

  // Substitua somente list() para conectar uma API. Nenhum dado pessoal é persistido.
  const notificationSource = { async list() { return [
    { id: 'demo-service', category: 'Serviços', title: 'Exemplo: novo serviço no catálogo', detail: 'Demonstração de como um serviço adicionado poderá aparecer. Nenhum serviço real foi cadastrado por este aviso.', date: '2026-10-26T09:00:00-03:00' },
    { id: 'demo-benefit', category: 'Programas e benefícios', title: 'Exemplo: atualização de programa', detail: 'Espaço demonstrativo para futuras atualizações verificadas de programas e benefícios.', date: '2026-10-25T14:00:00-03:00' },
    { id: 'demo-platform', category: 'Plataforma', title: 'Exemplo: aviso da plataforma', detail: 'Demonstração de aviso interno. Não representa comunicado oficial da Prefeitura.', date: '2026-10-24T10:00:00-03:00' },
    { id: 'demo-hours', category: 'Atendimento', title: 'Exemplo: mudança no atendimento', detail: 'Demonstração de aviso sobre horários. Consulte os canais oficiais antes de se deslocar.', date: '2026-10-23T08:00:00-03:00' }
  ]; } };
  const notifications = panel('notificationsPanel', 'Notificações');
  notifications.insertAdjacentHTML('beforeend', '<p>Exemplos locais para demonstração. Não são comunicados oficiais e não representam solicitações pessoais.</p><label><input type="checkbox" id="unreadOnly">Somente não lidas</label><button id="readAll">Marcar todas como lidas</button><div id="notificationList" aria-live="polite"></div>');
  const storedIds = read('connectgru.notifications.read', []);
  const readIds = new Set(Array.isArray(storedIds) ? storedIds.filter(id => typeof id === 'string') : []);
  let items = [];
  const notificationButton = document.getElementById('notificationToggle'); connect(notificationButton, notifications);
  const list = document.getElementById('notificationList');
  function render() {
    const unread = items.filter(item => !readIds.has(item.id)).length;
    const count = document.getElementById('notificationCount');
    if (count) count.textContent = unread || '';
    notificationButton?.setAttribute('aria-label', `Notificações: ${unread} não lidas`);
    list.replaceChildren();
    const filtered = items.filter(item => !document.getElementById('unreadOnly').checked || !readIds.has(item.id));
    if (!filtered.length) { const empty = document.createElement('p'); empty.textContent = 'Nenhuma notificação nesta lista.'; list.append(empty); }
    filtered.forEach(item => {
      const article = document.createElement('article');
      const title = document.createElement('h3'); title.textContent = item.title;
      const category = document.createElement('p'); category.textContent = `${item.category} · ${readIds.has(item.id) ? 'Lida' : 'Não lida'} · Demonstração`;
      const time = document.createElement('time'); time.dateTime = item.date; time.textContent = new Date(item.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + ' (Brasília)';
      const details = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'Visualizar detalhes'; const description = document.createElement('p'); description.textContent = item.detail; details.append(summary, description);
      article.append(title, category, time, details);
      if (!readIds.has(item.id)) { const button = document.createElement('button'); button.textContent = 'Marcar como lida'; button.setAttribute('aria-label', `Marcar como lida: ${item.title}`); button.onclick = () => { readIds.add(item.id); save('connectgru.notifications.read', [...readIds]); render(); document.getElementById('readAll').focus(); }; article.append(button); }
      list.append(article);
    });
  }
  document.getElementById('unreadOnly').onchange = render;
  document.getElementById('readAll').onclick = () => { items.forEach(item => readIds.add(item.id)); save('connectgru.notifications.read', [...readIds]); render(); };
  notificationSource.list().then(result => { items = result; render(); }).catch(() => { list.textContent = 'Não foi possível carregar os exemplos. Recarregue para tentar novamente.'; });
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  if (mobileMenu && hamburger) {
    mobileMenu.inert = !mobileMenu.classList.contains('open');
    hamburger.setAttribute('aria-controls', 'mobileMenu');
    new MutationObserver(() => { mobileMenu.inert = !mobileMenu.classList.contains('open'); }).observe(mobileMenu, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && mobileMenu.classList.contains('open')) { closeMobileMenu(); hamburger.focus(); } });
  }
})();
