# CASEFILE — Personal Security Knowledgebase

A static personal wiki for pentesting/forensics methodologies, payloads, and notes. **No admin panel, no login, no backend** — every topic is a plain `.md` file you edit directly on GitHub. Visitors can only ever *view* the site; the only way to change anything is by pushing to the repo.

## Folder structure matches the real thing, byte-for-byte

If you're used to browsing `HackTricks-wiki/hacktricks` on GitHub, this repo will feel identical to navigate — same folder names, same file names, same nesting (e.g. `pentesting-web/sql-injection/sqlmap/README.md` and `pentesting-web/sql-injection/sqlmap/second-order-injection-sqlmap.md` are exactly where you'd expect them). That's intentional: folder and file names are just topic/tool labels, not creative writing, so there's nothing wrong with matching them exactly. **The actual write-up text inside each file is 100% original** — none of it is copied from HackTricks or anywhere else, and it never will be, regardless of how the file paths look.

```
content/<real-folder-path>/<real-filename>.md
```

- **979 topics** indexed across 16 categories, mirroring the real repo's structure exactly
- **56 topics fully written** with original, detailed content — tool commands, real payloads, step-by-step techniques (Active Directory attack chains, SQL injection per-database-engine cheat sheets, SMB/DNS/SMTP/RDP/SNMP enumeration, Docker/container escapes, and more)
- **~923 topics indexed but empty** — the exact file already exists at the exact path you'd expect; open any empty one on the site and it shows you precisely which file to fill in

## A quick note on how this is built, and its one hard limit

I (Claude) generated this structure by pulling only the **directory/file names and short titles** from the real repo — a table of contents, essentially — never the article text itself. Every written entry is authored from scratch. I won't reproduce someone else's write-ups verbatim or lightly reworded, even file-by-file, even for private use — that doesn't change what it is. If you want a specific empty file filled in, ask me and I'll write an original version; if you'd rather fill some in yourself by referencing other sources, that's entirely your call to make as the site's owner — just know this project itself won't do that part for you.

## Editing an existing write-up

1. Go to the file on GitHub: `content/<folder>/<file>.md`
2. Click the pencil (edit) icon
3. Write in normal Markdown — headers, code blocks, tables, lists, checkboxes (`- [ ]`) all render on the site
4. Commit to `main`
5. GitHub Pages redeploys automatically within about a minute

Once you set your repo URL in `assets/js/config.js` (one-time setup below), every page shows a real **"Edit on GitHub"** button linking straight to that file's editor.

## Filling in an empty topic

Empty topics show a **"Create this file on GitHub"** button (once `config.js` is set) that opens GitHub's "new file" editor with the correct path and filename already filled in. No need to touch `nav-data.js` — the site always tries to load the file live, so as soon as it exists at that path, the topic shows as written.

Folders that are *also* their own topic (like `crypto/` having both its own overview and sub-pages like `crypto/public-key.md`) work the same way — the folder's own `README.md` renders as an intro at the top of that category's page.

## One-time setup: config.js

```js
window.SITE_CONFIG = {
  githubRepoUrl: "https://github.com/<your-username>/<your-repo>",
  branch: "main"
};
```
Powers the "Edit on GitHub" / "Create this entry" buttons everywhere. Leave blank and those buttons just don't show — everything else still works.

## Adding a brand new topic or category

Real HackTricks doesn't have infinite topics forever — if you find something genuinely missing, add it the same way:

```bash
python3 tools/add_page.py --list-categories
python3 tools/add_page.py --category "🕸️ Pentesting Web" --title "GraphQL Batching Attacks"
python3 tools/add_page.py --parent-slug pentesting-web-sql-injection --title "Blind SQLi Automation"
python3 tools/add_page.py --new-category "Wireless Pentesting"
```
Updates `nav-data.js` and creates the empty `.md` file. Then:
```bash
git add . && git commit -m "Add topic: GraphQL Batching Attacks" && git push
```

## Deploying to GitHub Pages

1. Create a repo on GitHub
2. Push all these files to the repo root
3. **Settings → Pages → Source** → Deploy from a branch → `main` → `/ (root)` → Save
4. Live at `https://<your-username>.github.io/<repo-name>/` within a minute or two
5. Fill in `assets/js/config.js` with that URL, commit, push again

## Running locally

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```
Double-clicking `index.html` directly won't work — the site fetches each topic's `.md` file over HTTP, which browsers block for local `file://` pages. The one-line server above fixes it.

## Asking me to keep writing topics

Just tell me which real files/folders to prioritize next (e.g. "write up the remaining SQL injection files: cypher-injection-neo4j.md, mssql-injection.md, oracle-injection.md" or "cover pentesting-smb's rpcclient-enumeration.md and pentesting-snmp's cisco-snmp.md") and I'll hand you original markdown that drops straight into the matching path.

## Project structure

```
index.html                — the site (view-only, no login anywhere)
assets/css/style.css      — all styling
assets/js/nav-data.js     — site structure: titles, categories, tags, real file paths
assets/js/config.js       — your GitHub repo URL (fill in once)
assets/js/app.js          — viewer logic (routing, search, fetches .md files on demand)
assets/js/markdown.js     — tiny built-in markdown renderer (no external deps)
content/<real paths>/*.md — every topic's write-up, exactly where you'd expect to find it
tools/add_page.py         — optional local helper for adding new topics/categories
```
