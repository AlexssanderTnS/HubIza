const $ = (s, scope = document) => scope.querySelector(s);
const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
const KEY = {
  page:'iza-space:active-page', profile:'iza-space:profile', mood:'iza-space:mood', ideas:'iza-space:ideas', tasks:'iza-space:tasks', brain:'iza-space:brain',
  content:'iza-space:content', projects:'iza-space:projects', metrics:'iza-space:metrics', metricsHistory:'iza-space:metrics-history', links:'iza-space:links', personal:'iza-space:personal'
};
const load=(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const uid=()=>crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const fmtDate=v=>v?new Date(v).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}):'sem data';
const validPages=['home','content','projects','ideas','analytics','planner','links','myspace','settings'];

function setPage(id,{remember=true}={}){
  if(!validPages.includes(id)) id='home';
  $$('.page').forEach(p=>p.classList.toggle('active',p.id===id));
  $$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
  if(remember){localStorage.setItem(KEY.page,id); history.replaceState(null,'',`#${id}`)}
  $('#sidebar')?.classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('.nav-link').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.page)));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.goto)));
$('#menuBtn')?.addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
window.addEventListener('hashchange',()=>setPage(location.hash.slice(1),{remember:false}));
setPage(validPages.includes(location.hash.slice(1))?location.hash.slice(1):(localStorage.getItem(KEY.page)||'home'),{remember:false});

