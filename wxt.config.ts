import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'NewTab',
    description: 'Notion-level productivity in every new tab',
    permissions: ['storage', 'unlimitedStorage'],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
