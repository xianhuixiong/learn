# Antitrust English Lab

Interactive legal‑English playground focused on antitrust / unfair‑competition / fair‑competition terminology. Built with **Vite + React + Tailwind**. No server required.

## ✨ Features
- Spaced‑repetition flashcards (Again/Hard/Good/Easy) with speech synthesis for pronunciation
- Cloze tests, matching game, and sentence‑builder for word order
- Searchable term explorer with quick definition dialogs
- Add / delete your own terms; data persists in browser `localStorage`
- One‑click JSON export/import (export built‑in; import can be added in a few lines)

## 🧱 Tech Stack
- React 18 + TypeScript
- Tailwind CSS
- Vite
- framer‑motion + lucide‑react (icons/animation)

## 🚀 Getting Started (Local)
```bash
# 1) Install deps
npm i

# 2) Run dev server
npm run dev

# 3) Build for production (outputs to dist/)
npm run build
npm run preview
```

## ☁️ Deploy to Vercel (recommended)
1. Push this repo to GitHub.
2. In Vercel, **Add New… → Project** and import the repo.
3. Framework preset: **Vite** (or “Other”). Build command: `npm run build`. Output: `dist`.
4. Deploy. (No environment variables required.)

## 🌐 Deploy to GitHub Pages
Two options:

### A) Vercel → GitHub Pages redirect (simplest)
Deploy on Vercel and set your Pages site to redirect to the Vercel URL.

### B) Static hosting on Pages
1. Build locally: `npm run build`
2. Serve `/dist` with Pages. If you use the `gh-pages` branch method or Actions, set your Pages to the `dist` output.
   - With GitHub Actions, install `actions/upload-pages-artifact` then `actions/deploy-pages` to publish the `dist` folder.

> Note: No special `base` path is needed unless you host under a subpath. If so, set `base:'/YOUR_REPO_NAME/'` in `vite.config.ts` when building for Pages.

## 🛠 Customize
- Add terms in the UI (“Add Term”) or pre‑seed in `src/App.tsx` (`SEED_VOCAB`).
- Skins/brand: tweak `tailwind.config.js` and `src/index.css`.
- Components live in `src/components/ui/` (simple Tailwind primitives).

## 📄 License
MIT — use freely for learning/teaching.
