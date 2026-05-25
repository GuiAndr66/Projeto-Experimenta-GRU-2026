/* ================================================
   CONECTA GRU – script.js
   SDS Guarulhos · Plataforma de Serviços Sociais
   ================================================ */

'use strict';

// ===========================
// NAVBAR – scroll & active link
// ===========================

const navbar    = document.getElementById('navbar');
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');

/**
 * Adição de classe 'scrolled' na navbar ao rolar a página,
 * e destaque do link ativo conforme seção visível.
 */
window.addEventListener('scroll', () => {
  // Efeito sombra no navbar
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  // Link ativo
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) current = section.id;
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}, { passive: true });


// ===========================
// MOBILE MENU
// ===========================

const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  mobileMenu.setAttribute('aria-hidden', !isOpen);
});

/** Fecha menu mobile */
function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
}

// Fecha ao clicar fora
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
    closeMobileMenu();
  }
});


// ===========================
// MODAL DE LOGIN
// ===========================

const loginModal        = document.getElementById('loginModal');
const modalProgramBadge = document.getElementById('modalProgramBadge');

/**
 * Abre o modal de login para um determinado programa.
 * @param {string} program - Nome do programa selecionado
 */
function openLoginModal(program) {
  loginModal.classList.add('open');
  loginModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (program && program !== 'acesso') {
    modalProgramBadge.textContent = `Acesso: ${program}`;
  } else {
    modalProgramBadge.textContent = '';
  }

  // Foco no primeiro campo
  setTimeout(() => {
    const firstInput = loginModal.querySelector('input');
    if (firstInput) firstInput.focus();
  }, 200);
}

/** Fecha o modal de login */
function closeLoginModal() {
  loginModal.classList.remove('open');
  loginModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Fechar ao clicar no overlay
loginModal.addEventListener('click', (e) => {
  if (e.target === loginModal) closeLoginModal();
});

// Fechar com tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLoginModal();
});

/**
 * Lida com o envio do formulário de login (simulação).
 */
function handleLogin() {
  const cpf   = document.getElementById('loginCpf').value.trim();
  const senha = document.getElementById('loginSenha').value.trim();

  if (!cpf) {
    showToast('Por favor, informe seu CPF ou e-mail.', 'error');
    document.getElementById('loginCpf').focus();
    return;
  }
  if (!senha) {
    showToast('Por favor, informe sua senha.', 'error');
    document.getElementById('loginSenha').focus();
    return;
  }

  const btn = loginModal.querySelector('.btn-modal-primary');
  btn.textContent = 'Entrando...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Acesso concedido!
    `;
    btn.style.background = '#1b5e20';

    showToast('✓ Bem-vindo à plataforma Conecta GRU!', 'success');

    setTimeout(() => {
      closeLoginModal();
      // Resetar botão
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        Entrar na Plataforma
      `;
      btn.style.background = '';
      btn.disabled = false;
      document.getElementById('loginCpf').value = '';
      document.getElementById('loginSenha').value = '';
    }, 1800);
  }, 1400);
}

/**
 * Alterna visibilidade do campo de senha.
 */
function togglePassword() {
  const input    = document.getElementById('loginSenha');
  const icon     = document.getElementById('eyeIcon');
  const isHidden = input.type === 'password';

  input.type = isHidden ? 'text' : 'password';

  icon.innerHTML = isHidden
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
       <line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
}


// ===========================
// TOAST NOTIFICATION
// ===========================

const toastEl = document.getElementById('toast');
let toastTimer;

/**
 * Exibe uma notificação toast.
 * @param {string} message - Mensagem a exibir
 * @param {'info'|'success'|'error'} type - Tipo visual
 * @param {number} duration - Duração em ms (default: 3200)
 */
function showToast(message, type = 'info', duration = 3200) {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.className   = `toast ${type} show`;

  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, duration);
}


// ===========================
// CHATBOT / ASSISTENTE IA
// ===========================

const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');

