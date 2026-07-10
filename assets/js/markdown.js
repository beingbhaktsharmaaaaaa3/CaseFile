/* Minimal, dependency-free Markdown -> HTML renderer.
   Supports: headers, bold/italic, inline code, fenced code blocks,
   tables, ordered/unordered lists (incl. checkboxes), blockquotes,
   horizontal rules, links, paragraphs. No external deps by design —
   keeps the site fully static/offline-capable. */

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderInline(text) {
  let t = escapeHtml(text);
  // inline code (protect from further formatting)
  const codeStash = [];
  t = t.replace(/`([^`]+)`/g, (m, c) => {
    codeStash.push(c);
    return `\u0000CODE${codeStash.length - 1}\u0000`;
  });
  // links [text](url)
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, url) => {
    const safe = url.replace(/"/g, '&quot;');
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${txt}</a>`;
  });
  // bold
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic (single asterisk or underscore, avoid already-consumed **)
  t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  // restore code
  t = t.replace(/\u0000CODE(\d+)\u0000/g, (m, i) => `<code>${codeStash[parseInt(i)]}</code>`);
  return t;
}

function renderMarkdown(src) {
  if (!src || !src.trim()) return '';
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let i = 0;
  let inList = null; // 'ul' | 'ol'
  let inTable = false;
  let tableHeaderDone = false;

  function closeList() {
    if (inList) { html += `</${inList}>`; inList = null; }
  }

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    if (/^```/.test(line)) {
      closeList();
      const lang = line.replace(/^```/, '').trim();
      let code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      html += `<pre><button class="copy-btn" onclick="copyCode(this)">copy</button><code class="lang-${escapeHtml(lang)}">${escapeHtml(code.join('\n'))}</code></pre>`;
      continue;
    }

    // table
    if (/^\|(.+)\|$/.test(line.trim())) {
      const isSeparator = /^\|?[\s:|-]+\|?$/.test(line) && line.includes('-');
      if (!inTable) {
        inTable = true;
        tableHeaderDone = false;
        html += '<table>';
      }
      if (isSeparator) { i++; continue; }
      const cells = line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      if (!tableHeaderDone) {
        html += '<thead><tr>' + cells.map(c => `<th>${renderInline(c)}</th>`).join('') + '</tr></thead><tbody>';
        tableHeaderDone = true;
      } else {
        html += '<tr>' + cells.map(c => `<td>${renderInline(c)}</td>`).join('') + '</tr>';
      }
      i++;
      continue;
    } else if (inTable) {
      html += '</tbody></table>';
      inTable = false;
    }

    // headers
    let m;
    if ((m = /^(#{1,4})\s+(.*)$/.exec(line))) {
      closeList();
      const level = m[1].length;
      html += `<h${level}>${renderInline(m[2])}</h${level}>`;
      i++;
      continue;
    }

    // horizontal rule
    if (/^(---+|\*\*\*+)\s*$/.test(line)) {
      closeList();
      html += '<hr>';
      i++;
      continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      closeList();
      let quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      html += `<blockquote>${renderInline(quote.join(' '))}</blockquote>`;
      continue;
    }

    // checklist item
    if ((m = /^\s*-\s+\[( |x|X)\]\s+(.*)$/.exec(line))) {
      if (inList !== 'ul') { closeList(); html += '<ul>'; inList = 'ul'; }
      const checked = m[1].toLowerCase() === 'x';
      html += `<li class="checklist-item${checked ? ' checked' : ''}">${renderInline(m[2])}</li>`;
      i++;
      continue;
    }

    // unordered list
    if ((m = /^\s*[-*]\s+(.*)$/.exec(line))) {
      if (inList !== 'ul') { closeList(); html += '<ul>'; inList = 'ul'; }
      html += `<li>${renderInline(m[1])}</li>`;
      i++;
      continue;
    }

    // ordered list
    if ((m = /^\s*\d+\.\s+(.*)$/.exec(line))) {
      if (inList !== 'ol') { closeList(); html += '<ol>'; inList = 'ol'; }
      html += `<li>${renderInline(m[1])}</li>`;
      i++;
      continue;
    }

    // blank line
    if (/^\s*$/.test(line)) {
      closeList();
      i++;
      continue;
    }

    // paragraph (collect contiguous non-blank lines)
    closeList();
    let para = [line];
    i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) &&
           !/^```/.test(lines[i]) && !/^#{1,4}\s/.test(lines[i]) &&
           !/^\|(.+)\|$/.test(lines[i].trim()) &&
           !/^(-{3,}|\*{3,})\s*$/.test(lines[i]) &&
           !/^>\s?/.test(lines[i]) &&
           !/^\s*[-*]\s+/.test(lines[i]) &&
           !/^\s*\d+\.\s+/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    html += `<p>${renderInline(para.join(' '))}</p>`;
  }
  closeList();
  if (inTable) html += '</tbody></table>';
  return html;
}

function copyCode(btn) {
  const code = btn.parentElement.querySelector('code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'copied';
    setTimeout(() => { btn.textContent = orig; }, 1200);
  });
}
