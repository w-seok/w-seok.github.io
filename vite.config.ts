/**
 * @file Vite 설정 파일
 * @description SvelteKit 프로젝트를 위한 Vite 빌드 설정
 */

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5173,
		strictPort: false
	},
	preview: {
		port: 4173,
		strictPort: false
	}
});