function updateClock(){const n=new Date(); $('#todayLabel').textContent=n.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'}); $('#clockLabel').textContent=n.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); const p=load(KEY.profile,{}); const nick=p.nickname||'iza'; $('#greetingLabel').textContent=`${n.getHours()<12?'good morning':n.getHours()<18?'good afternoon':'good evening'}, ${nick.toLowerCase()} ♡`;}
updateClock(); setInterval(updateClock,30000);

let profile=load(KEY.profile,{name:'Izadora',nickname:'Iza',role:'Social Media • IBAP-RJ',bio:'Campanhas, ideias, tarefas e vida real no mesmo lugar — porque abrir 27 abas não conta como organização.',reminder:'Você não precisa transformar toda ideia em post hoje.',quote:'Conteúdo bom não precisa gritar. Precisa chegar na pessoa certa.',image:''});
function applyProfile(){
  $('#sidebarName').textContent=profile.name||'Izadora'; $('#sidebarRole').textContent=profile.role||''; $('#heroBio').textContent=profile.bio||''; $('#reminderText').textContent=profile.reminder||''; $('#quoteCard').textContent=`“${profile.quote||''}”`;
  $('#profileName').value=profile.name||''; $('#profileNickname').value=profile.nickname||''; $('#profileRole').value=profile.role||''; $('#profileBio').value=profile.bio||''; $('#profileReminder').value=profile.reminder||''; $('#profileQuote').value=profile.quote||'';
  const initials=(profile.name||'IZ').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
  ['#sidebarAvatar','#profilePreview'].forEach(sel=>{const el=$(sel); if(!el)return; if(profile.image){el.style.backgroundImage=`url(${profile.image})`; el.textContent='';}else{el.style.backgroundImage=''; el.textContent=initials;}}); updateClock();
}
$('#profileForm')?.addEventListener('submit',e=>{e.preventDefault(); profile={...profile,name:$('#profileName').value.trim()||'Izadora',nickname:$('#profileNickname').value.trim()||'Iza',role:$('#profileRole').value.trim(),bio:$('#profileBio').value.trim(),reminder:$('#profileReminder').value.trim(),quote:$('#profileQuote').value.trim()}; save(KEY.profile,profile); applyProfile();});
$('#profileImage')?.addEventListener('change',e=>{const file=e.target.files?.[0]; if(!file)return; const r=new FileReader(); r.onload=()=>{profile.image=r.result; save(KEY.profile,profile); applyProfile()}; r.readAsDataURL(file);});
applyProfile();

const savedMood=load(KEY.mood,null); if(savedMood){$('#moodFace').textContent=savedMood.mood;$('#moodText').textContent=savedMood.label;}
$$('.mood-options button').forEach(b=>b.addEventListener('click',()=>{const m={mood:b.dataset.mood,label:b.dataset.label}; save(KEY.mood,m); $('#moodFace').textContent=m.mood; $('#moodText').textContent=m.label;}));

let ideas=load(KEY.ideas,[]);
function renderIdeas(){const g=$('#ideaGrid'); if(!g)return; g.innerHTML=ideas.length?ideas.map(i=>`<article class="idea-card"><p>${esc(i.text)}</p><footer><small>${fmtDate(i.createdAt)}</small><button class="idea-delete" data-idea-del="${i.id}">×</button></footer></article>`).join(''):'<article class="idea-card"><p>Seu jardim está vazio por enquanto ✿</p></article>'; $('#ideaCount').textContent=ideas.length;}
function addIdea(text){text=text.trim(); if(!text)return; ideas.unshift({id:uid(),text,createdAt:new Date().toISOString()}); save(KEY.ideas,ideas); renderIdeas();}
$('#ideaForm')?.addEventListener('submit',e=>{e.preventDefault(); addIdea($('#ideaInput').value); $('#ideaInput').value=''; $('#ideaChars').textContent='0/240';});
$('#ideaInput')?.addEventListener('input',e=>$('#ideaChars').textContent=`${e.target.value.length}/240`);
$('#homeIdeaForm')?.addEventListener('submit',e=>{e.preventDefault(); addIdea($('#homeIdeaInput').value); $('#homeIdeaInput').value=''; setPage('ideas');});
$('#ideaGrid')?.addEventListener('click',e=>{const b=e.target.closest('[data-idea-del]'); if(!b)return; ideas=ideas.filter(i=>i.id!==b.dataset.ideaDel);save(KEY.ideas,ideas);renderIdeas();});
const modal=$('#ideaModal'); $('#quickIdeaBtn')?.addEventListener('click',()=>{modal.showModal();setTimeout(()=>$('#modalIdeaInput').focus(),50)}); $('#modalIdeaForm')?.addEventListener('submit',()=>{addIdea($('#modalIdeaInput').value);$('#modalIdeaInput').value='';});
renderIdeas();

let tasks=load(KEY.tasks,[]); const taskLabels={today:'Hoje',week:'Essa semana',waiting:'Esperando alguém',later:'Depois'};
function renderTasks(){const board=$('#taskBoard'); board.innerHTML=Object.entries(taskLabels).map(([k,label])=>{const group=tasks.filter(t=>t.category===k);return `<section class="task-column"><h3>${label}<span>${group.length}</span></h3><div>${group.length?group.map(t=>`<div class="task-item ${t.done?'done':''}"><input type="checkbox" data-task-toggle="${t.id}" ${t.done?'checked':''}><div><strong>${esc(t.text)}</strong><small>${t.priority==='high'?'Alta prioridade • ':''}${t.date?fmtDate(t.date):''}</small></div><button data-task-edit="${t.id}">✎</button><button class="task-remove" data-task-del="${t.id}">×</button></div>`).join(''):'<small>Nada aqui por enquanto ♡</small>'}</div></section>`}).join(''); $('#todayTasksCount').textContent=tasks.filter(t=>t.category==='today'&&!t.done).length;}
$('#taskForm')?.addEventListener('submit',e=>{e.preventDefault();tasks.unshift({id:uid(),text:$('#taskInput').value.trim(),category:$('#taskCategory').value,priority:$('#taskPriority').value,date:$('#taskDate').value,done:false});save(KEY.tasks,tasks);e.target.reset();renderTasks();});
$('#taskBoard')?.addEventListener('change',e=>{const x=e.target.closest('[data-task-toggle]');if(!x)return;tasks=tasks.map(t=>t.id===x.dataset.taskToggle?{...t,done:x.checked}:t);save(KEY.tasks,tasks);renderTasks();});
$('#taskBoard')?.addEventListener('click',e=>{const del=e.target.closest('[data-task-del]');if(del){tasks=tasks.filter(t=>t.id!==del.dataset.taskDel);save(KEY.tasks,tasks);renderTasks();return;}const edit=e.target.closest('[data-task-edit]');if(edit){const t=tasks.find(t=>t.id===edit.dataset.taskEdit);const v=prompt('Editar tarefa:',t.text);if(v?.trim()){t.text=v.trim();save(KEY.tasks,tasks);renderTasks();}}}); renderTasks();

let contents=load(KEY.content,[]); const statusLabels={idea:'Ideia',producing:'Em produção',review:'Aprovação',scheduled:'Agendado',published:'Publicado'};
function renderContent(){const q=($('#contentSearch')?.value||'').toLowerCase(),f=$('#contentFilter')?.value||'all';const list=contents.filter(c=>(f==='all'||c.status===f)&&(`${c.title} ${c.platform} ${c.notes}`.toLowerCase().includes(q))); $('#contentBoard').innerHTML=Object.keys(statusLabels).map(s=>{const a=list.filter(c=>c.status===s);return `<div class="kanban-col"><div class="kanban-title"><span>${statusLabels[s]}</span><b>${a.length}</b></div>${a.map(c=>`<article class="kanban-card"><small>${esc(c.platform).toUpperCase()}</small><strong>${esc(c.title)}</strong><p>${c.date?fmtDate(c.date):'Sem data definida'}</p>${c.notes?`<p>${esc(c.notes)}</p>`:''}<div class="card-actions">${c.link?`<a href="${esc(c.link)}" target="_blank" rel="noopener">abrir ↗</a>`:''}<button data-content-edit="${c.id}">editar</button><button data-content-del="${c.id}">×</button></div></article>`).join('')}</div>`}).join('');
  $('#approvalCount').textContent=contents.filter(c=>c.status==='review').length; $('#scheduledCount').textContent=contents.filter(c=>['scheduled','published'].includes(c.status)).length;
  const upcoming=contents.filter(c=>c.date).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,4); $('#homeSchedule').innerHTML=upcoming.length?upcoming.map(c=>`<div class="timeline-item"><time>${new Date(c.date).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</time><span></span><div><strong>${esc(c.title)}</strong><small>${fmtDate(c.date)} • ${esc(c.platform)}</small></div></div>`).join(''):'<small>Nenhum conteúdo datado ainda.</small>'; $('#homeContentList').innerHTML=contents.filter(c=>!['published'].includes(c.status)).slice(0,3).map(c=>`<div class="content-row"><div class="platform ig">${esc(c.platform).slice(0,2).toUpperCase()}</div><div><strong>${esc(c.title)}</strong><small>${esc(c.platform)}</small></div><span class="status ${c.status}">${statusLabels[c.status]}</span></div>`).join('')||'<small>Nenhum conteúdo em andamento.</small>';
}
$('#contentForm')?.addEventListener('submit',e=>{e.preventDefault();contents.unshift({id:uid(),title:$('#contentTitle').value.trim(),platform:$('#contentPlatform').value,status:$('#contentStatus').value,date:$('#contentDate').value,link:$('#contentLink').value.trim(),notes:$('#contentNotes').value.trim()});save(KEY.content,contents);e.target.reset();renderContent();});
$('#contentSearch')?.addEventListener('input',renderContent); $('#contentFilter')?.addEventListener('change',renderContent);
$('#contentBoard')?.addEventListener('click',e=>{const del=e.target.closest('[data-content-del]');if(del){contents=contents.filter(c=>c.id!==del.dataset.contentDel);save(KEY.content,contents);renderContent();return;}const edit=e.target.closest('[data-content-edit]');if(edit){const c=contents.find(c=>c.id===edit.dataset.contentEdit);const title=prompt('Título do conteúdo:',c.title); if(title?.trim()){c.title=title.trim();const status=prompt('Status: idea, producing, review, scheduled ou published',c.status);if(statusLabels[status])c.status=status;save(KEY.content,contents);renderContent();}}}); renderContent();

