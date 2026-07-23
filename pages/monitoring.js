'use strict';

const PAGES = [
  ['en', '/'],
  ['fr', '/fr/'],
  ['de', '/de/'],
  ['it', '/it/'],
  ['es', '/es/'],
  ['en', '/legal-notices.html'],
  ['fr', '/fr/legal-notices.html'],
  ['de', '/de/legal-notices.html'],
  ['it', '/it/legal-notices.html'],
  ['es', '/es/legal-notices.html'],
  ['en', '/accessibility-declaration.html'],
  ['fr', '/fr/declaration-accessibilite.html'],
  ['de', '/de/barrierefreiheitserklaerung.html'],
  ['it', '/it/dichiarazione-di-accessibilita.html'],
  ['es', '/es/declaracion-de-accesibilidad.html']
];

const ASSETS = [
  ['css',  '/css/stylesheet.css'],
  ['xml',  '/sitemap.xml'],
  ['txt',  '/robots.txt'],
  ['img',  '/medias/favicon.png'],
  ['img',  '/logos-resized/isit-be.png'],
  ['img',  '/logos-resized/inr-fr.png'],
  ['img',  '/logos-resized/isit-ch.png'],
  ['font', '/fonts/open-sans-400-latin.woff2'],
  ['font', '/fonts/open-sans-800-latin.woff2']
];

const SEO_CHECKS = [
  { label: 'Sitemap valide & >= 10 URLs', target: '/sitemap.xml', check: (txt) => {
      const n = (txt.match(/<url>/g) || []).length;
      if (!txt.includes('<urlset')) throw new Error('Pas de <urlset>');
      if (n < 10) throw new Error('Seulement ' + n + ' URLs (attendu >=10)');
      return n + ' URLs declarees';
  }},
  { label: 'Robots.txt: Sitemap reference', target: '/robots.txt', check: (txt) => {
      if (!/^Sitemap:\s*https/m.test(txt)) throw new Error('Pas de directive Sitemap');
      return 'Sitemap declare';
  }},
  { label: 'Accueil EN: lang="en"', target: '/', check: (txt) => {
      if (!/<html\s+lang="en"/.test(txt)) throw new Error('lang="en" absent');
      return 'lang="en" present';
  }},
  { label: 'Accueil FR: lang="fr"', target: '/fr/', check: (txt) => {
      if (!/<html\s+lang="fr"/.test(txt)) throw new Error('lang="fr" absent');
      return 'lang="fr" present';
  }},
  { label: 'Accueil DE: lang="de"', target: '/de/', check: (txt) => {
      if (!/<html\s+lang="de"/.test(txt)) throw new Error('lang="de" absent');
      return 'lang="de" present';
  }},
  { label: 'Accueil IT: lang="it"', target: '/it/', check: (txt) => {
      if (!/<html\s+lang="it"/.test(txt)) throw new Error('lang="it" absent');
      return 'lang="it" present';
  }},
  { label: 'Accueil ES: lang="es"', target: '/es/', check: (txt) => {
      if (!/<html\s+lang="es"/.test(txt)) throw new Error('lang="es" absent');
      return 'lang="es" present';
  }},
  { label: 'Canonical present sur accueil', target: '/', check: (txt) => {
      if (!/rel="canonical"/.test(txt)) throw new Error('Canonical absent');
      return 'Canonical present';
  }},
  { label: 'hreflang reciproque sur accueil (5 langues + x-default)', target: '/', check: (txt) => {
      const langs = ['en','fr','de','it','es','x-default'];
      const miss = langs.filter(l => !new RegExp('hreflang="' + l + '"').test(txt));
      if (miss.length) throw new Error('Manque: ' + miss.join(', '));
      return 'en/fr/de/it/es/x-default OK';
  }},
  { label: 'Matomo actif (mode cookieless)', target: '/', check: (txt) => {
      if (!txt.includes('_paq')) throw new Error('Matomo (_paq) absent');
      if (!txt.includes("disableCookies")) throw new Error('disableCookies absent (non conforme a la declaration "no cookies")');
      return 'Matomo + disableCookies presents';
  }},
  { label: 'JSON-LD Schema.org valide sur accueil', target: '/', check: (txt) => {
      const m = txt.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      if (!m) throw new Error('Pas de bloc JSON-LD');
      try { JSON.parse(m[1]); } catch (e) { throw new Error('JSON invalide: ' + e.message); }
      return 'JSON-LD valide';
  }}
];

