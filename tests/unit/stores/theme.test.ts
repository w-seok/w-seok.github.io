/**
 * @file 테마 store 단위 테스트
 */

import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	DEFAULT_THEME,
	getSystemTheme,
	isValidTheme,
	SUPPORTED_THEMES,
	type Theme,
	theme
} from '$stores/theme';

describe('theme store', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.classList.remove('light', 'dark');
		theme.set(DEFAULT_THEME);
	});

	describe('isValidTheme', () => {
		it('유효한 테마를 올바르게 검증함', () => {
			expect(isValidTheme('light')).toBe(true);
			expect(isValidTheme('dark')).toBe(true);
		});

		it('유효하지 않은 값을 거부함', () => {
			expect(isValidTheme('system')).toBe(false);
			expect(isValidTheme('blue')).toBe(false);
			expect(isValidTheme('auto')).toBe(false);
			expect(isValidTheme('')).toBe(false);
			expect(isValidTheme(null)).toBe(false);
			expect(isValidTheme(undefined)).toBe(false);
			expect(isValidTheme(123)).toBe(false);
			expect(isValidTheme({})).toBe(false);
		});
	});

	describe('SUPPORTED_THEMES', () => {
		it('지원하는 테마 목록을 포함함', () => {
			expect(SUPPORTED_THEMES).toContain('light');
			expect(SUPPORTED_THEMES).toContain('dark');
			expect(SUPPORTED_THEMES).toHaveLength(2);
		});
	});

	describe('getSystemTheme', () => {
		it('기본값으로 light를 반환함 (matchMedia mock이 false)', () => {
			expect(getSystemTheme()).toBe('light');
		});

		it('다크 모드 감지 시 dark 반환', () => {
			const originalMatchMedia = window.matchMedia;
			Object.defineProperty(window, 'matchMedia', {
				writable: true,
				value: (query: string) => ({
					matches: query === '(prefers-color-scheme: dark)',
					media: query,
					onchange: null,
					addListener: () => {},
					removeListener: () => {},
					addEventListener: () => {},
					removeEventListener: () => {},
					dispatchEvent: () => false
				})
			});

			expect(getSystemTheme()).toBe('dark');

			Object.defineProperty(window, 'matchMedia', {
				writable: true,
				value: originalMatchMedia
			});
		});
	});

	describe('theme store 기본 동작', () => {
		it('기본값이 light임', () => {
			expect(get(theme)).toBe('light');
		});

		it('테마 변경이 정상 동작함', () => {
			theme.set('dark');
			expect(get(theme)).toBe('dark');

			theme.set('light');
			expect(get(theme)).toBe('light');
		});

		it('localStorage에 테마를 저장함', () => {
			theme.set('dark');
			expect(localStorage.getItem('theme')).toBe('dark');

			theme.set('light');
			expect(localStorage.getItem('theme')).toBe('light');
		});

		it('유효하지 않은 테마 설정 시 에러 발생', () => {
			expect(() => theme.set('blue' as Theme)).toThrow('Unsupported theme');
			expect(() => theme.set('invalid' as Theme)).toThrow('Unsupported theme');
		});
	});

	describe('DOM 클래스 적용', () => {
		it('light 테마 시 light 클래스 적용', () => {
			theme.set('light');
			expect(document.documentElement.classList.contains('light')).toBe(true);
			expect(document.documentElement.classList.contains('dark')).toBe(false);
		});

		it('dark 테마 시 dark 클래스 적용', () => {
			theme.set('dark');
			expect(document.documentElement.classList.contains('dark')).toBe(true);
			expect(document.documentElement.classList.contains('light')).toBe(false);
		});

		it('테마 변경 시 이전 클래스 제거됨', () => {
			theme.set('dark');
			expect(document.documentElement.classList.contains('dark')).toBe(true);

			theme.set('light');
			expect(document.documentElement.classList.contains('dark')).toBe(false);
			expect(document.documentElement.classList.contains('light')).toBe(true);
		});
	});

	describe('theme.toggle', () => {
		it('light ↔ dark 토글됨', () => {
			theme.set('light');

			theme.toggle();
			expect(get(theme)).toBe('dark');

			theme.toggle();
			expect(get(theme)).toBe('light');
		});

		it('토글 시 localStorage도 업데이트함', () => {
			theme.set('light');

			theme.toggle();
			expect(localStorage.getItem('theme')).toBe('dark');

			theme.toggle();
			expect(localStorage.getItem('theme')).toBe('light');
		});

		it('토글 시 DOM 클래스도 업데이트함', () => {
			theme.set('light');

			theme.toggle();
			expect(document.documentElement.classList.contains('dark')).toBe(true);

			theme.toggle();
			expect(document.documentElement.classList.contains('light')).toBe(true);
		});
	});

	describe('저장된 테마 복원', () => {
		it('localStorage에 저장된 테마 값 확인', () => {
			localStorage.setItem('theme', 'dark');
			expect(localStorage.getItem('theme')).toBe('dark');
		});

		it('유효하지 않은 저장값 검증', () => {
			localStorage.setItem('theme', 'invalid');
			expect(isValidTheme(localStorage.getItem('theme'))).toBe(false);
		});
	});

	describe('시스템 테마 감지', () => {
		it('저장된 값이 없으면 시스템 테마를 사용함', async () => {
			localStorage.clear();

			vi.resetModules();
			const { getSystemTheme: getSysTheme } = await import('$stores/theme');

			// matchMedia mock이 false를 반환하므로 light
			expect(getSysTheme()).toBe('light');

			vi.resetModules();
		});

		it('시스템이 다크모드면 dark를 기본값으로 사용', async () => {
			localStorage.clear();

			const originalMatchMedia = window.matchMedia;
			Object.defineProperty(window, 'matchMedia', {
				writable: true,
				value: (query: string) => ({
					matches: query === '(prefers-color-scheme: dark)',
					media: query,
					onchange: null,
					addListener: () => {},
					removeListener: () => {},
					addEventListener: () => {},
					removeEventListener: () => {},
					dispatchEvent: () => false
				})
			});

			vi.resetModules();
			const { theme: newTheme } = await import('$stores/theme');

			expect(get(newTheme)).toBe('dark');

			Object.defineProperty(window, 'matchMedia', {
				writable: true,
				value: originalMatchMedia
			});
			vi.resetModules();
		});
	});

	describe('SSR 환경 (비브라우저)', () => {
		it('getSystemTheme은 window가 없을 때 light 반환', async () => {
			const originalWindow = globalThis.window;

			// @ts-expect-error 테스트용 타입 무시
			delete globalThis.window;

			vi.resetModules();
			const { getSystemTheme: getSystemThemeSSR } = await import('$stores/theme');

			expect(getSystemThemeSSR()).toBe('light');

			globalThis.window = originalWindow;
			vi.resetModules();
		});

		it('비브라우저 환경에서 localStorage 없이도 안전하게 동작', async () => {
			const originalWindow = globalThis.window;
			const originalLocalStorage = globalThis.localStorage;

			// @ts-expect-error 테스트용 타입 무시
			delete globalThis.localStorage;

			vi.resetModules();
			const { getSystemTheme: getSystemThemeNoLS } = await import('$stores/theme');

			expect(getSystemThemeNoLS()).toBe('light');

			globalThis.localStorage = originalLocalStorage;
			globalThis.window = originalWindow;
			vi.resetModules();
		});

		it('SSR 환경에서 theme store가 에러 없이 생성됨', async () => {
			const originalWindow = globalThis.window;
			const originalLocalStorage = globalThis.localStorage;
			const originalDocument = globalThis.document;

			// @ts-expect-error 테스트용 타입 무시
			delete globalThis.window;
			// @ts-expect-error 테스트용 타입 무시
			delete globalThis.localStorage;
			// @ts-expect-error 테스트용 타입 무시
			delete globalThis.document;

			vi.resetModules();

			const themeModule = await import('$stores/theme');
			expect(themeModule.DEFAULT_THEME).toBe('light');
			expect(themeModule.SUPPORTED_THEMES).toContain('dark');

			globalThis.window = originalWindow;
			globalThis.localStorage = originalLocalStorage;
			globalThis.document = originalDocument;
			vi.resetModules();
		});
	});
});
