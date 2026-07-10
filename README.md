# CASEFILE — Personal Security Knowledgebase

A static personal wiki for pentesting/forensics methodologies, payloads, and notes. **No admin panel, no login, no backend** — every topic is a plain `.md` file you edit directly on GitHub (or locally). Visitors can only ever *view* the site; the only way to change anything is by pushing to the repo.

## What's in here

- **987 topics** indexed across 16 categories (Web, Network, Linux/Windows/macOS hardening, Mobile, Cloud, Binary Exploitation, Reversing, Crypto, Stego, AI, etc.)
- **45 topics fully written** so far — original write-ups (not copied from anywhere) covering general methodology, digital forensics (Linux/Windows artifacts, memory forensics, PCAP analysis, malware analysis), Active Directory attacks, core web vulns (SQLi, XSS, SSRF, CSRF, IDOR, SSTI, XXE, deserialization, JWT, GraphQL, WebSockets, race conditions, file upload, clickjacking), privilege escalation checklists, cloud pentesting, mobile pentesting, FTP/SSH enumeration, binary exploitation, reversing, crypto, and stego.
- **~942 topics indexed but empty** — titled and slotted into the right category, each with a predictable file path already assigned, waiting for you (or me, on request) to fill in.

## How content is stored

```
content/<category-slug>/<topic-slug>.md
```
Every topic is just a markdown file at a predictable path. To see the exact path for any topic, open it on the live site — if it's empty, the page shows you exactly which file to create.

The site structure itself (titles, categories, tag numbers, which topics exist) lives in one small file: `assets/js/nav-data.js`. You'll only touch this when adding a *brand new* topic or category — editing existing write-ups never requires touching it.

## Editing an existing write-up

1. Go to the file on GitHub: `content/<category>/<topic>.md`
2. Click the pencil (edit) icon
3. Write in normal Markdown — headers, code blocks, tables, lists, checkboxes (`- [ ]`) all render on the site
4. Commit directly to `main` (or open a PR if you prefer)
5. GitHub Pages redeploys automatically within about a minute

Even faster: once you set your repo URL in `assets/js/config.js` (see below), every page on the live site shows a real **"Edit on GitHub"** button that takes you straight to that exact file's editor — no need to navigate GitHub's file tree manually.

## Filling in an empty topic

Empty topics show a **"Create this file on GitHub"** button (once `config.js` is set) that opens GitHub's "new file" editor with the correct path and filename already filled in — just write your notes and commit. No need to touch `nav-data.js` at all; the site always tries to load the file live, so as soon as it exists, the topic shows as written.

## One-time setup: config.js

Open `assets/js/config.js` and fill in your repo URL once, after you've created it on GitHub:
```js
window.SITE_CONFIG = {
  githubRepoUrl: "https://github.com/<your-username>/<your-repo>",
  branch: "main"
};
```
This is what powers the "Edit on GitHub" / "Create this entry" buttons throughout the site. Leave it blank and those buttons just won't show — everything else still works.

## Adding a brand new topic or category

Two ways — pick whichever you're comfortable with.

### Option A — the helper script (recommended, no manual JSON editing)
Run this locally, then commit what it changes:
```bash
# See existing categories and their exact names/slugs
python3 tools/add_page.py --list-categories

# Add a new page inside an existing category
python3 tools/add_page.py --category "🕸️ Pentesting Web" --title "GraphQL Batching Attacks"

# Add a sub-page nested under an existing topic (use the slug from the site's URL bar)
python3 tools/add_page.py --parent-slug sql-injection --title "Blind SQLi Automation"

# Create a brand new top-level category
python3 tools/add_page.py --new-category "Wireless Pentesting"
```
It updates `nav-data.js` and creates the empty `.md` file for you. Then:
```bash
git add .
git commit -m "Add topic: GraphQL Batching Attacks"
git push
```
No dependencies beyond Python 3 (already on most systems, including via Termux if you're doing this from a phone).

### Option B — by hand
1. Open `assets/js/nav-data.js` in a text editor
2. Find the category you want (search for its title), and add a new object into its `children` array:
```json
{"title": "New Topic", "slug": "new-topic", "type": "page", "tag": "TAG-0988", "contentPath": "content/pentesting-web/new-topic.md", "hasContent": true, "children": []}
```
   (slug must be unique site-wide, lowercase, hyphenated; tag should be the next unused `TAG-NNNN` number)
3. Create `content/pentesting-web/new-topic.md` with your write-up
4. Commit and push both files together

## Deploying to GitHub Pages

1. Create a repo on GitHub (public, or private if you have GitHub Pro/Team/Enterprise — private repos need a paid plan for Pages)
2. Push all these files to the repo root
3. **Settings → Pages → Source** → Deploy from a branch → `main` → `/ (root)` → Save
4. Live at `https://<your-username>.github.io/<repo-name>/` within a minute or two
5. Fill in `assets/js/config.js` with that repo's URL, commit, push again

## Running locally

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```
A plain double-click on `index.html` won't work well here, since the site fetches each topic's `.md` file over HTTP — browsers block that (`fetch`) for local `file://` pages. The tiny local server above solves it in one command.

## Asking me to keep writing topics

Since only 45 of 987 are written, come back anytime and ask — e.g. "write up Docker container escapes and SMB enumeration" — and I'll hand you the markdown files to drop straight into `content/<category>/<slug>.md`, matching the existing tree exactly.

## Project structure

```
index.html                — the site (view-only, no login anywhere)
assets/css/style.css      — all styling
assets/js/nav-data.js     — site structure: titles, categories, tags, file paths
assets/js/config.js       — your GitHub repo URL (fill in once)
assets/js/app.js          — viewer logic (nav, routing, search, fetches .md files on demand)
assets/js/markdown.js     — tiny built-in markdown renderer (no external deps)
content/<category>/*.md   — every topic's actual write-up, one file each
tools/add_page.py         — optional local helper for adding new topics/categories
```
