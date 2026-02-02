/**
 * @file i18n 타입 정의
 * @description 다국어 번역 시스템을 위한 TypeScript 타입
 */

/**
 * 지원하는 언어 코드
 * @description 한국어, 영어, 스페인어 지원
 */
export type Locale = 'ko' | 'en' | 'es';

/**
 * 헤더 섹션 번역
 * @property greeting - 인사말
 * @property title - 직함/타이틀
 * @property subtitle - 부제목/슬로건
 */
export interface HeaderTranslation {
	greeting: string;
	title: string;
	subtitle: string;
}

/**
 * 섹션 이름 번역
 * @property about - 소개 섹션
 * @property experience - 경력 섹션
 * @property skills - 기술 스택 섹션
 * @property projects - 프로젝트 섹션
 * @property education - 학력 섹션
 * @property activities - 활동 섹션
 */
export interface SectionTranslation {
	about: string;
	experience: string;
	skills: string;
	projects: string;
	education: string;
	activities: string;
}

/**
 * 공통 UI 텍스트 번역
 * @property readMore - 더보기 버튼
 * @property collapse - 접기 버튼
 * @property present - 현재 (재직 중)
 * @property toggleTheme - 테마 전환 버튼
 * @property toggleLanguage - 언어 전환 버튼
 */
export interface CommonTranslation {
	readMore: string;
	collapse: string;
	present: string;
	toggleTheme: string;
	toggleLanguage: string;
}

/**
 * 전체 번역 구조
 * @property header - 헤더 섹션 번역
 * @property sections - 섹션 이름 번역
 * @property common - 공통 UI 텍스트 번역
 */
export interface Translation {
	header: HeaderTranslation;
	sections: SectionTranslation;
	common: CommonTranslation;
}

/**
 * 언어별 번역 맵
 * @description 모든 지원 언어에 대한 번역 데이터
 */
export type Translations = Record<Locale, Translation>;

/**
 * 기본 언어 설정
 * @description 브라우저 언어 감지 실패 시 사용
 */
export const DEFAULT_LOCALE: Locale = 'ko';

/**
 * 지원하는 언어 목록
 * @description 언어 선택 UI에서 사용
 */
export const SUPPORTED_LOCALES: readonly Locale[] = ['ko', 'en', 'es'] as const;

/**
 * 주어진 값이 유효한 Locale인지 확인
 * @param value - 검사할 값
 * @returns Locale 타입 여부
 */
export function isValidLocale(value: unknown): value is Locale {
	return typeof value === 'string' && SUPPORTED_LOCALES.includes(value as Locale);
}
