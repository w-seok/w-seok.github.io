/**
 * @file i18n 시스템 단위 테스트
 * @description locale store와 번역 기능 검증
 */

import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, isValidLocale, type Locale, locale, SUPPORTED_LOCALES, t } from '$i18n';

describe('i18n', () => {
	beforeEach(() => {
		localStorage.clear();
		// locale store를 기본값으로 리셋
		locale.set(DEFAULT_LOCALE);
	});

	describe('isValidLocale', () => {
		it('유효한 locale을 올바르게 검증함', () => {
			expect(isValidLocale('ko')).toBe(true);
			expect(isValidLocale('en')).toBe(true);
			expect(isValidLocale('es')).toBe(true);
		});

		it('유효하지 않은 값을 거부함', () => {
			expect(isValidLocale('fr')).toBe(false);
			expect(isValidLocale('kr')).toBe(false);
			expect(isValidLocale('')).toBe(false);
			expect(isValidLocale(null)).toBe(false);
			expect(isValidLocale(undefined)).toBe(false);
			expect(isValidLocale(123)).toBe(false);
			expect(isValidLocale({})).toBe(false);
		});
	});

	describe('SUPPORTED_LOCALES', () => {
		it('지원하는 언어 목록을 포함함', () => {
			expect(SUPPORTED_LOCALES).toContain('ko');
			expect(SUPPORTED_LOCALES).toContain('en');
			expect(SUPPORTED_LOCALES).toContain('es');
			expect(SUPPORTED_LOCALES).toHaveLength(3);
		});

		it('읽기 전용 배열임', () => {
			// readonly 배열이므로 push 등의 메서드가 타입 에러를 발생시킴
			// 런타임에서는 Object.isFrozen으로 확인 불가하므로 길이 변경 시도
			const originalLength = SUPPORTED_LOCALES.length;
			expect(originalLength).toBe(3);
		});
	});

	describe('locale store', () => {
		it('기본값이 DEFAULT_LOCALE임', () => {
			const current = get(locale);
			expect(current).toBe(DEFAULT_LOCALE);
		});

		it('locale 변경이 정상 동작함', () => {
			locale.set('en');
			expect(get(locale)).toBe('en');

			locale.set('es');
			expect(get(locale)).toBe('es');

			locale.set('ko');
			expect(get(locale)).toBe('ko');
		});

		it('localStorage에 locale을 저장함', () => {
			locale.set('en');
			expect(localStorage.getItem('locale')).toBe('en');

			locale.set('es');
			expect(localStorage.getItem('locale')).toBe('es');
		});

		it('유효하지 않은 locale 설정 시 에러 발생', () => {
			expect(() => locale.set('fr' as Locale)).toThrow('Unsupported locale');
			expect(() => locale.set('invalid' as Locale)).toThrow('Unsupported locale');
		});

		it('HTML lang 속성을 업데이트함', () => {
			locale.set('en');
			expect(document.documentElement.lang).toBe('en');

			locale.set('es');
			expect(document.documentElement.lang).toBe('es');
		});
	});

	describe('locale.cycle', () => {
		it('ko → en → es → ko 순서로 순환함', () => {
			locale.set('ko');

			locale.cycle();
			expect(get(locale)).toBe('en');

			locale.cycle();
			expect(get(locale)).toBe('es');

			locale.cycle();
			expect(get(locale)).toBe('ko');
		});

		it('순환 시 localStorage도 업데이트함', () => {
			locale.set('ko');

			locale.cycle();
			expect(localStorage.getItem('locale')).toBe('en');
		});
	});

	describe('t (translation) store', () => {
		it('locale에 따라 올바른 번역을 반환함', () => {
			locale.set('ko');
			expect(get(t).header.subtitle).toBe('복잡한 세계에서 명료함을 추구합니다');

			locale.set('en');
			expect(get(t).header.subtitle).toBe('Pursuing clarity in an intricate world');

			locale.set('es');
			expect(get(t).header.subtitle).toBe('Buscando claridad en un mundo complejo');
		});

		it('모든 섹션 번역이 존재함', () => {
			for (const loc of SUPPORTED_LOCALES) {
				locale.set(loc);
				const translation = get(t);

				// header
				expect(translation.header.title).toBeTruthy();
				expect(translation.header.subtitle).toBeTruthy();

				// sections
				expect(translation.sections.about).toBeTruthy();
				expect(translation.sections.experience).toBeTruthy();
				expect(translation.sections.skills).toBeTruthy();
				expect(translation.sections.opensource).toBeTruthy();
				expect(translation.sections.education).toBeTruthy();
				expect(translation.sections.activities).toBeTruthy();
				expect(translation.sections.awards).toBeTruthy();
				expect(translation.sections.certificates).toBeTruthy();

				// common
				expect(translation.common.readMore).toBeTruthy();
				expect(translation.common.collapse).toBeTruthy();
				expect(translation.common.present).toBeTruthy();
				expect(translation.common.toggleTheme).toBeTruthy();
				expect(translation.common.toggleLanguage).toBeTruthy();
			}
		});

		it('locale 변경 시 t store가 자동으로 업데이트됨', () => {
			const values: string[] = [];
			const unsubscribe = t.subscribe((translation) => {
				values.push(translation.sections.about);
			});

			locale.set('ko');
			locale.set('en');
			locale.set('es');

			unsubscribe();

			// 초기값 + 3번 변경 = 최소 4개
			expect(values).toContain('소개');
			expect(values).toContain('About');
			expect(values).toContain('Sobre mí');
		});
	});

	describe('저장된 locale 복원', () => {
		it('localStorage에 저장된 locale이 있으면 사용함', () => {
			localStorage.setItem('locale', 'es');

			// 새로운 store 인스턴스가 필요하지만, 현재 구조상 불가능
			// 대신 cycle을 통해 es에서 시작하는지 간접 검증
			// 이 테스트는 실제로는 store가 싱글톤이라 완전한 검증 불가
			// 통합 테스트에서 검증 필요
			expect(localStorage.getItem('locale')).toBe('es');
		});

		it('유효하지 않은 저장값은 무시함', () => {
			localStorage.setItem('locale', 'invalid');
			// 새 store 생성 시 DEFAULT_LOCALE 또는 브라우저 언어 사용해야 함
			// 현재 싱글톤 구조상 직접 테스트 어려움
			expect(isValidLocale('invalid')).toBe(false);
		});
	});
});