/**
 * Base de conhecimento simplificada do assistente.
 */
const knowledgeBase = [
  {
    keywords: ['agendar', 'agendamento', 'marcar', 'consulta', 'atendimento', 'reservar'],
    response: `📅 <strong>Agendamento de Serviços</strong><br/><br/>
      Para qual serviço você deseja agendar um atendimento?<br/><br/>
      <div class="chat-suggestions" style="padding:0; margin-top:8px;">
        <button class="chat-suggestion" onclick="escolherUnidade('CRAS')">CRAS</button>
        <button class="chat-suggestion" onclick="escolherUnidade('CREAS')">CREAS</button>
        <button class="chat-suggestion" onclick="escolherUnidade('Auxílio Alimentação')">Alimentação</button>
        <button class="chat-suggestion" onclick="escolherUnidade('Apoio Psicológico')">Psicológico</button>
        <button class="chat-suggestion" onclick="escolherUnidade('Proteção à Mulher')">Proteção à Mulher</button>
        <button class="chat-suggestion" onclick="escolherUnidade('Atendimento ao Idoso')">Idoso</button>
        <button class="chat-suggestion" onclick="escolherUnidade('Cadastro Social')">Cadastro Social</button>
        <button class="chat-suggestion" onclick="escolherUnidade('Juventude Ativa')">Juventude</button>
      </div>`
  },
  {
    keywords: ['cesta', 'aliment', 'fome', 'comida', 'basic', 'auxílio aliment', 'cesta básica'],
    response: `🍽️ <strong>Auxílio Alimentação</strong><br/><br/>
      O programa distribui cestas básicas mensalmente para famílias inscritas no CadÚnico 
      com renda per capita de até R$ 218,00.<br/><br/>
      📍 <strong>Como acessar:</strong><br/>
      Dirija-se ao CRAS mais próximo da sua região com CPF, RG e comprovante de renda.<br/><br/>
      🕐 Distribuição: toda primeira quinzena do mês.`
  },
  {
    keywords: ['violência', 'violencia', 'mulher', 'agressão', 'agressao', 'doméstic', 'assédio', 'abuso'],
    response: `🆘 <strong>Proteção à Mulher</strong><br/><br/>
      Se você ou alguém está em situação de violência doméstica, <strong>ligue 180</strong> 
      (gratuito, 24h) — Central de Atendimento à Mulher.<br/><br/>
      📍 Em Guarulhos, o <strong>CREAS</strong> oferece atendimento especializado, 
      acolhimento e orientação jurídica gratuita.<br/><br/>
      🔒 Todo atendimento é sigiloso e gratuito.`
  },
  {
    keywords: ['idoso', 'idosa', 'terceira idade', 'velho', 'aposentado', 'senior'],
    response: `👴 <strong>Atendimento ao Idoso</strong><br/><br/>
      Guarulhos oferece serviços especializados para pessoas com 60 anos ou mais:<br/><br/>
      • Centro de Convivência do Idoso (CCI)<br/>
      • Acompanhamento de cuidadores<br/>
      • Proteção contra maus-tratos e abandono<br/>
      • Benefícios de prestação continuada (BPC)<br/><br/>
      📍 Acesse o CRAS da sua região para agendamento prioritário.`
  },
  {
    keywords: ['cras', 'referência', 'assistência social', 'vulnerabilidade'],
    response: `🏠 <strong>CRAS – Centro de Referência de Assistência Social</strong><br/><br/>
      O CRAS é a porta de entrada dos serviços sociais. Atende famílias em situação 
      de vulnerabilidade social.<br/><br/>
      📍 <strong>Unidades em Guarulhos:</strong><br/>
      • CRAS Centro – R. das Acácias, 230<br/>
      • CRAS Pimentas – Av. dos Pimentas, 1.450<br/>
      • CRAS Sul – Av. Guarulhos, 800<br/><br/>
      🕐 Atendimento: Seg–Sex, 8h às 17h`
  },
  {
    keywords: ['creas', 'especializado', 'violação', 'direito'],
    response: `❤️ <strong>CREAS – Atendimento Especializado</strong><br/><br/>
      O CREAS atende situações de maior vulnerabilidade: violência, exploração e 
      violação de direitos.<br/><br/>
      📍 CREAS Guarulhos – R. Voluntários da Pátria, 540 – Centro<br/>
      🕐 Seg–Sex: 8h às 17h<br/><br/>
      Em emergências fora do horário, acione o <strong>0800-722-8030</strong>.`
  },
  {
    keywords: ['psicológ', 'psicolog', 'saúde mental', 'depressão', 'ansiedade', 'terapia', 'emocional'],
    response: `🧠 <strong>Apoio Psicológico Gratuito</strong><br/><br/>
      A SDS de Guarulhos oferece atendimento psicossocial gratuito para indivíduos 
      e famílias em sofrimento emocional.<br/><br/>
      📝 Documentos necessários: RG e CPF<br/>
      🕐 Agendamento: (11) 2408-0008<br/><br/>
      Se estiver em crise, acesse o <strong>CVV: ligue 188</strong> (24h, gratuito).`
  },
  {
    keywords: ['jovem', 'juventude', 'jovens', 'adolescente', 'jovem ativ', 'menor', 'menor de idade', '15', '16', '17', '18', '19'],
    response: `⭐ <strong>Programa Juventude Ativa</strong><br/><br/>
      Para jovens de 15 a 29 anos em situação de vulnerabilidade:<br/><br/>
      • Cursos profissionalizantes gratuitos<br/>
      • Atividades culturais e esportivas<br/>
      • Orientação para primeiro emprego<br/>
      • Apoio educacional<br/><br/>
      📝 Inscrições no CRAS da sua região com RG e CPF.`
  },
  {
    keywords: ['cadastr', 'cadunico', 'cadastro único', 'bolsa', 'benefício', 'bpc'],
    response: `📋 <strong>Cadastro Social – CadÚnico</strong><br/><br/>
      O CadÚnico é o registro para acesso a programas sociais federais e municipais.<br/><br/>
      ✅ Quem tem direito: famílias com renda até ½ salário mínimo por pessoa.<br/><br/>
      📍 Faça seu cadastro no CRAS mais próximo.<br/>
      📄 Documentos: CPF, RG, comprovante de residência e renda.`
  },
  {
    keywords: ['endereço', 'endereco', 'localização', 'localizacao', 'onde fica', 'onde está', 'próximo', 'proximo'],
    response: `📍 <strong>Principais Unidades da SDS Guarulhos:</strong><br/><br/>
      • <strong>CRAS Centro</strong> – R. das Acácias, 230<br/>
      • <strong>CRAS Pimentas</strong> – Av. dos Pimentas, 1.450<br/>
      • <strong>CRAS Sul</strong> – Av. Guarulhos, 800<br/>
      • <strong>CREAS</strong> – R. Voluntários da Pátria, 540<br/><br/>
      🕐 Todos: Seg–Sex, 8h–17h<br/>
      📞 Central: (11) 2408-0008`
  },
  {
    keywords: ['horário', 'horario', 'funcionamento', 'aberto', 'abre', 'fecha'],
    response: `🕐 <strong>Horários de Atendimento:</strong><br/><br/>
      • CRAS e CREAS: Seg–Sex, <strong>8h às 17h</strong><br/>
      • UBS: Seg–Sex, <strong>7h às 19h</strong><br/>
      • Emergência social: <strong>24h – 0800-722-8030</strong><br/>
      • Central 156: <strong>24h</strong><br/>
      • Assistente IA: <strong>sempre disponível</strong> 😊`
  },
  {
    keywords: ['documento', 'documentos', 'preciso', 'o que trazer', 'o que preciso'],
    response: `📄 <strong>Documentos geralmente necessários:</strong><br/><br/>
      • RG e CPF (de todos da família)<br/>
      • Certidão de nascimento (crianças)<br/>
      • Comprovante de residência (últimos 3 meses)<br/>
      • Comprovante de renda ou declaração de hipossuficiência<br/>
      • Cartão do SUS<br/><br/>
      ℹ️ Cada programa pode exigir documentos adicionais.`
  },
  {
    keywords: ['obrigado', 'obrigada', 'valeu', 'vlw', 'thanks', 'muito obrigado'],
    response: `😊 De nada! Fico feliz em ajudar.<br/><br/>
      Se precisar de mais informações ou quiser agendar um atendimento, 
      estou aqui! Você também pode ligar para <strong>(11) 2408-0008</strong> 
      para falar com nossa equipe presencialmente.`
  },
  {
    keywords: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'hello'],
    response: `👋 <strong>Olá! Seja bem-vindo(a) ao Conecta GRU!</strong><br/><br/>
      Sou o assistente virtual da SDS Guarulhos. Posso te ajudar a encontrar:<br/><br/>
      • 🍽️ Auxílio alimentação<br/>
      • 🏠 CRAS e CREAS<br/>
      • 🧠 Apoio psicológico<br/>
      • 👴 Atendimento ao idoso<br/>
      • ⭐ Programas para jovens<br/><br/>
      O que você precisa hoje? (Ex: "Agendar atendimento")`
  }
];

