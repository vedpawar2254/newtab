import { describe, test, expect } from 'vitest';
import { slashItems } from '../../lib/editor/slash-items';

describe('Slash command items', () => {
  test('slashItems contains all required categories', () => {
    const categories = [...new Set(slashItems.map((item) => item.category))];

    expect(categories).toContain('Text');
    expect(categories).toContain('Lists');
    expect(categories).toContain('Media');
    expect(categories).toContain('Advanced');
  });

  test('slashItems contains required block types', () => {
    const titles = slashItems.map((item) => item.title);

    expect(titles).toContain('Paragraph');
    expect(titles).toContain('Heading 1');
    expect(titles).toContain('Bullet List');
    expect(titles).toContain('Code Block');
    expect(titles).toContain('Table');
    expect(titles).toContain('Image');
    expect(titles).toContain('Blockquote');
    expect(titles).toContain('Horizontal Rule');
  });

  test('filtering items by query works', () => {
    const query = 'head';
    const filtered = slashItems.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()),
    );

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((item) => item.title.toLowerCase().includes('head'))).toBe(
      true,
    );
  });

  test('each item has a command function', () => {
    for (const item of slashItems) {
      expect(typeof item.command).toBe('function');
    }
  });

  test('each item has an icon string', () => {
    for (const item of slashItems) {
      expect(typeof item.icon).toBe('string');
      expect(item.icon.length).toBeGreaterThan(0);
    }
  });

  test('each item has a non-empty title', () => {
    for (const item of slashItems) {
      expect(typeof item.title).toBe('string');
      expect(item.title.length).toBeGreaterThan(0);
    }
  });
});
