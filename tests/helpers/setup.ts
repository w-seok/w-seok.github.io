/**
 * @file Vitest 테스트 설정 파일
 * @description 테스트 환경 초기화 및 전역 설정
 */

import '@testing-library/svelte/vitest';
import { beforeEach } from 'vitest';

// localStorage mock
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		}
	};
})();

Object.defineProperty(globalThis, 'localStorage', {
	value: localStorageMock
});

// matchMedia mock
Object.defineProperty(globalThis, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false
	})
});

// 테스트 간 localStorage 초기화
beforeEach(() => {
	localStorage.clear();
});
