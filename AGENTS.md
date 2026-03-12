# Family Tree Local Editor

## Project Overview

- Interactive family tree editor designed for GitHub Pages deployment
- Fully client-side: no backend, no build step, no dependencies
- Data stored in browser `localStorage`; backup/restore via JSON files
- Bilingual interface: Russian (default) and English
- Dark/light theme with system preference detection
- Responsive design: mobile-first with breakpoints at 360px, 480px, 768px
- Vanilla HTML + CSS + JavaScript (ES6+, no frameworks)

## Project Structure

```
/
├── index.html              # Single-page app entry point, all HTML markup
├── css/
│   └── style.css           # All styles, CSS variables for theming
├── js/
│   ├── app.js              # Main controller: init, event wiring, modals, import/export
│   ├── data-manager.js     # Data layer: CRUD for persons & relationships, localStorage I/O
│   ├── tree-renderer.js    # SVG tree layout, pan/zoom, node rendering
│   ├── person-editor.js    # Sidebar: view/edit person details, relatives list
│   ├── i18n.js             # Internationalization: RU/EN dictionaries, DOM updater
│   └── theme.js            # Dark/light theme manager
└── img/                    # Static assets (currently empty, avatars use inline SVG)
```

## Architecture

- **Singleton objects** (`App`, `DataManager`, `TreeRenderer`, `PersonEditor`, `I18n`, `ThemeManager`) — no classes, no `new`, just plain object literals
- Communication between modules via direct calls and callback properties (e.g., `TreeRenderer.onNodeClick = ...`)
- All state lives in `DataManager.data` (persons map + relationships array + rootPersonId)
- Tree layout is computed in `TreeRenderer.calculateLayout()` — custom algorithm, not a library

## Code Standards

- **Language**: Vanilla JavaScript (ES6+). No TypeScript, no transpilation
- **No build step**: files are served as-is via GitHub Pages
- **CSS**: use CSS custom properties (variables) defined in `:root` and `[data-theme="dark"]`
- **Responsive**: media queries at 768px (tablet), 480px (mobile), 360px (small mobile); touch-friendly via `@media (hover: none) and (pointer: coarse)`
- **Mobile menu**: hamburger button visible at ≤480px; action buttons move to dropdown `.mobile-menu`
- **i18n**: all user-facing strings must use `I18n.t('key')` in JS or `data-i18n` / `data-i18n-title` / `data-i18n-placeholder` attributes in HTML. Never hardcode UI text
- **File names**: always in English, no Cyrillic or special characters
- **No external dependencies**: no npm, no CDN libs (only Google Fonts via CSS link)
- **localStorage keys**: `familyTreeData` (tree data), `familyTreeLang` (language), `familyTreeTheme` (theme)

## Workflows

### Local Development

```bash
# Any static file server works:
python3 -m http.server 8080
# Then open http://localhost:8080
```

### Deploy

- Push to `main` branch
- GitHub Pages serves from root of `main` (Settings → Pages → Source: Deploy from branch)
- No build, no CI/CD required

### Data Workflow

1. Open the app in browser
2. Import a JSON backup (or create a new tree)
3. Edit the tree (auto-saves to localStorage)
4. Export backup JSON before closing / switching devices

## Tools & Integrations

- **Hosting**: GitHub Pages (static files only)
- **Fonts**: Google Fonts (Inter)
- **CI/CD**: none configured
- **Testing**: manual browser testing only
- **Linting**: none configured

## Key Conventions

- Person data model fields: `id`, `firstName`, `lastName`, `middleName` (patronymic), `gender`, `birthDate`, `birthPlace`, `deathDate`, `deathPlace`, `biography`, `photo`
- Relationship types: `parent-child`, `spouse`
- Gender values: `male`, `female`
- Tree renders from a single `rootPersonId` outward
- Colors: male = blue (`#4A7DFF`), female = pink (`#EC4899`); dark variants exist in theme variables

---

> **For AI agents**: this file (`AGENTS.md`) is the primary source of project rules and context. When working on code tasks in this repository, treat these conventions as authoritative. Check this file first before making architectural or style decisions.
