/**
 * @file SvelteKit 설정 파일
 * @description 정적 사이트 생성을 위한 adapter-static 사용
 */

import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		alias: {
			$lib: './src/lib',
			$components: './src/lib/components',
			$stores: './src/lib/stores',
			$i18n: './src/lib/i18n',
			$utils: './src/lib/utils'
		}
	}
};

export default config;