const defaultResponse = `🤔 Entendi sua dúvida! Para informações específicas, 
  nesta equipe pode ajudar melhor.<br/><br/>
  📞 <strong>Central de Atendimento:</strong> (11) 2408-0008<br/>
  🕐 Seg–Sex: 8h às 17h<br/><br/>
  Ou tente perguntar sobre: <em>Agendar atendimento, CRAS, alimentação, psicológico, idoso, jovens</em>`;

/**
 * Retorna a resposta do chatbot baseada em palavras-chave.
 */
function getBotResponse(input) {
  const lower = input.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const entry of knowledgeBase) {
    for (const keyword of entry.keywords) {
      const keyNorm = keyword.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      if (lower.includes(keyNorm)) {
        return entry.response;
      }
    }
  }
  return defaultResponse;
}

/**
 * Envia a mensagem do usuário e exibe a resposta do bot.
 */
function sendChat() {
  const value = chatInput.value.trim();
  if (!value) return;

  appendMessage(value, 'user');
  chatInput.value = '';

  const suggestions = chatMessages.querySelector('.chat-suggestions');
  if (suggestions) suggestions.remove();

  const typingDiv = document.createElement('div');
  typingDiv.classList.add('chat-msg', 'bot');
  typingDiv.innerHTML = `
    <div class="chat-typing">
      <span></span><span></span><span></span>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  scrollChat();

  const delay = 900 + Math.random() * 600;
  setTimeout(() => {
    typingDiv.remove();
    const response = getBotResponse(value);
    appendMessage(response, 'bot');
    
    // Se não for um fluxo de múltiplos passos (como o agendamento que tem botões próprios), 
    // oferece a barra de avaliação após a resposta simples.
    if (!response.includes('onclick="escolherUnidade') && !response.includes('onclick="iniciarAgendamento')) {
      setTimeout(() => oferecerAvaliacao(), 1000);
    }
  }, delay);
}

function sendSuggestion(btn) {
  chatInput.value = btn.textContent;
  sendChat();
}

function appendMessage(text, type) {
  const now   = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const mins  = now.getMinutes().toString().padStart(2, '0');

  const msgDiv = document.createElement('div');
  msgDiv.classList.add('chat-msg', type);

  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble');
  bubble.innerHTML = type === 'user' ? escapeHTML(text) : text;

  const timeSpan = document.createElement('span');
  timeSpan.classList.add('chat-time');
  timeSpan.textContent = `${hours}:${mins}`;

  msgDiv.appendChild(bubble);
  msgDiv.appendChild(timeSpan);
  chatMessages.appendChild(msgDiv);
  scrollChat();
}

function scrollChat() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escolherUnidade(servico) {
  appendMessage(`Quero agendar: ${servico}`, 'user');
  
  const respuestaBot = `Você selecionou <strong>${servico}</strong>.<br/><br/>
    Em qual região você prefere ser atendido(a)?
    <div class="chat-suggestions" style="padding:0; margin-top:8px;">
      <button class="chat-suggestion" onclick="iniciarAgendamento('${servico}', 'Centro')">Unidade Centro</button>
      <button class="chat-suggestion" onclick="iniciarAgendamento('${servico}', 'Pimentas')">Unidade Pimentas</button>
      <button class="chat-suggestion" onclick="iniciarAgendamento('${servico}', 'Sul')">Unidade Sul</button>
      <button class="chat-suggestion" onclick="iniciarAgendamento('${servico}', 'Norte')">Unidade Norte</button>
    </div>`;
    
  simularDigitacao(respuestaBot);
}

function iniciarAgendamento(servico, unidade) {
  appendMessage(`Prefiro na Unidade ${unidade}`, 'user');
  
  const horarios = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];
  
  let botoesHorarios = '';
  horarios.forEach(hora => {
    botoesHorarios += `<button class="chat-suggestion" onclick="confirmarAgendamento('${servico}', '${unidade}', '${hora}')">${hora}</button>`;
  });

  const respuestaBot = `Perfeito, vamos agendar na <strong>Unidade ${unidade}</strong>.<br/><br/>
    Estes são os horários disponíveis para os próximos dias. Qual você prefere?
    <div class="chat-suggestions" style="padding:0; margin-top:8px;">
      ${botoesHorarios}
    </div>`;
    
  simularDigitacao(respuestaBot);
}

function confirmarAgendamento(servico, unidade, horario) {
  appendMessage(`Prefiro às ${horario}`, 'user');
  
  const respuestaBot = `✅ <strong>Agendamento Confirmado!</strong><br/><br/>
    Serviço: <strong>${servico}</strong><br/>
    Unidade: <strong>${unidade}</strong><br/>
    Horário: <strong>${horario}</strong><br/><br/>
    Um SMS com os detalhes, protocolo e a data exata será enviado para o seu número cadastrado. Por favor, lembre-se de levar um documento com foto.`;
    
  simularDigitacao(respuestaBot);
  
  // Oferece a avaliação do chatbot logo após a finalização do agendamento
  setTimeout(() => oferecerAvaliacao(), 2000);
}

function simularDigitacao(resposta) {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('chat-msg', 'bot');
  typingDiv.innerHTML = `
    <div class="chat-typing">
      <span></span><span></span><span></span>
    </div>
  `;
  document.getElementById('chatMessages').appendChild(typingDiv);
  scrollChat();

  const delay = 900 + Math.random() * 600;
  setTimeout(() => {
    typingDiv.remove();
    appendMessage(resposta, 'bot');
  }, delay);
}

/* ===================================================
   NOVA FUNÇÃO: SISTEMA DE AVALIAÇÃO DO CHATBOT
   =================================================== */

/**
 * Exibe a caixa de avaliação por estrelas no chat de forma amigável.
 */
function oferecerAvaliacao() {
  // Verifica se já não existe um bloco de avaliação aberto na tela para não duplicar
  if (document.querySelector('.chat-evaluation-container')) return;

  const msgDiv = document.createElement('div');
  msgDiv.classList.add('chat-msg', 'bot', 'chat-evaluation-container');

  // Adiciona a estrutura com 5 estrelas usando entidades HTML ou texto básico configurável por CSS
  msgDiv.innerHTML = `
    <div class="chat-bubble" style="background: #f5f5f5; border: 1px solid #e0e0e0; color: #333;">
      ⭐ <strong>Como foi seu atendimento?</strong><br/>
      Sua avaliação nos ajuda a melhorar os serviços de Guarulhos.<br/>
      <div class="rating-stars" style="margin-top: 10px; display: flex; gap: 6px;">
        <button class="chat-suggestion star-btn" style="padding: 5px 10px;" onclick="submeterAvaliacao(1)">1 ★</button>
        <button class="chat-suggestion star-btn" style="padding: 5px 10px;" onclick="submeterAvaliacao(2)">2 ★</button>
        <button class="chat-suggestion star-btn" style="padding: 5px 10px;" onclick="submeterAvaliacao(3)">3 ★</button>
        <button class="chat-suggestion star-btn" style="padding: 5px 10px;" onclick="submeterAvaliacao(4)">4 ★</button>
        <button class="chat-suggestion star-btn" style="padding: 5px 10px;" onclick="submeterAvaliacao(5)">5 ★</button>
      </div>
    </div>
  `;
  
  chatMessages.appendChild(msgDiv);
  scrollChat();
}

/**
 * Executa a lógica após o clique na nota desejada.
 * @param {number} nota - Nota de 1 a 5
 */
function submeterAvaliacao(nota) {
  const container = document.querySelector('.chat-evaluation-container');
  if (container) {
    // Remove os botões antigos de votação do container para evitar cliques repetidos
    const starsDiv = container.querySelector('.rating-stars');
    if (starsDiv) starsDiv.remove();
  }

  // Envia a resposta visual do usuário simulando a escolha dele
  appendMessage(`Avaliei com nota ${nota} de 5`, 'user');

  // Resposta padrão de agradecimento do Bot
  let feedbackText = 'Obrigado por nos avaliar! 👍';
  if (nota >= 4) {
    feedbackText = '🥰 <strong>Muito obrigado!</strong> Fico feliz em ter ajudado você hoje com as informações da SDS!';
  } else if (nota <= 2) {
    feedbackText = 'Obrigado pelo feedback. 😔 Vamos repassar isso aos nossos desenvolvedores para melhorar o sistema.';
  }

  simularDigitacao(feedbackText);
}


// ===========================
// ACCESSIBILITY
// ===========================

let fontScale    = 1;
let highContrast = false;

document.getElementById('btnContrast').addEventListener('click', function() {
  highContrast = !highContrast;
  document.body.classList.toggle('high-contrast', highContrast);
  this.setAttribute('aria-pressed', highContrast);
  showToast(
    highContrast ? '♿ Alto contraste ativado' : 'Alto contraste desativado',
    'info',
    2000
  );
});

document.getElementById('btnFontUp').addEventListener('click', () => {
  if (fontScale >= 1.4) {
    showToast('Tamanho máximo de fonte atingido.', 'info', 2000);
    return;
  }
  fontScale = Math.min(fontScale + 0.1, 1.4);
  document.documentElement.style.setProperty('--font-scale', fontScale);
  showToast('Fonte aumentada', 'info', 1800);
});

document.getElementById('btnFontDown').addEventListener('click', () => {
  if (fontScale <= 0.8) {
    showToast('Tamanho mínimo de fonte atingido.', 'info', 2000);
    return;
  }
  fontScale = Math.max(fontScale - 0.1, 0.8);
  document.documentElement.style.setProperty('--font-scale', fontScale);
  showToast('Fonte diminuída', 'info', 1800);
});


// ===========================
// COUNTERS (impact bar)
// ===========================

function animateCounter(el, target, suffix = '', duration = 2000) {
  const start = performance.now();

  function step(timestamp) {
    const elapsed  = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(2, -10 * progress);
    const current = Math.floor(ease * target);

    el.textContent = current >= 1000
      ? '+' + (current / 1000).toFixed(1) + ' mil'
      : current + suffix;

    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target >= 1000
      ? '+' + (target / 1000).toFixed(0) + ' mil'
      : target + suffix;
  }

  requestAnimationFrame(step);
}


// ===========================
// SCROLL REVEAL + OBSERVERS
// ===========================

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const items = entry.target.querySelectorAll('.impact-item[data-count]');
      items.forEach((item, i) => {
        const count  = parseInt(item.dataset.count, 10);
        const suffix = item.dataset.suffix || '';
        const el     = item.querySelector('.impact-number');
        if (el) setTimeout(() => animateCounter(el, count, suffix, 1800), i * 200);
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar-fill').forEach((bar, i) => {
        setTimeout(() => bar.classList.add('animate'), i * 120);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });


// ===========================
// INIT
// ===========================

document.addEventListener('DOMContentLoaded', () => {

  const animatables = document.querySelectorAll(
    '.program-card, .unit-card, .kpi-card, .chart-card, .contact-card, .impact-card, .section-header, .hero-content'
  );
  animatables.forEach((el, i) => {
    el.classList.add('reveal');
    if (el.closest('.programs-grid, .contact-grid, .impact-cards, .dash-top')) {
      const siblings = el.parentElement.children;
      const index    = Array.from(siblings).indexOf(el);
      if (index < 4) el.classList.add(`delay-${index + 1}`);
    }
    revealObserver.observe(el);
  });

  const impactBar = document.querySelector('.impact-bar');
  if (impactBar) counterObserver.observe(impactBar);

  const barChart = document.querySelector('.bar-chart');
  if (barChart) barObserver.observe(barChart);

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 120;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  setTimeout(() => {
    appendMessage(
      `💡 <strong>Dica:</strong> Você pode perguntar sobre qualquer serviço social de Guarulhos — 
      CRAS, alimentação, apoio psicológico, proteção à mulher, realizar agendamentos e muito mais!`,
      'bot'
    );
  }, 2500);

  console.log('%c🌐 Conecta GRU', 'color:#004aad;font-size:18px;font-weight:bold;');
  console.log('%cPlataforma de Serviços Sociais – SDS Guarulhos', 'color:#555;font-size:12px;');
});


// ===========================
// KEYBOARD NAVIGATION
// ===========================

document.querySelectorAll('.program-card, .unit-card').forEach(card => {
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const btn = card.querySelector('button');
      if (btn) btn.click();
    }
  });
});

// ===========================
// MAPA INTERATIVO (Leaflet)
// ===========================
function initMap() {
  const mapEl = document.getElementById('mapa-guarulhos');
  if (!mapEl) return;

  const map = L.map('mapa-guarulhos').setView([-23.4545, -46.5333], 12);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  const iconBlue = L.divIcon({ className: 'custom-pin blue', html: '<div class="pin-inner"></div>', iconSize: [22, 22] });
  const iconRed = L.divIcon({ className: 'custom-pin red', html: '<div class="pin-inner"></div>', iconSize: [22, 22] });
  const iconGreen = L.divIcon({ className: 'custom-pin green', html: '<div class="pin-inner"></div>', iconSize: [22, 22] });

  const unidades = [
    { nome: 'CRAS Centro', end: 'R. das Acacia, 230', lat: -23.4695, lng: -46.5280, icone: iconBlue },
    { nome: 'CRAS Pimentas', end: 'Av. dos Pimentas, 1.450', lat: -23.4410, lng: -46.4020, icone: iconBlue },
    { nome: 'CRAS Sul', end: 'Av. Guarulhos, 800', lat: -23.4655, lng: -46.5510, icone: iconBlue },
    { nome: 'CREAS Guarulhos', end: 'R. Voluntários da Pátria, 540', lat: -23.4650, lng: -46.5300, icone: iconRed },
    { nome: 'UBS Norte', end: 'Diversas regiões', lat: -23.4450, lng: -46.5500, icone: iconGreen }
  ];

  unidades.forEach(u => {
    L.marker([u.lat, u.lng], { icon: u.icone })
      .addTo(map)
      .bindPopup(`<strong>${u.nome}</strong><br><span style="font-size:0.85rem">${u.end}</span>`);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();
});