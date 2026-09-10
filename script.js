const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const STORAGE = {
  mood: 'iza-space:mood',
  ideas: 'iza-space:ideas',
  tasks: 'iza-space:tasks',
  brain: 'iza-space:brain'
};

const defaultTasks = [
  { id: crypto.randomUUID(), text: 'Finalizar conteúdo prioritário', category: 'today', done: false },
  { id: crypto.randomUUID(), text: 'Revisar legenda do Instagram', category: 'today', done: false },
  { id: crypto.randomUUID(), text: 'Programar publicação das 18h', category: 'today', done: false },
  { id: crypto.randomUUID(), text: 'Organizar referências da próxima campanha', category: 'week', done: false },
  { id: crypto.randomUUID(), text: 'Receber aprovação da peça institucional', category: 'waiting', done: false },
  { id: crypto.randomUUID(), text: 'Testar novo formato de reel', category: 'later', done: false }
];

const taskLabels = {
  today: 'Hoje',
  week: 'Essa semana',
  waiting: 'Esperando alguém',
  later: 'Depois'
};

let ideas = load(STORAGE.ideas, []);
let tasks = load(STORAGE.tasks, defaultTasks);

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function setPage(pageId) {
  $$('.page').forEach(page => page.classList.toggle('active', page.id === pageId));
  $$('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.page === pageId));
  $('#sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$$('.nav-link').forEach(link => link.addEventListener('click', () => setPage(link.dataset.page)));
$$('[data-goto]').forEach(button => button.addEventListener('click', () => setPage(button.dataset.goto)));

$('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
document.addEventListener('click', event => {
  if (window.innerWidth > 820) return;
  const sidebar = $('#sidebar');
  const menu = $('#menuBtn');
  if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && !menu.contains(event.target)) {
    sidebar.classList.remove('open');
  }
});

function updateDateTime() {
  const now = new Date();
  $('#todayLabel').textContent = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  });
  $('#clockLabel').textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const hour = now.getHours();
  const greeting = hour < 12 ? 'good morning, iza ♡' : hour < 18 ? 'good afternoon, iza ♡' : 'good evening, iza ♡';
  const greetingEl = $('.hero-card .eyebrow');
  if (greetingEl) greetingEl.textContent = greeting;
}
updateDateTime();
setInterval(updateDateTime, 30000);

function applyMood(mood, label) {
  $('#moodFace').textContent = mood;
  $('#moodText').textContent = label;
  $$('.mood-options button').forEach(btn => btn.classList.toggle('active', btn.dataset.mood === mood));
  save(STORAGE.mood, { mood, label });
}

$$('.mood-options button').forEach(button => {
  button.addEventListener('click', () => applyMood(button.dataset.mood, button.dataset.label));
});

const savedMood = load(STORAGE.mood, null);
if (savedMood) applyMood(savedMood.mood, savedMood.label);

function createIdea(text) {
  const cleaned = text.trim();
  if (!cleaned) return false;
  ideas.unshift({
    id: crypto.randomUUID(),
    text: cleaned,
    createdAt: new Date().toISOString()
  });
  save(STORAGE.ideas, ideas);
  renderIdeas();
  return true;
}

function renderIdeas() {
  const grid = $('#ideaGrid');
  if (!ideas.length) {
    grid.innerHTML = `<article class="idea-card"><p>Seu jardim está vazio por enquanto. Joga aquela primeira ideia aqui ✿</p><footer><small>comece sem pressão</small></footer></article>`;
  } else {
    grid.innerHTML = ideas.map(idea => {
      const date = new Date(idea.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      return `<article class="idea-card" data-id="${idea.id}">
        <p>${escapeHTML(idea.text)}</p>
        <footer><small>${date}</small><button class="idea-delete" data-delete-idea="${idea.id}" aria-label="Excluir ideia">×</button></footer>
      </article>`;
    }).join('');
  }
  $('#ideaCount').textContent = ideas.length;
}

$('#ideaForm').addEventListener('submit', event => {
  event.preventDefault();
  if (createIdea($('#ideaInput').value)) {
    $('#ideaInput').value = '';
    $('#ideaChars').textContent = '0/240';
  }
});

$('#ideaInput').addEventListener('input', event => {
  $('#ideaChars').textContent = `${event.target.value.length}/240`;
});

$('#homeIdeaForm').addEventListener('submit', event => {
  event.preventDefault();
  if (createIdea($('#homeIdeaInput').value)) {
    $('#homeIdeaInput').value = '';
    setPage('ideas');
  }
});

$('#ideaGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-delete-idea]');
  if (!button) return;
  ideas = ideas.filter(idea => idea.id !== button.dataset.deleteIdea);
  save(STORAGE.ideas, ideas);
  renderIdeas();
});

