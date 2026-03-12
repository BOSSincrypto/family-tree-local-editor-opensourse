# Family Tree Local Editor

Interactive family tree editor that runs entirely in the browser. No server, no database — all data stays on your device.

Built for [GitHub Pages](https://pages.github.com/) deployment.

![Light theme](https://img.shields.io/badge/theme-light-white) ![Dark theme](https://img.shields.io/badge/theme-dark-333333) ![Languages](https://img.shields.io/badge/languages-RU%20%7C%20EN-blue)

## Features

- **Visual tree editor** — interactive family tree with SVG connections, pan & zoom (mouse + touch)
- **Person management** — add, edit, delete persons with detailed profiles (name, patronymic, dates, places, biography, photo URL)
- **Relationships** — parent, child, spouse, sibling connections
- **Local storage** — data auto-saves to browser localStorage
- **Backup system** — import/export JSON files for safe offline backup
- **Save as image** — export tree as PNG
- **Dark / Light theme** — toggle in the navbar, remembers your preference
- **Bilingual UI** — Russian and English interface, switch anytime
- **Patronymic support** — middle name (otchestvo) field for Russian naming conventions
- **Responsive design** — works on phones, tablets, and desktops; hamburger menu on mobile, touch-friendly controls
- **Zero dependencies** — pure HTML, CSS, JavaScript. No frameworks, no build step

## Quick Start

### Option 1: GitHub Pages

1. Fork or clone this repository
2. Go to **Settings > Pages > Source**: select `Deploy from a branch`, choose `main`
3. Your site will be available at `https://<username>.github.io/family-tree-local-editor-opensourse/`

### Option 2: Local

```bash
git clone https://github.com/BOSSincrypto/family-tree-local-editor-opensourse.git
cd family-tree-local-editor-opensourse
python3 -m http.server 8080
# Open http://localhost:8080
```

Any static file server will work (Live Server in VS Code, `npx serve`, etc.).

## How to Use

1. **Create a tree** — click "New tree" and add the first person
2. **Add relatives** — click on a person node, then use the sidebar "Add" button to add parents, spouse, children, siblings
3. **Edit details** — click on a person, then click the edit icon in the sidebar to change name, dates, biography, photo
4. **Navigate** — drag to pan, scroll to zoom, or use the control buttons on the right
5. **Save backup** — click "Export" to download a JSON file with all your data
6. **Restore backup** — click "Import" to load a previously saved JSON file
7. **Save as image** — click the "Save as image" button to export the tree as PNG

## Data Storage

| What | Where | Key |
|------|-------|-----|
| Tree data (persons, relationships) | `localStorage` | `familyTreeData` |
| Language preference | `localStorage` | `familyTreeLang` |
| Theme preference | `localStorage` | `familyTreeTheme` |

**Important**: localStorage is browser-specific and can be cleared. Always export a backup JSON before clearing browser data or switching devices.

## Project Structure

```
├── index.html           # Single-page application
├── css/
│   └── style.css        # Styles + CSS variables for themes
├── js/
│   ├── app.js           # Main controller
│   ├── data-manager.js  # Data CRUD & localStorage
│   ├── tree-renderer.js # Tree layout & SVG rendering
│   ├── person-editor.js # Sidebar person view/edit
│   ├── i18n.js          # Translations (RU/EN)
│   └── theme.js         # Dark/light theme manager
├── img/                 # Static assets
├── AGENTS.md            # Project rules for AI agents
└── README.md
```

## Backup File Format

The JSON backup contains:

```json
{
  "version": "1.0",
  "meta": {
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z",
    "treeName": "Family Tree"
  },
  "persons": {
    "p_abc123": {
      "id": "p_abc123",
      "firstName": "Ivan",
      "lastName": "Petrov",
      "middleName": "Sergeevich",
      "gender": "male",
      "birthDate": "1990-05-15",
      "birthPlace": "Moscow",
      "deathDate": null,
      "deathPlace": "",
      "biography": "",
      "photo": null
    }
  },
  "relationships": [
    { "person1": "p_abc123", "person2": "p_def456", "type": "parent-child" }
  ],
  "rootPersonId": "p_abc123"
}
```

## License

Open source. Free to use, modify, and distribute.
