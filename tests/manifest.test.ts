import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('WXT Manifest Configuration', () => {
  it('wxt.config.ts includes storage permission', () => {
    const config = readFileSync(resolve(__dirname, '../wxt.config.ts'), 'utf-8');
    expect(config).toContain("'storage'");
  });

  it('wxt.config.ts includes unlimitedStorage permission', () => {
    const config = readFileSync(resolve(__dirname, '../wxt.config.ts'), 'utf-8');
    expect(config).toContain("'unlimitedStorage'");
  });

  it('wxt.config.ts uses module-react', () => {
    const config = readFileSync(resolve(__dirname, '../wxt.config.ts'), 'utf-8');
    expect(config).toContain('@wxt-dev/module-react');
  });
});
