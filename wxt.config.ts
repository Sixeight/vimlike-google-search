import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Vim-like Google Search Navigator',
    description:
      'Navigate Google search results efficiently with Vim-like keyboard shortcuts',
    version: '1.0.0',
    permissions: [],
    icons: {
      16: 'icon/16.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
  },
});
