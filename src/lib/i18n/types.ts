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
 * @property summary - Hero 핵심 요약 (현재 역할·연차·주요 영역)
 * @property photoAlt - 프로필 사진 대체 텍스트
 * @property subtitle - 부제목/슬로건
 */
export interface HeaderTranslation {
	greeting: string;
	title: string;
	summary: string;
	photoAlt: string;
	subtitle: string;
}

/**
 * 섹션 이름 번역
 * @property about - 소개 섹션
 * @property experience - 경력 섹션
 * @property skills - 기술 스택 섹션
 * @property opensource - 오픈소스 섹션
 * @property education - 학력 섹션
 * @property activities - 활동 섹션
 * @property awards - 수상 섹션
 * @property certificates - 자격증 섹션
 */
export interface SectionTranslation {
	about: string;
	experience: string;
	skills: string;
	opensource: string;
	education: string;
	activities: string;
	awards: string;
	certificates: string;
}

/**
 * 공통 UI 텍스트 번역
 * @property readMore - 더보기 버튼
 * @property collapse - 접기 버튼
 * @property present - 현재 (재직 중)
 * @property toggleTheme - 테마 전환 버튼
 * @property toggleLanguage - 언어 전환 버튼
 * @property tableOfContents - 섹션 목차 내비게이션 이름
 */
export interface CommonTranslation {
	readMore: string;
	collapse: string;
	present: string;
	toggleTheme: string;
	toggleLanguage: string;
	tableOfContents: string;
}

/**
 * 소개 섹션 데이터
 * @property summary - 핵심 요약 (3-4줄)
 * @property highlights - 핵심 강점 리스트
 */
export interface AboutData {
	summary: string;
	highlights: string[];
}

/**
 * 경력 업무 성과 항목
 * @property title - 성과 제목
 * @property details - 세부 내용
 */
export interface AchievementItem {
	title: string;
	details: string[];
}

/**
 * 경력 항목
 * @property company - 회사명
 * @property position - 직책
 * @property period - 근무 기간
 * @property description - 회사/팀 설명
 * @property stack - 해당 회사에서 실제 사용한 기술 목록 (선택)
 * @property achievements - 성과 목록
 */
export interface ExperienceItem {
	company: string;
	position: string;
	period: string;
	description: string;
	stack?: string[];
	achievements: AchievementItem[];
}

/**
 * 스킬 항목
 * @property name - 기술명
 * @property context - 사용 맥락 (선택)
 */
export interface SkillItem {
	name: string;
	context?: string;
}

/**
 * 스킬 카테고리
 * @property category - 카테고리명
 * @property items - 스킬 목록
 */
export interface SkillCategory {
	category: string;
	items: SkillItem[];
}

/**
 * 오픈소스 프로젝트 항목
 * @property name - 프로젝트명
 * @property period - 기간
 * @property description - 프로젝트 설명
 * @property contributions - 기여 내용
 * @property links - 관련 링크
 */
export interface OpensourceItem {
	name: string;
	period: string;
	description: string;
	contributions: string[];
	links: { label: string; url: string }[];
}

/**
 * 활동 항목
 * @property name - 활동명
 * @property organization - 소속/주최
 * @property period - 기간
 * @property description - 설명
 * @property highlights - 주요 활동
 */
export interface ActivityItem {
	name: string;
	organization: string;
	period: string;
	description: string;
	highlights: string[];
}

/**
 * 수상 항목
 * @property name - 수상명
 * @property organization - 수여기관
 * @property result - 수상결과
 * @property date - 수상일
 * @property link - 관련 링크 (선택)
 */
export interface AwardItem {
	name: string;
	organization: string;
	result: string;
	date: string;
	link?: string;
}

/**
 * 자격증 항목
 * @property name - 자격증명
 * @property issuer - 발행처
 * @property date - 취득일
 * @property credentialId - 등록번호 (선택)
 */
export interface CertificateItem {
	name: string;
	issuer: string;
	date: string;
	credentialId?: string;
}

/**
 * 학력 항목
 * @property institution - 학교명
 * @property degree - 학위
 * @property major - 전공
 * @property period - 기간
 * @property gpa - 학점 (선택)
 * @property courses - 주요 이수 과목 (선택)
 */
export interface EducationItem {
	institution: string;
	degree: string;
	major: string;
	period: string;
	gpa?: string;
	courses?: string[];
}

/**
 * 이력서 데이터
 * @property about - 소개 섹션
 * @property experience - 경력 섹션
 * @property skills - 기술 스택 섹션
 * @property opensource - 오픈소스 섹션
 * @property activities - 활동 섹션
 * @property awards - 수상 섹션
 * @property certificates - 자격증 섹션
 * @property education - 학력 섹션
 */
export interface ResumeData {
	about: AboutData;
	experience: ExperienceItem[];
	skills: SkillCategory[];
	opensource: OpensourceItem[];
	activities: ActivityItem[];
	awards: AwardItem[];
	certificates: CertificateItem[];
	education: EducationItem[];
}

/**
 * 전체 번역 구조
 * @property header - 헤더 섹션 번역
 * @property sections - 섹션 이름 번역
 * @property common - 공통 UI 텍스트 번역
 * @property resume - 이력서 데이터
 */
export interface Translation {
	header: HeaderTranslation;
	sections: SectionTranslation;
	common: CommonTranslation;
	resume: ResumeData;
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
