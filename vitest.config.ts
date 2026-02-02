/**
 * @file Vitest 설정 파일
 * @description 단위 테스트를 위한 Vitest 설정. 90% 이상 커버리지 필수.
 */

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		include: ['tests/unit/**/*.test.ts'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['tests/helpers/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			include: ['src/lib/**/*.ts'],
			exclude: ['**/*.d.ts', '**/*.test.ts', '**/index.ts'],
			thresholds: {
				statements: 90,
				branches: 90,
				functions: 90,
				lines: 90
			}
		}
	},
	resolve: {
		alias: {
			$lib: '/src/lib',
			$stores: '/src/lib/stores',
			$i18n: '/src/lib/i18n',
			$utils: '/src/lib/utils'
		}
	}
});
