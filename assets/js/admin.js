/* CASEFILE admin — vanilla JS CRUD over window.SITE_DATA, exports an
   updated assets/js/data.js file for the user to commit back to their repo. */

(function () {
  const DATA = window.SITE_DATA;
  let dirty = false;
  let selected = null; // { slug, isCategory }

  // ---------------- Password gate ----------------
  const gateScreen = document.getElementById('gateScreen');
  const adminApp = document.getElementById('adminApp');
  const gatePassword = document.getElementById('gatePassword');
  const gateError = document.getElementById('gateError');
  const gateSubmit = document.getElementById('gateSubmit');

  async function tryUnlock() {
    const pw = gatePassword.value;
    const enc = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex === window.ADMIN_PASSWORD_HASH) {
      gateScreen.style.display = 'none';
      adminApp.style.display = 'grid';
      init();
    } else {
      gateError.textContent = 'Incorrect password.';
    }
  }
  gateSubmit.addEventListener('click', tryUnlock);
  gatePassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });

  // ---------------- Tree helpers ----------------
  function slugify(title) {
    let s = (title || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    return (s.slice(0, 60) || 'item');
  }
  function collectAllSlugs() {
    const set = new Set();
    function rec(arr) { arr.forEach(n => { set.add(n.slug); if (n.children) rec(n.children); }); }
    DATA.categories.forEach(cat => { set.add(cat.slug); rec(cat.children || []); });
    return set;
  }
  function uniqueSlug(title) {
    const existing = collectAllSlugs();
    const base = slugify(title);
    let slug = base, i = 2;
    while (existing.has(slug)) { slug = base + '-' + i; i++; }
    return slug;
  }
  function nextTag() {
    let max = 0;
    function rec(arr) {
      arr.forEach(n => {
        if (n.tag) { const num = parseInt(n.tag.replace('TAG-', ''), 10); if (!isNaN(num) && num > max) max = num; }
        if (n.children) rec(n.children);
      });
    }
    DATA.categories.forEach(cat => rec(cat.children || []));
    return 'TAG-' + String(max + 1).padStart(4, '0');
  }
  function searchChildren(arr, slug, parentArray, parentNode) {
    for (const n of arr) {
      if (n.slug === slug) return { node: n, parentArray, parentNode };
      if (n.children && n.children.length) {
        const f = searchChildren(n.children, slug, n.children, n);
        if (f) return f;
      }
    }
    return null;
  }
  function findBySlug(slug) {
    for (const cat of DATA.categories) {
      if (cat.slug === slug) return { node: cat, parentArray: DATA.categories, parentNode: null, category: cat, isCategory: true };
      const found = searchChildren(cat.children || [], slug, cat.children, null);
      if (found) return { ...found, category: cat, isCategory: false };
    }
    return null;
  }
  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }
  function markDirty() {
    dirty = true;
    document.getElementById('saveIndicator').textContent = 'Unsaved changes — export data.js to persist';
    document.getElementById('saveIndicator').classList.add('dirty');
  }
  function markClean() {
    dirty = false;
    document.getElementById('saveIndicator').textContent = 'No unsaved changes';
    document.getElementById('saveIndicator').classList.remove('dirty');
  }

  // ---------------- Tree rendering ----------------
  const treeEl = document.getElementById('adminTree');

  function renderTree() {
    treeEl.innerHTML = '';
    DATA.categories.forEach(cat => treeEl.appendChild(renderCatNode(cat)));
  }

  function countPages(node) {
    let n = node.type === 'page' ? 1 : 0;
    (node.children || []).forEach(c => n += countPages(c));
    return n;
  }

  function renderCatNode(cat) {
    const el = document.createElement('div');
    el.className = 'a-cat';
    el.dataset.slug = cat.slug;
    const total = (cat.children || []).reduce((s, c) => s + countPages(c), 0);
    el.innerHTML = `
      <div class="a-cat-head">
        <span class="chev">&#9656;</span>
        <span class="swatch" style="background:${cat.color}"></span>
        <span class="a-title">${cat.title}</span>
        <span style="font-family:var(--font-code); font-size:10px; color:var(--muted); margin-left:auto;">${total}</span>
        <button class="a-icon-btn" title="Rename / edit category" data-act="edit-cat">&#9998;</button>
        <button class="a-icon-btn" title="Add page in this category" data-act="add-page">&#43;</button>
        <button class="a-icon-btn" title="Delete category" data-act="del-cat">&times;</button>
      </div>
      <div class="a-pages"></div>
    `;
    const head = el.querySelector('.a-cat-head');
    const pagesWrap = el.querySelector('.a-pages');
    (cat.children || []).forEach(child => pagesWrap.appendChild(renderPageNode(child, cat)));

    head.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (act) {
        e.stopPropagation();
        if (act.dataset.act === 'edit-cat') selectCategory(cat.slug);
        if (act.dataset.act === 'add-page') promptCreate('New page in "' + cat.title + '"', (title) => createPage(cat, null, title));
        if (act.dataset.act === 'del-cat') deleteCategory(cat);
        return;
      }
      el.classList.toggle('open');
    });
    return el;
  }

  function renderPageNode(node, cat) {
    const wrap = document.createElement('div');
    const row = document.createElement('div');
    row.className = 'a-page-row' + (selected && selected.slug === node.slug ? ' active' : '');
    row.dataset.slug = node.slug;
    const hasKids = node.children && node.children.length > 0;
    row.innerHTML = `
      ${hasKids ? '<span class="chev" style="width:9px;font-size:9px;">&#9656;</span>' : '<span style="width:9px;"></span>'}
      <span class="a-title">${node.title}</span>
      <button class="a-icon-btn" title="Add sub-page" data-act="add-sub">&#43;</button>
      <button class="a-icon-btn" title="Delete" data-act="del-page">&times;</button>
    `;
    wrap.appendChild(row);
    let childWrap = null;
    if (hasKids) {
      childWrap = document.createElement('div');
      childWrap.className = 'a-children';
      childWrap.style.display = 'none';
      node.children.forEach(c => childWrap.appendChild(renderPageNode(c, cat)));
      wrap.appendChild(childWrap);
    }
    row.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (act) {
        e.stopPropagation();
        if (act.dataset.act === 'add-sub') promptCreate('New sub-page under "' + node.title + '"', (title) => createPage(cat, node, title));
        if (act.dataset.act === 'del-page') deletePage(node);
        return;
      }
      if (e.target.closest('.chev') && childWrap) {
        childWrap.style.display = childWrap.style.display === 'none' ? 'block' : 'none';
        row.querySelector('.chev').style.transform = childWrap.style.display === 'block' ? 'rotate(90deg)' : 'none';
        return;
      }
      selectPage(node.slug);
    });
    return wrap;
  }

  // ---------------- Editor ----------------
  const editorArea = document.getElementById('editorArea');
  const saveBtn = document.getElementById('saveBtn');
  const deleteBtn = document.getElementById('deleteBtn');

  function selectPage(slug) {
    selected = { slug, isCategory: false };
    renderTree();
    highlightSelected();
    renderPageEditor(slug);
  }
  function selectCategory(slug) {
    selected = { slug, isCategory: true };
    renderTree();
    renderCategoryEditor(slug);
  }
  function highlightSelected() {
    if (!selected) return;
    const row = treeEl.querySelector(`.a-page-row[data-slug="${cssEsc(selected.slug)}"]`);
    if (row) {
      row.classList.add('active');
      let p = row.closest('.a-children');
      while (p) { p.style.display = 'block'; p = p.parentElement.closest('.a-children'); }
      let catP = row.closest('.a-cat');
      if (catP) catP.classList.add('open');
    }
  }
  function cssEsc(s) { return s.replace(/[^a-zA-Z0-9_-]/g, m => '\\' + m); }

  function renderPageEditor(slug) {
    const found = findBySlug(slug);
    if (!found) return;
    const node = found.node;
    saveBtn.style.display = 'inline-flex';
    deleteBtn.style.display = 'inline-flex';
    editorArea.innerHTML = `
      <div class="field">
        <label class="field-label">Title</label>
        <input type="text" id="editTitle" value="${escapeAttr(node.title)}">
      </div>
      <div class="field" style="display:flex; gap:16px; font-family:var(--font-code); font-size:11.5px; color:var(--muted);">
        <span>${node.tag}</span>
        <span>${found.category.title}</span>
        <span>${node.status === 'complete' ? 'Written' : 'Empty'}</span>
      </div>
      <div class="field">
        <label class="field-label">Content (Markdown)</label>
        <div class="editor-grid">
          <textarea id="mdEditor" placeholder="Write your notes in Markdown...">${escapeTextarea(node.content || '')}</textarea>
          <div class="preview-pane" id="previewPane"></div>
        </div>
      </div>
    `;
    const mdEditor = document.getElementById('mdEditor');
    const previewPane = document.getElementById('previewPane');
    function updatePreview() { previewPane.innerHTML = renderMarkdown(mdEditor.value) || '<p style="color:var(--muted)">Nothing to preview yet.</p>'; }
    updatePreview();
    mdEditor.addEventListener('input', updatePreview);

    saveBtn.onclick = () => {
      const newTitle = document.getElementById('editTitle').value.trim() || node.title;
      node.title = newTitle;
      node.content = mdEditor.value;
      node.status = mdEditor.value.trim() ? 'complete' : 'empty';
      node.updated = todayStr();
      markDirty();
      renderTree();
      highlightSelected();
    };
    deleteBtn.onclick = () => deletePage(node);
  }

  function renderCategoryEditor(slug) {
    const cat = DATA.categories.find(c => c.slug === slug);
    if (!cat) return;
    saveBtn.style.display = 'inline-flex';
    deleteBtn.style.display = 'inline-flex';
    const total = (cat.children || []).reduce((s, c) => s + countPages(c), 0);
    editorArea.innerHTML = `
      <div class="field">
        <label class="field-label">Category title</label>
        <input type="text" id="editCatTitle" value="${escapeAttr(cat.title)}">
      </div>
      <div class="field">
        <label class="field-label">Tab color</label>
        <input type="text" id="editCatColor" value="${escapeAttr(cat.color)}">
      </div>
      <p style="color:var(--muted); font-size:13px;">${total} pages filed under this category.</p>
    `;
    saveBtn.onclick = () => {
      cat.title = document.getElementById('editCatTitle').value.trim() || cat.title;
      cat.color = document.getElementById('editCatColor').value.trim() || cat.color;
      markDirty();
      renderTree();
    };
    deleteBtn.onclick = () => deleteCategory(cat);
  }

  function escapeAttr(s) { return (s || '').replace(/"/g, '&quot;'); }
  function escapeTextarea(s) { return (s || '').replace(/</g, '&lt;'); }

  // ---------------- Create / Delete ----------------
  function createPage(cat, parentNode, title) {
    if (!title || !title.trim()) return;
    const node = {
      title: title.trim(),
      slug: uniqueSlug(title),
      type: 'page',
      tag: nextTag(),
      content: '',
      status: 'empty',
      updated: null,
      children: []
    };
    if (parentNode) { parentNode.children = parentNode.children || []; parentNode.children.push(node); }
    else { cat.children = cat.children || []; cat.children.push(node); }
    markDirty();
    renderTree();
    selectPage(node.slug);
  }

  function createCategory(title) {
    if (!title || !title.trim()) return;
    const palette = ['#FFB454', '#4FD1C5', '#C77DFF', '#5FD068', '#E85D5D', '#7FA8D9'];
    const cat = {
      title: title.trim(),
      slug: uniqueSlug(title),
      type: 'category',
      color: palette[Math.floor(Math.random() * palette.length)],
      children: []
    };
    DATA.categories.push(cat);
    markDirty();
    renderTree();
    selectCategory(cat.slug);
  }

  function deletePage(node) {
    const kids = countPages(node);
    const msg = kids > 1
      ? `Delete "${node.title}" and its ${kids - 1} sub-page(s)? This can't be undone (unless you skip exporting).`
      : `Delete "${node.title}"? This can't be undone (unless you skip exporting).`;
    if (!confirm(msg)) return;
    const found = findBySlug(node.slug);
    if (!found) return;
    const idx = found.parentArray.indexOf(node);
    if (idx > -1) found.parentArray.splice(idx, 1);
    if (selected && selected.slug === node.slug) { selected = null; editorArea.innerHTML = `<div class="empty-editor">Select a topic on the left to edit it.</div>`; saveBtn.style.display = 'none'; deleteBtn.style.display = 'none'; }
    markDirty();
    renderTree();
  }

  function deleteCategory(cat) {
    const total = (cat.children || []).reduce((s, c) => s + countPages(c), 0);
    const msg = `Delete category "${cat.title}" and all ${total} pages inside it? This can't be undone (unless you skip exporting).`;
    if (!confirm(msg)) return;
    const idx = DATA.categories.indexOf(cat);
    if (idx > -1) DATA.categories.splice(idx, 1);
    if (selected && selected.slug === cat.slug) { selected = null; editorArea.innerHTML = `<div class="empty-editor">Select a topic on the left to edit it.</div>`; saveBtn.style.display = 'none'; deleteBtn.style.display = 'none'; }
    markDirty();
    renderTree();
  }

  // ---------------- Modal (create prompt) ----------------
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalInput = document.getElementById('modalInput');
  const modalCancel = document.getElementById('modalCancel');
  const modalConfirm = document.getElementById('modalConfirm');
  let pendingCallback = null;

  function promptCreate(label, callback) {
    modalTitle.textContent = label;
    modalInput.value = '';
    pendingCallback = callback;
    modalOverlay.classList.add('show');
    setTimeout(() => modalInput.focus(), 50);
  }
  modalCancel.addEventListener('click', () => modalOverlay.classList.remove('show'));
  modalConfirm.addEventListener('click', () => {
    if (pendingCallback) pendingCallback(modalInput.value);
    modalOverlay.classList.remove('show');
  });
  modalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { modalConfirm.click(); }
    if (e.key === 'Escape') { modalCancel.click(); }
  });

  document.getElementById('addCatBtn').addEventListener('click', () => {
    promptCreate('New category', (title) => createCategory(title));
  });

  // ---------------- Export ----------------
  document.getElementById('exportBtn').addEventListener('click', () => {
    const payload = {
      siteTitle: DATA.siteTitle,
      siteTagline: DATA.siteTagline,
      author: DATA.author,
      categories: DATA.categories
    };
    const js = 'window.SITE_DATA = ' + JSON.stringify(payload, null, 1) + ';\n';
    const blob = new Blob([js], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    markClean();
    alert('Downloaded data.js.\n\nReplace assets/js/data.js in your project with this file, then commit & push to update the live site.');
  });

  window.addEventListener('beforeunload', (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  // ---------------- Init ----------------
  function init() {
    renderTree();
  }
})();
