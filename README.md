# CASEFILE — Personal Security Knowledgebase

A self-contained, static personal wiki for pentesting/forensics methodologies, payloads, and notes — with a built-in admin editor. No build step, no backend, no database server. Everything lives in one JS file (`assets/js/data.js`) that the whole site reads from.

## What's in here

- **987 topics** pre-indexed across 16 categories (Web, Network, Linux/Windows/macOS hardening, Mobile, Cloud, Binary Exploitation, Reversing, Crypto, Stego, AI, etc.) — the same topic *coverage* as major public pentesting wikis, organized my own way.
- **26 topics fully written** already (original content, not copied from anywhere): general pentesting methodology, recon, fuzzing, phishing methodology, digital forensics fundamentals (Linux/Windows artifacts, memory forensics, PCAP analysis, malware analysis — matching your forensics/IR focus), privilege escalation checklists, core web vulns (SQLi, XSS, SSRF, command injection), mobile pentesting, binary exploitation basics, reversing, crypto, and stego.
- **~961 topics indexed but empty** — titled and slotted into the right category, waiting for content. This is intentional: writing out an entire 990-page wiki's worth of original content isn't something any single pass can responsibly do. Fill these in yourself as you learn each topic, or come back and ask me to write specific ones and I'll drop them in.

## Running it locally

No install needed — it's plain HTML/CSS/JS.

```bash
# Just open it directly
open index.html          # macOS
xdg-open index.html       # Linux
# or double-click index.html in your file explorer
```

If double-clicking doesn't load fonts/scripts correctly in your browser, run a tiny local server instead:
```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying to GitHub Pages (free)

1. Create a new GitHub repo (can be public or private — see security note below).
2. Push these files to the repo root (or a `docs/` folder — your choice).
3. In the repo: **Settings → Pages → Source** → select the branch/folder you pushed to.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Using the admin panel

Open `admin.html` (works the same locally or once deployed). Default password: **`changeme`**.

**Change the password before deploying anywhere public:**
1. Open any page of the site, open the browser console (F12).
2. Run: `await hashPassword("your-new-password")`
3. Copy the printed hash into `assets/js/admin-config.js`, replacing `ADMIN_PASSWORD_HASH`.

**Important — read this:** the admin password is a *soft deterrent*, not real security. Since this is a static site, anyone who can view the page source can see the check being performed (though not reverse the hash back into your password). If you want actual access control, keep the GitHub repo **private** and use GitHub Pages' private-repo support (requires GitHub Pro/Team/Enterprise) — or host it behind Cloudflare Access / Netlify password protection instead of relying on the in-app gate.

### How saving works (important — static sites can't write files on their own)

The admin panel edits content **in your browser's memory only** while you work. To make changes permanent:

1. Edit/add/delete pages in the admin panel as needed.
2. Click **"Export data.js"** in the top-left toolbar — downloads an updated `data.js`.
3. Replace `assets/js/data.js` in your project folder with the downloaded file.
4. If deployed: `git add assets/js/data.js && git commit -m "update notes" && git push` — GitHub Pages redeploys automatically within a minute.

If you close the admin tab without exporting, your edits are lost — the export step *is* the save button, in effect. There's a browser warning if you try to close the tab with unsaved changes.

## Adding topics later (including asking me)

Since only 26 of 987 topics are written, the natural workflow going forward:
- Fill in your own notes as you learn/practice a technique — that's what the admin editor is for.
- Or come back to this conversation (or a new one) and ask me to write up specific topics — e.g. "write the Kerberoasting and Golden Ticket entries" — and I'll hand you updated markdown to paste into the admin editor, or an updated `data.js` directly.

## Project structure

```
index.html              — the viewer (what visitors/you see)
admin.html               — the editor (password-gated)
assets/css/style.css     — all styling (single stylesheet)
assets/js/data.js        — ALL content lives here (the "database")
assets/js/app.js         — viewer logic (nav, routing, search)
assets/js/admin.js       — admin CRUD logic
assets/js/admin-config.js — admin password hash
assets/js/markdown.js    — tiny built-in markdown renderer (no external deps)
```

No frameworks, no npm packages required to run, no CDN dependency except Google Fonts (site still works fine without internet — it just falls back to system fonts).
