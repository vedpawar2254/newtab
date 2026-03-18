# NewTab

**Notion-level productivity in every new tab.**

NewTab is a Chrome extension that replaces your browser's new tab page with a full-featured productivity workspace. Instead of a blank page or a search bar, every new tab opens your personal workspace — notes, tasks, boards, journals, and more — all instantly accessible, all stored locally on your machine.

## Why NewTab?

Every time you open a new tab, you have a moment of intent. Most new tab extensions waste that moment with weather widgets or news feeds. NewTab puts your actual work front and center.

- **Your notes are always one tab away.** No switching apps, no loading screens, no login walls. Open a tab, start writing.
- **It's as powerful as Notion, but lives in your browser.** Rich text editing with markdown shortcuts, nested pages, slash commands, code blocks, tables, and more — the full editing experience you'd expect from a dedicated app.
- **Your data stays on your device.** No accounts, no cloud sync, no servers. Everything is stored locally in your browser. Your notes are yours.
- **It loads instantly.** Under 500ms to interactive. It opens on every new tab — sluggishness is unacceptable.

## What You Get

### Notes & Editor
A block-based rich text editor that feels like Notion. Write with markdown shortcuts that convert instantly, insert any block type with the `/` slash menu, format text with a floating toolbar, drag blocks to reorder, and embed code, tables, and images — all auto-saving as you type.

### Pages & Organization
Nest any note inside another note to any depth. Navigate your page hierarchy from a collapsible sidebar tree. Drag and drop pages to reorganize. Rename and delete from the sidebar.

### Tasks & Kanban
A dedicated todo panel lives on your new tab page — always visible, always ready. For bigger projects, switch to a kanban board view with customizable columns and drag-and-drop cards.

### Productivity Tools
- **Pomodoro timer** — work/break intervals with session tracking
- **Habit tracker** — daily checkboxes with streak counts
- **Daily journal** — auto-created dated entries with reflection prompts
- **Motivational quotes** — rotating daily from a built-in library

### Whiteboard
A freeform drawing canvas for sketches, diagrams, and visual thinking. Loads lazily so it never slows down your new tab.

## Status

NewTab is under active development. Here's where things stand:

| Feature | Status |
|---------|--------|
| Foundation & dark theme | Done |
| Rich text editor | Done |
| Pages & navigation | Done |
| Todo & kanban | In progress |
| Productivity widgets | Planned |
| UX polish & search | Planned |

## Install (Development)

1. Clone the repo
2. Install dependencies:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open `chrome://extensions` in Chrome
5. Enable **Developer mode** (top right)
6. Click **Load unpacked** and select the `.output/chrome-mv3-dev` folder
7. Open a new tab — NewTab should appear

## Build for Production

```
npm run build
```

The built extension will be in `.output/chrome-mv3`. You can also create a zip for distribution:

```
npm run zip
```

## Who Is This For?

- **Note-takers** who want Notion-quality editing without leaving their browser
- **Developers** who live in their browser and want quick access to code snippets, todos, and notes
- **Students** who want a distraction-free workspace that's always one tab away
- **Anyone** who opens dozens of tabs a day and wants each one to start with purpose

## Design Philosophy

1. **Notes first.** The editor is front and center. Everything else supports the writing experience.
2. **Local only.** No accounts, no cloud, no tracking. Your data never leaves your machine.
3. **Dark by default.** A warm dark theme that's easy on the eyes during long sessions.
4. **Instant.** Under 500ms to interactive. A new tab replacement that feels slower than the default is dead on arrival.
5. **Keyboard-driven.** Markdown shortcuts, slash commands, `Cmd+K` command palette — power users should never need the mouse.

## License

MIT