const ECO_CHECKS = [
  { label: 'HTTPS actif', target: '/robots.txt', check: (txt, res) => {
      if (location.protocol !== 'https:') throw new Error('Page servie en ' + location.protocol);
      if (!res.url.startsWith('https://')) throw new Error('Reponse non HTTPS: ' + res.url);
      return 'HTTPS confirme';
  }},
  { label: 'Compression HTML (gzip/br)', target: '/', check: (txt, res) => {
      const cl = parseInt(res.headers.get('content-length') || '0', 10);
      const raw = new TextEncoder().encode(txt).length;
      if (!cl) return 'content-length absent (chunked) - ratio inconnu';
      if (cl >= raw) throw new Error('Pas compresse (' + (cl/1024).toFixed(1) + ' / ' + (raw/1024).toFixed(1) + ' KB)');
      const ratio = Math.round((1 - cl / raw) * 100);
      return '-' + ratio + '% (' + (cl/1024).toFixed(1) + ' / ' + (raw/1024).toFixed(1) + ' KB)';
  }},
  { label: 'Compression CSS (gzip/br)', target: '/css/stylesheet.css', check: (txt, res) => {
      const cl = parseInt(res.headers.get('content-length') || '0', 10);
      const raw = new TextEncoder().encode(txt).length;
      if (!cl) return 'content-length absent';
      if (cl >= raw) throw new Error('Pas compresse (' + (cl/1024).toFixed(1) + ' / ' + (raw/1024).toFixed(1) + ' KB)');
      const ratio = Math.round((1 - cl / raw) * 100);
      return '-' + ratio + '% (' + (cl/1024).toFixed(1) + ' / ' + (raw/1024).toFixed(1) + ' KB)';
  }},
  { label: 'Cache-Control sur CSS', target: '/css/stylesheet.css', check: (txt, res) => {
      const cc = res.headers.get('cache-control');
      if (!cc) throw new Error('Header Cache-Control absent');
      return cc;
  }},
  { label: 'Cache-Control sur image', target: '/logos-resized/isit-be.png', check: (txt, res) => {
      const cc = res.headers.get('cache-control');
      if (!cc) throw new Error('Header Cache-Control absent');
      return cc;
  }},
  { label: 'Poids HTML accueil <= 150 KB', target: '/', check: (txt) => {
      const kb = new TextEncoder().encode(txt).length / 1024;
      if (kb > 150) throw new Error(kb.toFixed(1) + ' KB');
      return kb.toFixed(1) + ' KB';
  }},
  { label: 'Pas d\'autoplay video/audio sur accueil', target: '/', check: (txt) => {
      if (/<(video|audio)[^>]*\sautoplay/i.test(txt)) throw new Error('Media en autoplay detecte');
      return 'Aucun autoplay';
  }},
  { label: 'Minification CSS (whitespace <= 20%)', target: '/css/stylesheet.css', check: (txt) => {
      if (!txt.length) throw new Error('Fichier vide');
      const ws = (txt.match(/\s/g) || []).length;
      const pct = Math.round((ws / txt.length) * 100);
      const lines = (txt.match(/\n/g) || []).length;
      if (pct > 20) throw new Error('Whitespace ' + pct + '% / ' + lines + ' lignes (non minifie)');
      return 'Whitespace ' + pct + '% / ' + lines + ' lignes';
  }},
  { label: 'Logo ISIT Belgium (resized) <= 15 KB', target: '/logos-resized/isit-be.png', check: (txt, res) => {
      const cl = parseInt(res.headers.get('content-length') || '0', 10);
      if (!cl) throw new Error('content-length absent');
      const kb = cl / 1024;
      if (kb > 15) throw new Error(kb.toFixed(1) + ' KB');
      return kb.toFixed(1) + ' KB';
  }},
  { label: 'Logo INR France (resized) <= 15 KB', target: '/logos-resized/inr-fr.png', check: (txt, res) => {
      const cl = parseInt(res.headers.get('content-length') || '0', 10);
      if (!cl) throw new Error('content-length absent');
      const kb = cl / 1024;
      if (kb > 15) throw new Error(kb.toFixed(1) + ' KB');
      return kb.toFixed(1) + ' KB';
  }},
  { label: 'Logo ISIT Switzerland (resized) <= 15 KB', target: '/logos-resized/isit-ch.png', check: (txt, res) => {
      const cl = parseInt(res.headers.get('content-length') || '0', 10);
      if (!cl) throw new Error('content-length absent');
      const kb = cl / 1024;
      if (kb > 15) throw new Error(kb.toFixed(1) + ' KB');
      return kb.toFixed(1) + ' KB';
  }},
  { label: 'Favicon <= 10 KB', target: '/medias/favicon.png', check: (txt, res) => {
      const cl = parseInt(res.headers.get('content-length') || '0', 10);
      if (!cl) throw new Error('content-length absent');
      const kb = cl / 1024;
      if (kb > 10) throw new Error(kb.toFixed(1) + ' KB');
      return kb.toFixed(1) + ' KB';
  }},
  { label: 'Nombre de requetes accueil <= 30', target: '/', check: (txt) => {
      const links   = (txt.match(/<link\b[^>]*\bhref\s*=/gi)   || []).length;
      const scripts = (txt.match(/<script\b[^>]*\bsrc\s*=/gi)  || []).length;
      const imgs    = (txt.match(/<img\b[^>]*\bsrc\s*=/gi)     || []).length;
      const sources = (txt.match(/<source\b[^>]*\bsrc\s*=/gi)  || []).length;
      const iframes = (txt.match(/<iframe\b[^>]*\bsrc\s*=/gi)  || []).length;
      const total = links + scripts + imgs + sources + iframes;
      const detail = total + ' (' + links + ' link / ' + scripts + ' js / ' + imgs + ' img / ' + sources + ' src / ' + iframes + ' iframe)';
      if (total > 30) throw new Error(detail);
      return detail;
  }},
  { label: 'DOM <= 1500 noeuds (accueil) [YLT]', target: '/', check: (txt) => {
      const doc = new DOMParser().parseFromString(txt, 'text/html');
      const n = doc.querySelectorAll('*').length;
      if (n > 1500) throw new Error(n + ' noeuds');
      return n + ' noeuds';
  }},
  { label: 'Profondeur DOM <= 32 (accueil) [YLT]', target: '/', check: (txt) => {
      const doc = new DOMParser().parseFromString(txt, 'text/html');
      const depth = (n) => {
          if (!n.children || !n.children.length) return 1;
          let max = 0;
          for (const c of n.children) max = Math.max(max, depth(c));
          return max + 1;
      };
      const d = depth(doc.body || doc.documentElement);
      if (d > 32) throw new Error(d + ' niveaux');
      return d + ' niveaux';
  }},
  { label: 'Attributs style= inline <= 5 (accueil) [YLT]', target: '/', check: (txt) => {
      const doc = new DOMParser().parseFromString(txt, 'text/html');
      const n = doc.querySelectorAll('[style]').length;
      if (n > 5) throw new Error(n + ' style= inline');
      return n + ' style= inline';
  }},
  { label: 'Iframes <= 2 (accueil) [YLT]', target: '/', check: (txt) => {
      const doc = new DOMParser().parseFromString(txt, 'text/html');
      const n = doc.querySelectorAll('iframe').length;
      if (n > 2) throw new Error(n + ' iframes');
      return n + ' iframe(s)';
  }},
  { label: 'Images dimensionnees width+height (accueil) [YLT]', target: '/', check: (txt) => {
      const doc = new DOMParser().parseFromString(txt, 'text/html');
      const imgs = Array.from(doc.querySelectorAll('img'));
      if (!imgs.length) return 'Aucune image';
      const ok = imgs.filter(i => i.getAttribute('width') && i.getAttribute('height')).length;
      const ratio = Math.round((ok / imgs.length) * 100);
      if (ratio < 80) throw new Error(ok + '/' + imgs.length + ' (' + ratio + '%)');
      return ok + '/' + imgs.length + ' (' + ratio + '%)';
  }},
  { label: 'Pas de @import en CSS [YLT]', target: '/css/stylesheet.css', check: (txt) => {
      const m = txt.match(/@import\b/g) || [];
      if (m.length) throw new Error(m.length + ' @import');
      return 'Aucun @import';
  }},
  { label: '!important <= 10 en CSS [YLT]', target: '/css/stylesheet.css', check: (txt) => {
      const m = txt.match(/!\s*important/gi) || [];
      if (m.length > 10) throw new Error(m.length + ' !important');
      return m.length + ' !important';
  }},
  { label: '@font-face <= 4 (2 poids x latin/latin-ext) [YLT]', target: '/css/stylesheet.css', check: (txt) => {
      const m = txt.match(/@font-face/gi) || [];
      if (m.length > 4) throw new Error(m.length + ' @font-face');
      return m.length + ' @font-face';
  }},
  { label: 'Contraste .legal-update >= AA (couleur non #888)', target: '/css/stylesheet.css', check: (txt) => {
      const m = txt.match(/\.legal-update\s*\{[^}]*color:\s*#([0-9a-fA-F]{3,6})/);
      if (!m) throw new Error('Regle .legal-update introuvable');
      if (m[1].toLowerCase().startsWith('888')) throw new Error('Contraste insuffisant (#888 ~3.3:1)');
      return 'color:#' + m[1] + ' (>=AA)';
  }}
];

const PERIOD = 120;
let timer = null, countdownTimer = null, autoOn = false, secsLeft = 0;

function el(tag, attrs, text) {
  const node = document.createElement(tag);
  if (attrs) for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (text != null) node.textContent = text;
  return node;
}

function makeRow(meta, url, isSeo) {
  const tr = el('tr');
  tr.dataset.key = (isSeo ? 'seo:' : '') + (isSeo ? meta : url);
  const tdDot   = el('td');
  const dot     = el('span', { class: 'status-dot idle' });
  tdDot.appendChild(dot);
  const tdMeta  = el('td', null, meta || '');
  const tdUrl   = el('td', { class: 'mon-url' }, url);
  const tdCode  = el('td', { class: 'mon-status-code' }, '-');
  const tdTime  = el('td', { class: 'mon-time' }, '-');
  const tdDet   = el('td', { class: 'mon-detail' }, '-');
  tr.appendChild(tdDot);
  tr.appendChild(tdMeta);
  tr.appendChild(tdUrl);
  tr.appendChild(tdCode);
  if (!isSeo) tr.appendChild(tdTime);
  tr.appendChild(tdDet);
  return tr;
}

function init() {
  const fill = (id, items, isSeo) => {
    const tbody = document.getElementById(id);
    items.forEach(item => {
      if (isSeo) tbody.appendChild(makeRow(item.label, item.target, true));
      else       tbody.appendChild(makeRow(item[0], item[1], false));
    });
  };
  fill('tblPages',  PAGES,  false);
  fill('tblAssets', ASSETS, false);
  fill('tblSeo',    SEO_CHECKS, true);
  fill('tblEco',    ECO_CHECKS, true);
  document.getElementById('sumTotal').textContent = String(PAGES.length + ASSETS.length + SEO_CHECKS.length + ECO_CHECKS.length);
  document.getElementById('runBtn').addEventListener('click', runAll);
  document.getElementById('autoBtn').addEventListener('click', toggleAuto);
  document.getElementById('copyBtn').addEventListener('click', copyReport);
}

async function copyReport() {
  const btn = document.getElementById('copyBtn');
  const text = buildReportText();
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = '✓ Copie dans le presse-papiers';
    setTimeout(() => { btn.textContent = original; }, 2000);
  } catch (e) {
    const original = btn.textContent;
    btn.textContent = '✗ Copie impossible';
    setTimeout(() => { btn.textContent = original; }, 2000);
  }
}

