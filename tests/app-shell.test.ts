import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('App Shell Structure', () => {
  it('AppShell component file exists', () => {
    expect(existsSync(resolve(__dirname, '../components/layout/AppShell.tsx'))).toBe(true);
  });

  it('Sidebar component file exists and uses dynamic width', () => {
    const content = readFileSync(resolve(__dirname, '../components/layout/Sidebar.tsx'), 'utf-8');
    expect(content).toContain('sidebarWidth');
  });

  it('MainContent renders empty state with correct copy', () => {
    const content = readFileSync(resolve(__dirname, '../components/layout/MainContent.tsx'), 'utf-8');
    expect(content).toContain('Start writing');
    expect(content).toContain('Create your first page to begin');
  });

  it('MainContent does not use autoFocus', () => {
    const content = readFileSync(resolve(__dirname, '../components/layout/MainContent.tsx'), 'utf-8');
    expect(content).not.toContain('autoFocus');
  });

  it('MainContent constrains content width to 720px', () => {
    const content = readFileSync(resolve(__dirname, '../components/layout/MainContent.tsx'), 'utf-8');
    expect(content).toContain('720');
  });

  it('SidebarToggle has accessible aria-label', () => {
    const content = readFileSync(resolve(__dirname, '../components/layout/SidebarToggle.tsx'), 'utf-8');
    expect(content).toContain('aria-label');
  });

  it('App.tsx wraps with ErrorBoundary', () => {
    const content = readFileSync(resolve(__dirname, '../entrypoints/newtab/App.tsx'), 'utf-8');
    expect(content).toContain('ErrorBoundary');
  });
});
