# home-loan-rates: Home Loan Advisor Training

React (Vite) version of the Home Loan Advisor training curriculum: 18 modules with checkboxes, progress ring, quizzes, special cases, a shared Drive link, and PDF progress reports.

All data is saved in the browser with **localStorage**, so there is no server or database. Each browser keeps its own sheets.

## Requirements

- Node.js 18 or newer (includes npm): https://nodejs.org

## Run it locally

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

## Build

```bash
npm run build     # outputs the site to dist/
npm run preview   # serves dist/ locally to check the build
```

## Deploy on Vercel

1. Push this folder to GitHub (`node_modules` and `dist` are already ignored).
2. In Vercel: **Add New… → Project → Import** the repo.
3. Vercel detects **Vite** automatically. Defaults are correct:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click **Deploy**. Every push to GitHub redeploys.

## Project structure

```
index.html                 Vite entry page
src/main.jsx               React entry
src/App.jsx                App state: sheets, quiz, special cases, Drive link, PDFs
src/styles.css             All styles
src/data/modules.js        Curriculum content (modules and pointers): edit topics here
src/data/quizBank.js       Quiz questions: first option is always the correct one
src/lib/curriculum.js      Checkbox keys, progress maths, quiz pool
src/lib/storage.js         localStorage load/save
src/lib/pdfEngine.js       Dependency-free PDF writer
src/lib/reports.js         Progress report and team PDF layouts
src/components/            Sidebar, ModuleCard, SpecialCases, TeamOverview, QuizModal, PromptDialog
```

## Notes

- Progress saved by the earlier single-file HTML version (same browser, same site) is picked up automatically; the storage key is unchanged.
- Each checkbox's saved key comes from its pointer text. Rewording a pointer in `modules.js` resets that tick.
- Quiz questions link to a pointer by module `m` and position `p` (0-based, counting every pointer in the module in order).
- localStorage is per browser and per site address. Progress does not move between devices and is lost if the browser data is cleared.