let projects=load(KEY.projects,[]); function renderProjects(){ $('#projectGrid').innerHTML=projects.length?projects.map(p=>`<article class="project-card"><div class="project-top"><span class="project-icon">♡</span><span class="status scheduled">${p.progress}%</span></div><h3>${esc(p.name)}</h3><p>${p.deadline?'Prazo: '+fmtDate(p.deadline):'Sem prazo definido'}</p><div class="progress"><span style="width:${Math.max(0,Math.min(100,p.progress))}%"></span></div><div class="card-actions"><button data-project-edit="${p.id}">editar</button><button data-project-del="${p.id}">×</button></div></article>`).join(''):'<article class="project-card"><h3>Nenhum projeto ainda</h3><p>Adicione a primeira campanha acima.</p></article>'; }
$('#projectForm')?.addEventListener('submit',e=>{e.preventDefault();projects.unshift({id:uid(),name:$('#projectName').value.trim(),deadline:$('#projectDeadline').value,progress:Number($('#projectProgress').value)||0});save(KEY.projects,projects);e.target.reset();renderProjects();}); $('#projectGrid')?.addEventListener('click',e=>{const d=e.target.closest('[data-project-del]');if(d){projects=projects.filter(p=>p.id!==d.dataset.projectDel);save(KEY.projects,projects);renderProjects();return;}const b=e.target.closest('[data-project-edit]');if(b){const p=projects.find(p=>p.id===b.dataset.projectEdit);const progress=prompt('Novo progresso (0-100):',p.progress);if(progress!==null){p.progress=Math.max(0,Math.min(100,Number(progress)||0));save(KEY.projects,projects);renderProjects();}}}); renderProjects();