const modal = $('#ideaModal');
$('#quickIdeaBtn').addEventListener('click', () => {
  modal.hidden = false;
  setTimeout(() => $('#modalIdeaInput').focus(), 0);
});
$('#modalClose').addEventListener('click', () => modal.hidden = true);
modal.addEventListener('click', event => {
  if (event.target === modal) modal.hidden = true;
});
$('#modalIdeaForm').addEventListener('submit', event => {
  event.preventDefault();
  if (createIdea($('#modalIdeaInput').value)) {
    $('#modalIdeaInput').value = '';
    modal.hidden = true;
    setPage('ideas');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !modal.hidden) modal.hidden = true;
});

function renderTasks() {
  const board = $('#taskBoard');
  board.innerHTML = Object.entries(taskLabels).map(([category, label]) => {
    const group = tasks.filter(task => task.category === category);
    return `<section class="task-column">
      <h3>${label}<span>${group.length}</span></h3>
      <div>${group.length ? group.map(task => `
        <div class="task-item ${task.done ? 'done' : ''}" data-task="${task.id}">
          <input type="checkbox" ${task.done ? 'checked' : ''} data-toggle-task="${task.id}" aria-label="Concluir tarefa">
          <label>${escapeHTML(task.text)}</label>
          <button class="task-remove" data-remove-task="${task.id}" aria-label="Excluir tarefa">×</button>
        </div>`).join('') : '<small style="color:#b79aa8">Nada aqui por enquanto ♡</small>'}</div>
    </section>`;
  }).join('');
  $('#todayTasksCount').textContent = tasks.filter(task => task.category === 'today' && !task.done).length;
}

$('#taskForm').addEventListener('submit', event => {
  event.preventDefault();
  const input = $('#taskInput');
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: crypto.randomUUID(), text, category: $('#taskCategory').value, done: false });
  save(STORAGE.tasks, tasks);
  input.value = '';
  renderTasks();
});

$('#taskBoard').addEventListener('change', event => {
  const checkbox = event.target.closest('[data-toggle-task]');
  if (!checkbox) return;
  tasks = tasks.map(task => task.id === checkbox.dataset.toggleTask ? { ...task, done: checkbox.checked } : task);
  save(STORAGE.tasks, tasks);
  renderTasks();
});

$('#taskBoard').addEventListener('click', event => {
  const button = event.target.closest('[data-remove-task]');
  if (!button) return;
  tasks = tasks.filter(task => task.id !== button.dataset.removeTask);
  save(STORAGE.tasks, tasks);
  renderTasks();
});

const brainDump = $('#brainDump');
brainDump.value = localStorage.getItem(STORAGE.brain) || '';
let brainTimer;
brainDump.addEventListener('input', () => {
  $('#brainSaved').textContent = 'salvando...';
  clearTimeout(brainTimer);
  brainTimer = setTimeout(() => {
    localStorage.setItem(STORAGE.brain, brainDump.value);
    $('#brainSaved').textContent = 'salvo automaticamente ♡';
  }, 350);
});

function escapeHTML(value) {
  return value.replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  })[char]);
}

renderIdeas();
renderTasks();
