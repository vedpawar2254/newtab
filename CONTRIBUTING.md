# Contributing to NewTab

Thanks for your interest in contributing to NewTab! This document covers everything you need to get started.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Chrome browser (for testing the extension)

### Setup

```bash
git clone <repo-url>
cd newtab
npm install
npm run dev
```

Then load the extension in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `.output/chrome-mv3-dev`
4. Open a new tab to see the extension

### Running Tests

```bash
npx vitest run
```

### Building

```bash
npm run build        # production build
npm run zip          # create distributable zip
```

## How to Contribute

### Reporting Bugs

Open an issue with:

- **What happened** — describe the bug clearly
- **What you expected** — what should have happened instead
- **Steps to reproduce** — how to trigger the bug
- **Screenshots** — if it's a visual issue, a screenshot helps enormously
- **Browser version** — Chrome version number

### Suggesting Features

Open an issue tagged `feature request` with:

- **The problem** — what are you trying to do that you can't?
- **Your idea** — how would you solve it?
- **Alternatives** — other approaches you considered

Keep in mind that NewTab is intentionally scoped. We prioritize depth over breadth — making existing features great is more valuable than adding new ones.

### Submitting Code

1. **Fork the repo** and create a branch from `main`
2. **Make your changes** — keep commits focused and atomic
3. **Write or update tests** if your change affects behavior
4. **Run the test suite** — make sure everything passes
5. **Open a pull request** with a clear description of what changed and why

### Pull Request Guidelines

- **One concern per PR.** Don't mix bug fixes with feature work.
- **Describe the "why."** The diff shows what changed — the PR description should explain why.
- **Include screenshots** for any visual changes.
- **Keep it small.** Smaller PRs get reviewed faster and merged sooner.

## Project Structure

```
newtab/
  components/       # React components
    editor/         # Editor-related components (toolbar, slash menu, etc.)
    layout/         # Layout components (sidebar, main content)
    ui/             # Reusable UI primitives
  entrypoints/      # WXT entry points
    newtab/         # New tab page (main entry)
    background.ts   # Service worker (metadata fetching, etc.)
  hooks/            # Shared React hooks
  lib/              # Core logic
    editor/         # Tiptap extensions and editor utilities
    hooks/          # Editor-specific hooks
    stores/         # Zustand state stores
    storage/        # IndexedDB/Dexie storage layer
  tests/            # Test files (mirrors src structure)
  .planning/        # Project planning docs (not shipped)
```

## Code Style

- **TypeScript** throughout — no `any` unless absolutely necessary
- **Tailwind CSS** for styling — use the project's token scale, don't invent new values
- **Functional components** with hooks — no class components
- **Named exports** preferred over default exports
- **Dark theme only** — all colors use the project's dark palette tokens

## Architecture Decisions

- **Tiptap** for the editor — built on ProseMirror, headless, extensible
- **Zustand** for state management — lightweight, no boilerplate
- **Dexie.js** for storage — IndexedDB wrapper with granular key-per-note architecture
- **WXT** for the extension scaffold — handles manifest, hot reload, build
- **Tailwind CSS v4** for styling — utility-first with custom design tokens

If you're making a change that affects architecture, open an issue first to discuss the approach.

## What We're Looking For

Here are areas where contributions are especially welcome:

- **Bug fixes** — especially edge cases in the editor
- **Accessibility improvements** — keyboard navigation, screen reader support, ARIA labels
- **Performance** — anything that makes the new tab load faster
- **Test coverage** — more tests for existing features
- **Documentation** — improving these docs, adding code comments where needed

## What We're Not Looking For

To keep the project focused:

- Cloud sync or backend features (local-only by design)
- Light theme (dark-only for v1)
- AI/LLM integrations
- Features that add significant bundle size without clear user value

## Code of Conduct

Be respectful, be constructive, be kind. We're all here to build something useful.

## Questions?

Open an issue or start a discussion. We're happy to help you get oriented.
