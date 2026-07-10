/* CASEFILE viewer app — vanilla JS, no build step, no framework.
   Structure comes from window.SITE_DATA (assets/js/nav-data.js).
   Actual page text is fetched on demand from content/<category>/<slug>.md —
   edit those files directly on GitHub, no in-app admin panel needed. */

(function () {
  const DATA = window.SITE_DATA;
  const CONFIG = window.SITE_CONFIG || { githubRepoUrl: "", branch: "main" };
  const sidebarNav = document.getElementById('sidebarNav');
  const contentEl = document.getElementById('content');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  const contentCache = {}; // contentPath -> markdown text (populated lazily / via prefetch)

  // ---------- Flatten index for search & lookup ----------
  const pageIndex = [];
  function indexNode(node, catTitle, catSlug, pathTitles) {
    if (node.type === 'page') {
      pageIndex.push({ slug: node.slug, title: node.title, catTitle, catSlug, path: pathTitles.concat(node.title), node });
    }
    (node.children || []).forEach(c => indexNode(c, catTitle, catSlug, pathTitles.concat(node.type === 'page' ? node.title : [])));
  }
  DATA.categories.forEach(cat => (cat.children || []).forEach(child => indexNode(child, cat.title, cat.slug, [])));
  const nodeBySlug = {};
  pageIndex.forEach(p => nodeBySlug[p.slug] = p);
  const catBySlug = {};
  DATA.categories.forEach(c => catBySlug[c.slug] = c);

  function countPages(node) {
    let n = node.type === 'page' ? 1 : 0;
    (node.children || []).forEach(c => n += countPages(c));
    return n;
  }
  function countWithContent(node) {
    let n = (node.type === 'page' && node.hasContent) ? 1 : 0;
    (node.children || []).forEach(c => n += countWithContent(c));
    return n;
  }

  // ---------- GitHub link helpers ----------
  function githubEditUrlForPath(contentPath, exists) {
    if (!CONFIG.githubRepoUrl || !contentPath) return null;
    const base = CONFIG.githubRepoUrl.replace(/\/$/, '');
    if (exists) return `${base}/edit/${CONFIG.branch}/${contentPath}`;
    return `${base}/new/${CONFIG.branch}?filename=${encodeURIComponent(contentPath)}`;
  }
  function githubEditUrl(node) {
    return githubEditUrlForPath(node.contentPath, !!node.hasContent);
  }

  // ---------- Sidebar rendering ----------
  function renderSidebar() {
    sidebarNav.innerHTML = '';
    DATA.categories.forEach(cat => {
      const total = cat.children.reduce((s, c) => s + countPages(c), 0);
      const catEl = document.createElement('div');
      catEl.className = 'nav-cat';
      catEl.dataset.slug = cat.slug;
      catEl.innerHTML = `
        <div class="nav-cat-head" data-cat="${cat.slug}">
          <span class="chevron">&#9656;</span>
          <span class="tab-swatch" style="background:${cat.color}"></span>
          <span>${cat.title}</span>
          <span class="nav-cat-count">${total}</span>
        </div>
        <div class="nav-pages"></div>
      `;
      const pagesWrap = catEl.querySelector('.nav-pages');
      cat.children.forEach(child => pagesWrap.appendChild(renderNavPage(child)));
      catEl.querySelector('.nav-cat-head').addEventListener('click', () => catEl.classList.toggle('open'));
      sidebarNav.appendChild(catEl);
    });
  }

  function renderNavPage(node) {
    const wrap = document.createElement('div');
    wrap.className = 'nav-page-item';
    const link = document.createElement('div');
    link.className = 'nav-page-link' + (node.hasContent ? ' has-content' : '');
    link.dataset.slug = node.slug;
    link.innerHTML = `<span class="status-dot"></span><span>${node.title}</span>`;
    link.addEventListener('click', (e) => { e.stopPropagation(); location.hash = '#/p/' + node.slug; });
    wrap.appendChild(link);
    if (node.children && node.children.length) {
      const childWrap = document.createElement('div');
      childWrap.className = 'nav-children';
      node.children.forEach(c => childWrap.appendChild(renderNavPage(c)));
      wrap.appendChild(childWrap);
    }
    return wrap;
  }

  function setActiveNav(slug) {
    document.querySelectorAll('.nav-page-link.active').forEach(el => el.classList.remove('active'));
    const el = document.querySelector(`.nav-page-link[data-slug="${cssEscape(slug)}"]`);
    if (el) {
      el.classList.add('active');
      let p = el.closest('.nav-cat');
      if (p) p.classList.add('open');
      if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' });
    }
  }
  function cssEscape(s) { return s.replace(/[^a-zA-Z0-9_-]/g, m => '\\' + m); }
  function escapeHtmlLite(s) { return (s || '').replace(/</g, '&lt;'); }

  // ---------- Views ----------
  function viewHome() {
    const totalPages = pageIndex.length;
    const totalComplete = pageIndex.filter(p => p.node.hasContent).length;
    const catCards = DATA.categories.map(cat => {
      const total = cat.children.reduce((s, c) => s + countPages(c), 0);
      return `<div class="cat-card" style="--card-color:${cat.color}" data-cat="${cat.slug}">
        <h3>${cat.title}</h3><div class="count">${total} entries</div></div>`;
    }).join('');

    contentEl.innerHTML = `
      <div class="hero">
        <div class="hero-tag">CASE STATUS: ACTIVE // OWNER: ${escapeHtmlLite(DATA.author)}</div>
        <h1>${DATA.siteTitle}</h1>
        <p class="lead">${DATA.siteTagline}</p>
        <div class="hero-stats">
          <div class="hero-stat"><div class="num">${totalPages}</div><div class="label">Indexed topics</div></div>
          <div class="hero-stat"><div class="num">${totalComplete}</div><div class="label">Written entries</div></div>
          <div class="hero-stat"><div class="num">${DATA.categories.length}</div><div class="label">Categories</div></div>
        </div>
      </div>
      <div class="cat-grid">${catCards}</div>
    `;
    contentEl.querySelectorAll('.cat-card').forEach(card => {
      card.addEventListener('click', () => location.hash = '#/c/' + card.dataset.cat);
    });
  }

  async function viewCategory(slug) {
    const cat = catBySlug[slug];
    if (!cat) return viewNotFound();
    const rows = cat.children.map(n => renderCatRow(n, 0)).join('');
    contentEl.innerHTML = `
      <div class="entry-header">
        <div class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>${cat.title}</span></div>
        <div class="entry-title-row"><h1>${cat.title}</h1></div>
        <div class="entry-meta"><span id="catStatusSlot"></span></div>
      </div>
      <div class="entry-body" id="catIntroBody"></div>
      <div>${rows}</div>
    `;
    contentEl.querySelectorAll('[data-goto]').forEach(el => {
      el.addEventListener('click', () => location.hash = '#/p/' + el.dataset.goto);
    });

    if (cat.contentPath) {
      const text = await fetchContentByPath(cat.slug + '::cat', cat.contentPath);
      const introBody = document.getElementById('catIntroBody');
      const statusSlot = document.getElementById('catStatusSlot');
      if (!introBody || !statusSlot) return;
      const editUrl = githubEditUrlForPath(cat.contentPath, !!text);
      const editLink = editUrl ? `<a class="btn" href="${editUrl}" target="_blank">${text ? 'Edit on GitHub' : 'Create this entry'} &#9998;</a>` : '';
      if (text && text.trim()) {
        introBody.innerHTML = renderMarkdown(text);
        statusSlot.outerHTML = `<span class="status-badge complete"><span class="dot"></span>Written</span>${editLink}`;
      } else {
        statusSlot.outerHTML = editLink;
      }
    }
  }

  function renderCatRow(node, depth) {
    const indent = depth * 18;
    const sub = (node.children || []).map(c => renderCatRow(c, depth + 1)).join('');
    return `<div style="margin-left:${indent}px; padding:9px 0; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px; cursor:pointer;" data-goto="${node.slug}">
      <span class="status-dot" style="width:6px;height:6px;border-radius:50%;background:${node.hasContent ? 'var(--teal)' : 'var(--border-bright)'}; flex-shrink:0;"></span>
      <span style="color:var(--ink-dim); font-size:14px;">${node.title}</span>
      <span style="margin-left:auto; font-family:var(--font-code); font-size:10.5px; color:var(--muted);">${node.tag || ''}</span>
    </div>${sub}`;
  }

  async function fetchContentByPath(cacheKey, contentPath) {
    if (contentCache[cacheKey] !== undefined) return contentCache[cacheKey];
    try {
      const res = await fetch(contentPath, { cache: 'no-store' });
      if (!res.ok) { contentCache[cacheKey] = null; return null; }
      const text = await res.text();
      contentCache[cacheKey] = text;
      return text;
    } catch (e) {
      contentCache[cacheKey] = null;
      return null;
    }
  }
  async function fetchContent(node) {
    return fetchContentByPath(node.slug, node.contentPath);
  }

  async function viewPage(slug) {
    const entry = nodeBySlug[slug];
    if (!entry) return viewNotFound();
    const node = entry.node;
    const crumbs = [`<a href="#/">Home</a>`, `<a href="#/c/${entry.catSlug}">${entry.catTitle}</a>`]
      .concat(entry.path.slice(0, -1).map(t => `<span>${t}</span>`)).join('<span class="sep">/</span>');

    contentEl.innerHTML = `
      <div class="entry-header">
        <div class="breadcrumb">${crumbs}</div>
        <div class="entry-title-row"><h1>${node.title}</h1><div class="tag-stamp">${node.tag}</div></div>
        <div class="entry-meta"><span id="statusSlot">Loading&hellip;</span></div>
      </div>
      <div class="entry-body" id="entryBody"><p style="color:var(--muted)">Loading entry&hellip;</p></div>
    `;
    setActiveNav(slug);

    const text = await fetchContent(node);
    const statusSlot = document.getElementById('statusSlot');
    const body = document.getElementById('entryBody');
    if (!statusSlot || !body) return; // user navigated away before fetch resolved

    const editUrl = githubEditUrl(node);
    const editLink = editUrl ? `<a class="btn" href="${editUrl}" target="_blank" style="margin-left:auto;">${text ? 'Edit on GitHub' : 'Create this entry'} &#9998;</a>` : '';

    if (text && text.trim()) {
      statusSlot.outerHTML = `<span class="status-badge complete"><span class="dot"></span>Written</span>${editLink}`;
      body.innerHTML = renderMarkdown(text);
    } else {
      statusSlot.outerHTML = `<span class="status-badge empty"><span class="dot"></span>Awaiting notes</span>${editLink}`;
      body.innerHTML = `<div class="empty-state">
        <div class="stamp">NO ENTRY YET</div>
        <p>This topic is indexed but has no write-up yet.</p>
        <p style="font-family:var(--font-code); font-size:12px; margin-top:10px;">Expected file: <code>${node.contentPath}</code></p>
        ${editUrl ? `<a class="btn primary" href="${editUrl}" target="_blank">Create this file on GitHub &rarr;</a>` : `<p style="font-size:12px; margin-top:10px;">Set <code>githubRepoUrl</code> in assets/js/config.js to enable one-click creation.</p>`}
      </div>`;
    }
  }

  function viewNotFound() {
    contentEl.innerHTML = `<div class="empty-state"><div class="stamp">404</div><p>Nothing filed under that reference.</p><a class="btn" href="#/">&larr; Back to index</a></div>`;
  }

  // ---------- Router ----------
  function router() {
    const hash = location.hash || '#/';
    const m1 = /^#\/p\/(.+)$/.exec(hash);
    const m2 = /^#\/c\/(.+)$/.exec(hash);
    if (m1) { viewPage(decodeURIComponent(m1[1])); }
    else if (m2) { viewCategory(decodeURIComponent(m2[1])); }
    else { viewHome(); }
    window.scrollTo(0, 0);
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.remove('open');
  }
  window.addEventListener('hashchange', router);

  // ---------- Search (prefetches written entries in the background) ----------
  function doSearch(q) {
    q = q.trim().toLowerCase();
    if (!q) { searchResults.classList.remove('show'); return; }
    const results = pageIndex.filter(p => {
      if (p.title.toLowerCase().includes(q)) return true;
      const cached = contentCache[p.slug];
      return cached && cached.toLowerCase().includes(q);
    }).slice(0, 20);
    if (!results.length) {
      searchResults.innerHTML = `<div class="search-empty">No matches for "${escapeHtmlLite(q)}"</div>`;
    } else {
      searchResults.innerHTML = results.map(r => `
        <div class="search-result-item" data-slug="${r.slug}">
          <div>${r.title}</div>
          <div class="path">${r.catTitle} ${r.path.length > 1 ? '/ ' + r.path.slice(0, -1).join(' / ') : ''}</div>
        </div>`).join('');
      searchResults.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
          location.hash = '#/p/' + el.dataset.slug;
          searchInput.value = '';
          searchResults.classList.remove('show');
        });
      });
    }
    searchResults.classList.add('show');
  }
  searchInput.addEventListener('input', (e) => doSearch(e.target.value));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sidebar-search')) searchResults.classList.remove('show');
  });

  function prefetchWrittenEntries() {
    const written = pageIndex.filter(p => p.node.hasContent);
    written.forEach(p => { fetchContent(p.node); });
  }

  // ---------- Mobile menu ----------
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
  }

  // ---------- Init ----------
  renderSidebar();
  router();
  prefetchWrittenEntries(); // enables full-text search once these resolve; page views work regardless
})();