let metrics=load(KEY.metrics,{followers:0,reach:0,engagement:0,visits:0,posts:0}), history=load(KEY.metricsHistory,[]); function renderMetrics(){ $('#followersStat').textContent=metrics.followers.toLocaleString('pt-BR');$('#reachStat').textContent=metrics.reach.toLocaleString('pt-BR');$('#engagementStat').textContent=`${metrics.engagement}%`;$('#postsStat').textContent=metrics.posts.toLocaleString('pt-BR');$('#metricFollowers').value=metrics.followers;$('#metricReach').value=metrics.reach;$('#metricEngagement').value=metrics.engagement;$('#metricVisits').value=metrics.visits;$('#metricPosts').value=metrics.posts;$('#metricsHistory').innerHTML=history.length?history.slice(0,8).map(h=>`<div class="history-item"><strong>${fmtDate(h.date)}</strong><span>${h.followers.toLocaleString('pt-BR')} seguidores • ${h.reach.toLocaleString('pt-BR')} alcance • ${h.engagement}% eng.</span></div>`).join(''):'<small>Nenhum snapshot ainda.</small>';}
$('#metricsForm')?.addEventListener('submit',e=>{e.preventDefault();metrics={followers:Number($('#metricFollowers').value)||0,reach:Number($('#metricReach').value)||0,engagement:Number($('#metricEngagement').value)||0,visits:Number($('#metricVisits').value)||0,posts:Number($('#metricPosts').value)||0};history.unshift({...metrics,date:new Date().toISOString()});save(KEY.metrics,metrics);save(KEY.metricsHistory,history);renderMetrics();}); renderMetrics();

let links=load(KEY.links,[]); function renderLinks(){ $('#linkGrid').innerHTML=links.length?links.map(l=>`<article class="link-card"><span class="eyebrow">${esc(l.category)}</span><h3>${esc(l.label)}</h3><a href="${esc(l.url)}" target="_blank" rel="noopener">abrir ↗</a><button data-link-del="${l.id}">×</button></article>`).join(''):'<article class="link-card"><h3>Seus atalhos vão aparecer aqui.</h3></article>';}
$('#linkForm')?.addEventListener('submit',e=>{e.preventDefault();links.unshift({id:uid(),label:$('#linkLabel').value.trim(),url:$('#linkUrl').value.trim(),category:$('#linkCategory').value});save(KEY.links,links);e.target.reset();renderLinks();}); $('#linkGrid')?.addEventListener('click',e=>{const b=e.target.closest('[data-link-del]');if(!b)return;links=links.filter(l=>l.id!==b.dataset.linkDel);save(KEY.links,links);renderLinks();}); renderLinks();

const brain=$('#brainDump'); brain.value=localStorage.getItem(KEY.brain)||''; let bt; brain.addEventListener('input',()=>{clearTimeout(bt);$('#brainSaved').textContent='salvando...';bt=setTimeout(()=>{localStorage.setItem(KEY.brain,brain.value);$('#brainSaved').textContent='salvo automaticamente ♡';},250)});
let personal=load(KEY.personal,[]); function renderPersonal(){ $('#personalList').innerHTML=personal.map(i=>`<div class="personal-item"><span>${esc(i.text)}</span><button data-personal-del="${i.id}">×</button></div>`).join('')||'<small>Uma listinha só sua ♡</small>'; } $('#personalForm')?.addEventListener('submit',e=>{e.preventDefault();const v=$('#personalInput').value.trim();if(v){personal.unshift({id:uid(),text:v});save(KEY.personal,personal);$('#personalInput').value='';renderPersonal();}}); $('#personalList')?.addEventListener('click',e=>{const b=e.target.closest('[data-personal-del]');if(!b)return;personal=personal.filter(i=>i.id!==b.dataset.personalDel);save(KEY.personal,personal);renderPersonal();}); renderPersonal();

$$('a[href="index.html"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();$('#pageTransition').classList.add('active');setTimeout(()=>location.href='index.html',180)}));
