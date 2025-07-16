import { defineConfig } from 'vitest/config';
import viteConfig from './config/vite.config';

export default defineConfig({
  ...viteConfig({ mode: process.env.NODE_ENV || 'test' }),
}); 