function rowFor(tableId, key) {
  const tbody = document.getElementById(tableId);
  const rows  = tbody.querySelectorAll('tr');
  for (const tr of rows) if (tr.dataset.key === key) return tr;
  return null;
}

function setRow(tableId, key, status, code, timeOrSize, detail, isSeo) {
  const tr = rowFor(tableId, key);
  if (!tr) return;
  tr.classList.toggle('row-ko', status === 'ko');
  const dot = tr.children[0].firstChild;
  dot.className = 'status-dot ' + status;
  const codeCell = tr.children[3];
  codeCell.textContent = code;
  codeCell.className = 'mon-status-code ' + (status === 'ok' ? 'ok' : status === 'ko' ? 'ko' : '');
  if (isSeo) {
    tr.children[4].textContent = detail;
  } else {
    tr.children[4].textContent = timeOrSize;
    tr.children[5].textContent = detail;
  }
}

function fmtSize(n) {
  if (!n) return '-';
  const v = parseInt(n, 10);
  if (isNaN(v)) return '-';
  return v < 1024 ? v + ' B' : (v / 1024).toFixed(1) + ' KB';
}

async function checkUrl(url) {
  const t0 = performance.now();
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    const ms  = Math.round(performance.now() - t0);
    return { ok: res.ok, code: res.status, ms, size: res.headers.get('content-length'), statusText: res.statusText };
  } catch (e) {
    return { ok: false, code: 0, ms: Math.round(performance.now() - t0), error: e.message };
  }
}

