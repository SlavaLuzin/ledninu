// Loads deld.txt, parses entries and renders them.
// Format expected (simple, line-based):
// word | type | translation ; notes
// Lines starting with # are comments. Blank lines separate entries.
// Example:
// ledni | n | мир
// ga'ru | v | бежать ; irregular

const listEl = document.getElementById('list');
const qEl = document.getElementById('q');
const filterEl = document.getElementById('filter-type');
const tpl = document.getElementById('item-tpl');

async function fetchDeld() {
  // prefer the static file (if deployed), otherwise fall back to serverless function
  try {
    const r0 = await fetch('deld.txt', {cache: 'no-store'});
    if (r0.ok) return r0.text();
  } catch (e) { /* ignore */ }
  const res = await fetch('/.netlify/functions/deld', {cache: 'no-store'});
  if (!res.ok) throw new Error('Не удалось загрузить deld.txt');
  return res.text();
}

function parse(txt){
  const lines = txt.split(/\r?\n/);
  const entries = [];
  for (let raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    // support separator " | " or "\t" or " : "
    const parts = line.split(' - ').map(s => s.trim());
    entries.push({word: parts[0], meaning: parts.slice(1).join('/')})
    // if (parts.length >= 3) {
    //   entries.push({word: parts[0], type: parts[1], meaning: parts.slice(2).join(' /')});
    // } else {
    //   // try tabs or semicolon
    //   const alt = line.split(/\t|;/).map(s=>s.trim());
    //   if (alt.length >= 2) entries.push({word: alt[0], type: '', meaning: alt.slice(1).join('/')});
    // }
  }
  return entries;
}

function render(entries){
  listEl.innerHTML = '';
  if (!entries.length) {
    listEl.innerHTML = '<p class="muted">Словарь пуст.</p>';
    return;
  }
  for (const e of entries) {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.word').textContent = e.word;
    const m = node.querySelector('.meanings');
    e.meaning.split('/').forEach(s => {
      const p = document.createElement('p');
      p.textContent = s.trim();
      m.appendChild(p);
    });
    listEl.appendChild(node);
  }
}

function applyFilters(entries){
  const q = qEl.value.trim().toLowerCase();
  const t = filterEl.value;
  return entries.filter(e => {
    if (t && e.type !== t) return false;
    if (!q) return true;
    return (e.word + ' ' + e.meaning).toLowerCase().includes(q);
  });
}

let allEntries = [];
async function loadAndShow(){
  try {
    const txt = await fetchDeld();
    allEntries = parse(txt);
    render(applyFilters(allEntries));
  } catch (e) {
    listEl.innerHTML = `<p class="muted">Ошибка: ${e.message}</p>`;
  }
}

loadAndShow();
qEl.addEventListener('input', ()=> render(applyFilters(allEntries)));
filterEl.addEventListener('change', ()=> render(applyFilters(allEntries)));