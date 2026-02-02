/**
 * @file i18n 시스템 메인 모듈
 * @description Svelte store 기반 다국어 지원 시스템
 */

import { derived, writable } from 'svelte/store';
import en from './en.json';
import es from './es.json';
import ko from './ko.json';
import {
	DEFAULT_LOCALE,
	isValidLocale,
	type Locale,
	SUPPORTED_LOCALES,
	type Translation,
	type Translations
} from './types';

/**
 * 언어별 번역 데이터 맵
 */
const translations: Translations = { ko, en, es };

/**
 * localStorage 키
 */
const LOCALE_STORAGE_KEY = 'locale';

/**
 * 브라우저 환경 여부 확인
 * @returns 브라우저 환경이면 true
 */
function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * 브라우저 기본 언어에서 지원하는 Locale 추출
 * @returns 지원하는 Locale 또는 기본 Locale
 * @example
 * // navigator.language가 'ko-KR'이면 'ko' 반환
 * // navigator.language가 'fr-FR'이면 DEFAULT_LOCALE 반환
 */
function detectBrowserLocale(): Locale {
	if (!isBrowser()) {
		return DEFAULT_LOCALE;
	}

	const browserLang = navigator.language.split('-')[0];
	return isValidLocale(browserLang) ? browserLang : DEFAULT_LOCALE;
}

/**
 * 저장된 Locale 불러오기
 * @returns 저장된 Locale 또는 브라우저 감지 결과
 */
function getStoredLocale(): Locale {
	if (!isBrowser()) {
		return DEFAULT_LOCALE;
	}

	const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
	if (isValidLocale(stored)) {
		return stored;
	}

	return detectBrowserLocale();
}

/**
 * Locale 저장
 * @param locale - 저장할 Locale
 */
function saveLocale(locale: Locale): void {
	if (isBrowser()) {
		localStorage.setItem(LOCALE_STORAGE_KEY, locale);
	}
}

/**
 * HTML lang 속성 업데이트
 * @param locale - 설정할 Locale
 */
function updateHtmlLang(locale: Locale): void {
	if (isBrowser()) {
		document.documentElement.lang = locale;
	}
}

/**
 * 현재 Locale을 관리하는 writable store
 */
function createLocaleStore() {
	const initialLocale = getStoredLocale();
	const { subscribe, set } = writable<Locale>(initialLocale);

	return {
		subscribe,
		/**
		 * Locale 변경
		 * @param newLocale - 새로운 Locale
		 * @throws {Error} 지원하지 않는 Locale인 경우
		 */
		set: (newLocale: Locale) => {
			if (!isValidLocale(newLocale)) {
				throw new Error(
					`Unsupported locale: ${newLocale}. Supported: ${SUPPORTED_LOCALES.join(', ')}`
				);
			}
			saveLocale(newLocale);
			updateHtmlLang(newLocale);
			set(newLocale);
		},
		/**
		 * 다음 Locale로 순환
		 * @description ko → en → es → ko 순서로 변경
		 */
		cycle: () => {
			let currentLocale: Locale = DEFAULT_LOCALE;
			const unsubscribe = subscribe((value) => {
				currentLocale = value;
			});
			unsubscribe();

			const currentIndex = SUPPORTED_LOCALES.indexOf(currentLocale);
			const nextIndex = (currentIndex + 1) % SUPPORTED_LOCALES.length;
			const nextLocale = SUPPORTED_LOCALES[nextIndex];

			saveLocale(nextLocale);
			updateHtmlLang(nextLocale);
			set(nextLocale);
		}
	};
}

/**
 * 현재 Locale store
 * @example
 * import { locale } from '$i18n';
 * locale.set('en');
 * locale.cycle();
 */
export const locale = createLocaleStore();

/**
 * 현재 Locale에 해당하는 번역 데이터 store
 * @description locale이 변경되면 자동으로 업데이트됨
 * @example
 * import { t } from '$i18n';
 * // Svelte 컴포넌트에서: {$t.header.title}
 */
export const t = derived<typeof locale, Translation>(locale, ($locale) => translations[$locale]);

// Re-export types
export { DEFAULT_LOCALE, isValidLocale, SUPPORTED_LOCALES, type Locale, type Translation };