async function runGroup(tableId, items, isAsset) {
  for (const [meta, url] of items) {
    setRow(tableId, url, 'run', '⟳', '…', 'en cours', false);
    const r = await checkUrl(url);
    if (r.ok) {
      const t = isAsset ? fmtSize(r.size) : (r.ms + ' ms');
      setRow(tableId, url, 'ok', r.code, t, isAsset ? (r.ms + ' ms') : 'OK', false);
    } else {
      setRow(tableId, url, 'ko', r.code || 'ERR', r.ms + ' ms', r.error || r.statusText || 'KO', false);
    }
    updateSummary();
  }
}

async function runChecks(tableId, checks) {
  for (const c of checks) {
    const key = 'seo:' + c.label;
    setRow(tableId, key, 'run', '⟳', '', 'en cours', true);
    try {
      const res = await fetch(c.target, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const txt = await res.text();
      const detail = await c.check(txt, res);
      setRow(tableId, key, 'ok', '✓', '', detail, true);
    } catch (e) {
      setRow(tableId, key, 'ko', '✗', '', e.message, true);
    }
    updateSummary();
  }
}

function updateSummary() {
  const dots = document.querySelectorAll('.status-dot');
  let ok = 0, ko = 0, run = 0;
  dots.forEach(d => {
    if (d.classList.contains('ok'))      ok++;
    else if (d.classList.contains('ko')) ko++;
    else if (d.classList.contains('run'))run++;
  });
  document.getElementById('sumOk').textContent  = String(ok);
  document.getElementById('sumKo').textContent  = String(ko);
  document.getElementById('sumRun').textContent = String(run);
  const groups = [['cntPages','tblPages'],['cntAssets','tblAssets'],['cntSeo','tblSeo'],['cntEco','tblEco']];
  groups.forEach(([cnt, tbl]) => {
    const tot = document.querySelectorAll('#' + tbl + ' tr').length;
    const oks = document.querySelectorAll('#' + tbl + ' .status-dot.ok').length;
    document.getElementById(cnt).textContent = oks + '/' + tot;
  });
  const done = ok + ko;
  const scoreEl = document.getElementById('sumScore');
  if (done > 0) {
    const pct = Math.round((ok / done) * 100);
    scoreEl.textContent = pct + '%';
    scoreEl.parentElement.classList.toggle('ok', pct === 100 && ko === 0);
    scoreEl.parentElement.classList.toggle('ko', ko > 0 && run === 0);
  }
  document.title = (ko ? '🔴 ' + ko + ' KO ' : '🟢 ') + 'Monitoring | ISIT Europe';
}

function buildReportText() {
  const lines = ['ISIT Europe - Rapport monitoring', 'Genere le : ' + new Date().toLocaleString('fr-FR'), ''];
  const sections = [
    ['SEO & configuration', 'tblSeo'],
    ['Ecoconception', 'tblEco'],
    ['Pages du site', 'tblPages'],
    ['Assets statiques', 'tblAssets']
  ];
  sections.forEach(([title, tbl]) => {
    lines.push('== ' + title + ' ==');
    document.querySelectorAll('#' + tbl + ' tr').forEach(tr => {
      const dot = tr.querySelector('.status-dot');
      const status = dot.classList.contains('ok') ? 'OK' : dot.classList.contains('ko') ? 'KO' : '?';
      const cells = Array.from(tr.children).slice(1).map(td => td.textContent.trim()).join(' | ');
      lines.push('[' + status + '] ' + cells);
    });
    lines.push('');
  });
  return lines.join('\n');
}

async function runAll() {
  const t0 = performance.now();
  document.getElementById('lastRun').textContent = new Date().toLocaleTimeString('fr-FR');
  document.getElementById('lastDuration').textContent = '...';
  await Promise.all([
    runGroup('tblPages',  PAGES,  false),
    runGroup('tblAssets', ASSETS, true),
    runChecks('tblSeo', SEO_CHECKS),
    runChecks('tblEco', ECO_CHECKS)
  ]);
  const secs = ((performance.now() - t0) / 1000).toFixed(1);
  document.getElementById('lastDuration').textContent = secs + 's';
}

function toggleAuto() {
  autoOn = !autoOn;
  const btn = document.getElementById('autoBtn');
  if (autoOn) {
    btn.textContent = '⏱ Auto-refresh : ON (toutes les 2 min)';
    btn.classList.add('auto-on');
    btn.classList.remove('secondary');
    secsLeft = PERIOD;
    timer = setInterval(() => { runAll(); secsLeft = PERIOD; }, PERIOD * 1000);
    countdownTimer = setInterval(() => {
      secsLeft--;
      document.getElementById('countdown').textContent = secsLeft + 's';
    }, 1000);
  } else {
    btn.textContent = '⏱ Auto-refresh : OFF';
    btn.classList.remove('auto-on');
    btn.classList.add('secondary');
    clearInterval(timer); clearInterval(countdownTimer);
    document.getElementById('countdown').textContent = '-';
  }
}

init();
runAll();
