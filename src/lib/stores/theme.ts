/**
 * @file 테마 관리 store
 */

import { writable } from 'svelte/store';

/**
 * 지원하는 테마 타입
 */
export type Theme = 'light' | 'dark';

/**
 * 지원하는 테마 목록
 */
export const SUPPORTED_THEMES: readonly Theme[] = ['light', 'dark'] as const;

/**
 * 기본 테마
 */
export const DEFAULT_THEME: Theme = 'light';

const THEME_STORAGE_KEY = 'theme';

/**
 * 브라우저 환경 여부 확인
 * @returns 브라우저 환경이면 true
 */
function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * 주어진 값이 유효한 Theme인지 확인
 * @param value - 검사할 값
 * @returns Theme 타입 여부
 */
export function isValidTheme(value: unknown): value is Theme {
	return typeof value === 'string' && SUPPORTED_THEMES.includes(value as Theme);
}

/**
 * 시스템 테마 감지 (prefers-color-scheme)
 * @returns 시스템 설정 기반 'dark' 또는 'light'
 */
export function getSystemTheme(): Theme {
	if (!isBrowser()) {
		return DEFAULT_THEME;
	}
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 저장된 테마 불러오기
 * @returns 저장된 테마 또는 시스템 테마
 */
function getStoredTheme(): Theme {
	if (!isBrowser()) {
		return DEFAULT_THEME;
	}

	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	if (isValidTheme(stored)) {
		return stored;
	}

	// 저장된 값이 없으면 시스템 설정 따르기
	return getSystemTheme();
}

/**
 * 테마 저장
 * @param theme - 저장할 테마
 */
function saveTheme(theme: Theme): void {
	if (isBrowser()) {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	}
}

/**
 * DOM에 테마 클래스 적용
 * @param theme - 적용할 테마
 */
function applyThemeClass(theme: Theme): void {
	if (!isBrowser()) {
		return;
	}

	const root = document.documentElement;
	root.classList.remove('light', 'dark');
	root.classList.add(theme);
}

/**
 * 테마 store 생성
 * @returns 테마 관리 store
 */
function createThemeStore() {
	const initialTheme = getStoredTheme();
	const { subscribe, set: internalSet } = writable<Theme>(initialTheme);

	if (isBrowser()) {
		applyThemeClass(initialTheme);
	}

	return {
		subscribe,
		/**
		 * 테마 변경
		 * @param newTheme - 새로운 테마
		 * @throws {Error} 지원하지 않는 테마인 경우
		 */
		set: (newTheme: Theme) => {
			if (!isValidTheme(newTheme)) {
				throw new Error(
					`Unsupported theme: ${newTheme}. Supported: ${SUPPORTED_THEMES.join(', ')}`
				);
			}

			saveTheme(newTheme);
			applyThemeClass(newTheme);
			internalSet(newTheme);
		},
		/**
		 * 테마 토글 (light ↔ dark)
		 */
		toggle: () => {
			let currentTheme: Theme = DEFAULT_THEME;
			const unsubscribe = subscribe((value) => {
				currentTheme = value;
			});
			unsubscribe();

			const nextTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';

			saveTheme(nextTheme);
			applyThemeClass(nextTheme);
			internalSet(nextTheme);
		}
	};
}

/**
 * 현재 테마 store
 */
export const theme = createThemeStore();
