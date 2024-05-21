import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Set site to the URL environment variable. This will be set to the
// current deploy domain by the netlify build agent running the build job.
export default defineConfig({
  site: import.meta.env.URL || 'http://localhost:3000',
  base: '/qscore/',
  integrations: [react()],
  devToolbar: {
    enabled: false
  }
});
