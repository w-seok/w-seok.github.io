/**
 * @file 로케일 구조 일치 테스트
 * @description ko/en/es 번역 파일이 동일한 키 구조와 배열 길이를 갖는지 검증한다.
 *   다국어 3파일을 동시에 수정할 때 발생하는 동기화 누락(키 누락, 배열 길이 불일치)을
 *   조기에 감지하기 위한 안전망이다. 번역 문자열 값 자체는 비교하지 않는다.
 */

import { describe, expect, it } from 'vitest';
import en from '$i18n/en.json';
import es from '$i18n/es.json';
import ko from '$i18n/ko.json';
import type { Translation } from '$i18n/types';

const koData = ko as Translation;
const enData = en as Translation;
const esData = es as Translation;

/**
 * JSON 값에서 구조 시그니처를 추출한다.
 * @description 객체는 정렬된 키 집합과 각 값의 시그니처를, 배열은 길이와 각 요소의
 *   시그니처를 포함한다. 원시값은 타입명만 사용하므로, 번역된 텍스트 내용 차이는
 *   무시하고 키 구조와 배열 길이만 비교된다.
 * @param value - 시그니처를 추출할 JSON 값
 * @returns 구조를 나타내는 결정적(deterministic) 문자열
 * @example
 * structureSignature({ a: ['x', 'y'] }) // '{a:[2:string|string]}'
 */
function structureSignature(value: unknown): string {
	if (Array.isArray(value)) {
		return `[${value.length}:${value.map(structureSignature).join('|')}]`;
	}
	if (value !== null && typeof value === 'object') {
		const obj = value as Record<string, unknown>;
		const keys = Object.keys(obj).sort();
		return `{${keys.map((key) => `${key}:${structureSignature(obj[key])}`).join(',')}}`;
	}
	return typeof value;
}

/**
 * resume 데이터의 모든 배열 길이를 경로별로 수집한다.
 * @description 길이 불일치 발생 시 toEqual 비교가 사람이 읽기 쉬운 차이를 보여주도록
 *   중첩 배열 길이를 평탄한 객체로 추출한다.
 * @param t - 번역 데이터
 * @returns 배열 경로별 길이 맵
 */
function arrayLengths(t: Translation) {
	const { resume } = t;
	return {
		experience: resume.experience.length,
		achievementsPerExperience: resume.experience.map((exp) => exp.achievements.length),
		detailsPerAchievement: resume.experience.flatMap((exp) =>
			exp.achievements.map((ach) => ach.details.length)
		),
		skills: resume.skills.length,
		itemsPerSkill: resume.skills.map((cat) => cat.items.length),
		opensource: resume.opensource.length,
		contributionsPerProject: resume.opensource.map((proj) => proj.contributions.length),
		linksPerProject: resume.opensource.map((proj) => proj.links.length),
		activities: resume.activities.length,
		highlightsPerActivity: resume.activities.map((act) => act.highlights.length),
		awards: resume.awards.length,
		certificates: resume.certificates.length,
		education: resume.education.length
	};
}

describe('로케일 구조 일치', () => {
	it('en과 es가 ko와 동일한 전체 키 구조 및 배열 길이를 가짐', () => {
		const koSignature = structureSignature(koData);

		expect(structureSignature(enData)).toBe(koSignature);
		expect(structureSignature(esData)).toBe(koSignature);
	});

	it('resume 하위 배열 길이가 로케일 간 정확히 일치함', () => {
		const koLengths = arrayLengths(koData);

		expect(arrayLengths(enData)).toEqual(koLengths);
		expect(arrayLengths(esData)).toEqual(koLengths);
	});

	it('소개글이 백엔드 문제 해결 방식과 대표 성과를 설명함', () => {
		expect(koData.resume.about.summary.split('\n\n')).toHaveLength(4);
		expect(koData.resume.about.summary.split('\n\n')[0]).toBe(
			'안녕하세요. AI 이미지 생성, 핀테크, 공간 AI SaaS 분야에서 서비스를 개발해 온 4년 차 Backend Engineer 신원석입니다. 요구사항과 데이터 흐름이 서비스마다 달라 대량 요청 처리, DBMS 제약을 고려한 마이그레이션, 멀티 리전 데이터 동기화 등 다양한 기술 과제를 해결해 왔습니다.'
		);
		expect(koData.resume.about.summary).toContain('AI 이미지 생성');
		expect(koData.resume.about.summary).toContain('핀테크');
		expect(koData.resume.about.summary).toContain('공간 AI SaaS');
		expect(koData.resume.about.summary).toContain('요구사항과 데이터 흐름이 서비스마다 달라');
		expect(koData.resume.about.summary).toContain('대량 요청 처리');
		expect(koData.resume.about.summary).toContain('DBMS 제약을 고려한 마이그레이션');
		expect(koData.resume.about.summary).toContain('멀티 리전 데이터 동기화');
		expect(koData.resume.about.summary).toContain('다양한 기술 과제를 해결해 왔습니다');
		expect(koData.resume.about.summary).toContain('4년 차 Backend Engineer 신원석');
		expect(koData.resume.about.summary).toContain('Cupix');
		expect(koData.resume.about.summary).toContain('Java/Spring');
		expect(koData.resume.about.summary).toContain('Tibero DBMS');
		expect(koData.resume.about.summary).toContain('Flyway');
		expect(koData.resume.about.summary).toContain('반복 가능한 개발·검증 흐름');
		expect(koData.resume.about.summary).toContain('건설 현장의 영상 데이터와');
		expect(koData.resume.about.summary).toContain('건축 설계 정보가 담긴 BIM 파일');
		expect(koData.resume.about.summary).not.toContain('건축 설계 정보를 담은 BIM 파일');
		expect(koData.resume.about.summary).toContain('BIM 파일');
		expect(koData.resume.about.summary).toContain('공정률');
		expect(koData.resume.about.summary).toContain('백엔드 구조');
		expect(koData.resume.about.summary).toContain('설계·개선하고 있습니다');
		expect(koData.resume.about.summary).toContain('6개 이상 리전에서');
		expect(koData.resume.about.summary).toContain('일관되게 반영');
		expect(koData.resume.about.summary).toContain(
			'월 100만 건 이상의 AI 이미지 생성 요청을 처리하는 시스템'
		);
		expect(koData.resume.about.summary).toContain('2천만 건 이상');
		expect(koData.resume.about.summary).toContain('1억 건 이상');
		expect(koData.resume.about.summary).toContain('스냅샷·이벤트');
		expect(koData.resume.about.summary).toContain('여러 시스템이 맞물린 문제일수록');
		expect(koData.resume.about.summary).toContain('빠른 수정만으로는 같은 문제가 반복');
		expect(koData.resume.about.summary).toContain('원인을 끝까지 확인');
		expect(koData.resume.about.summary).toContain('팀이 실행할 수 있는 개선');
		expect(koData.resume.about.summary).toContain('백엔드 개발자로 일하고자 합니다');
		expect(koData.resume.about.summary).not.toContain('100만+');
		expect(koData.resume.about.summary).not.toContain('월 100만건 이상 요청 처리');
		expect(koData.resume.about.summary).not.toContain('2천만건 이상');
		expect(koData.resume.about.summary).not.toContain('1억건 이상');
		expect(koData.resume.about.summary).not.toContain('2천만+');
		expect(koData.resume.about.summary).not.toContain('1억+');
		expect(koData.resume.about.summary).not.toContain('서로 다른 도메인의 데이터 처리 흐름');
		expect(koData.resume.about.summary).not.toContain(
			'AI 이미지 생성 서비스, Tibero 기반 마이그레이션 자동화, 공간 AI SaaS'
		);
		expect(koData.resume.about.summary).not.toContain('요구사항을 바로 구현하기보다');
		expect(koData.resume.about.summary).not.toContain('문제가 생긴 맥락');
		expect(koData.resume.about.summary).not.toContain('데이터가 흐르는 과정');
		expect(koData.resume.about.summary).not.toContain('문제의 본질과 전체 흐름');
		expect(koData.resume.about.summary).not.toContain('이해하려고 하는');
		expect(koData.resume.about.summary).not.toContain('4년간 개발하며 배운 것이 있습니다');
		expect(koData.resume.about.summary).not.toContain('배웠습니다');
		expect(koData.resume.about.summary).not.toContain('느꼈습니다');
		expect(koData.resume.about.summary).not.toContain('지난 4년 동안 제가 맡은 문제');
		expect(koData.resume.about.summary).not.toContain(
			'요청이 들어오고 처리되며 저장·반영되는 과정'
		);
		expect(koData.resume.about.summary).not.toContain('근거를 모아 차분하게 공유');
		expect(koData.resume.about.summary).not.toContain('다시 같은 문제를 겪지 않는 구조');
		expect(koData.resume.about.summary).not.toContain('AI가 만든 결과');
		expect(koData.resume.about.summary).not.toContain(
			'API, 비동기 처리, 백그라운드 작업을 중심으로'
		);
		expect(koData.resume.about.summary).not.toContain('스냅샷 및 이벤트');
		expect(koData.resume.about.summary).not.toContain('Ruby on Rails');
		expect(koData.resume.about.summary).not.toContain('NestJS');
		expect(koData.resume.about.summary).not.toContain('Sidekiq');
		expect(koData.resume.about.summary).not.toContain('SQS');
		expect(koData.resume.about.summary).not.toContain('Kinesis');
		expect(koData.resume.about.summary).not.toContain('Firehose');
		expect(koData.resume.about.summary).not.toContain('로컬 테스트 DB 환경');
		expect(koData.resume.about.summary).not.toContain('폐쇄적인 DBMS 환경');
		expect(JSON.stringify(koData.resume.experience)).toContain(
			'Rails test pipeline 실행 시간을 약 1시간에서 17분으로 단축'
		);
		expect(JSON.stringify(koData.resume.experience)).toContain('test-prof 기반 fixture 재사용');
		expect(JSON.stringify(koData.resume.experience)).toContain('외부 의존성 boot overhead 정리');

		expect(enData.resume.about.summary).toContain('Cupix');
		expect(enData.resume.about.summary).toContain('Java/Spring');
		expect(enData.resume.about.summary).toContain('Tibero DBMS');
		expect(enData.resume.about.summary).toContain('Flyway');
		expect(enData.resume.about.summary).toContain('construction-site video data');
		expect(enData.resume.about.summary).toContain('BIM files');
		expect(enData.resume.about.summary).toContain('6+ regions');
		expect(enData.resume.about.summary).toContain('20M+');
		expect(enData.resume.about.summary).toContain('100M+');
		expect(enData.resume.about.summary).toContain('preventing the same issue from recurring');
		expect(enData.resume.about.summary).toContain('organize evidence calmly');
		expect(enData.resume.about.summary).toContain('solutions the team can act on right away');
		expect(enData.resume.about.summary).toContain('root causes to the end');
		expect(enData.resume.about.summary).not.toContain(
			'most problems I worked on started not from the feature itself'
		);
		expect(enData.resume.about.summary).not.toContain(
			'Through APIs, asynchronous processing, and background jobs'
		);
		expect(enData.resume.about.summary).not.toContain('Ruby on Rails');
		expect(enData.resume.about.summary).not.toContain('NestJS');
		expect(enData.resume.about.summary).not.toContain('Sidekiq');
		expect(enData.resume.about.summary).not.toContain('SQS');
		expect(enData.resume.about.summary).not.toContain('Kinesis');
		expect(enData.resume.about.summary).not.toContain('Firehose');
		expect(enData.resume.about.summary).not.toContain('local test database environment');
		expect(enData.resume.about.summary).not.toContain('closed DBMS environment');

		expect(esData.resume.about.summary).toContain('Cupix');
		expect(esData.resume.about.summary).toContain('Java/Spring');
		expect(esData.resume.about.summary).toContain('Tibero DBMS');
		expect(esData.resume.about.summary).toContain('Flyway');
		expect(esData.resume.about.summary).toContain('video de obras de construcción');
		expect(esData.resume.about.summary).toContain('archivos BIM');
		expect(esData.resume.about.summary).toContain('6+ regiones');
		expect(esData.resume.about.summary).toContain('20M+');
		expect(esData.resume.about.summary).toContain('100M+');
		expect(esData.resume.about.summary).toContain('evitar que el mismo problema se repita');
		expect(esData.resume.about.summary).toContain('ordenar la evidencia con calma');
		expect(esData.resume.about.summary).toContain(
			'soluciones que el equipo pueda ejecutar de inmediato'
		);
		expect(esData.resume.about.summary).toContain('seguir las causas hasta el final');
		expect(esData.resume.about.summary).not.toContain(
			'la mayoría de los problemas que abordé no empezaban en la función en sí'
		);
		expect(esData.resume.about.summary).not.toContain(
			'Mediante APIs, procesamiento asíncrono y jobs en background'
		);
		expect(esData.resume.about.summary).not.toContain('Ruby on Rails');
		expect(esData.resume.about.summary).not.toContain('NestJS');
		expect(esData.resume.about.summary).not.toContain('Sidekiq');
		expect(esData.resume.about.summary).not.toContain('SQS');
		expect(esData.resume.about.summary).not.toContain('Kinesis');
		expect(esData.resume.about.summary).not.toContain('Firehose');
		expect(esData.resume.about.summary).not.toContain('entorno local de base de datos de prueba');
		expect(esData.resume.about.summary).not.toContain('entorno DBMS cerrado');
	});

	it('Cupix 경력이 파트 리드 기간과 리딩 범위를 설명함', () => {
		const cupix = koData.resume.experience.find((exp) => exp.company === 'Cupix');
		expect(cupix).toBeDefined();
		if (!cupix) {
			throw new Error('Cupix 경력 항목이 필요함');
		}

		expect(cupix.position).toContain('Backend Engineer');
		expect(cupix.position).toContain('Application Part Lead · Backend');
		expect(cupix.position).toContain('2025.12 ~');
		expect(cupix.position).toContain('3명 파트 리딩');
		expect(cupix.description).toContain('건물 3D 설계 모델과 현장 360° 캡처 데이터');
		expect(cupix.description).toContain('글로벌 공간 AI SaaS 기업');
		expect(cupix.description).toContain('Cupix 백엔드 팀 내 3명 규모 Application Part');
		expect(cupix.description).toContain('실무 개발과 함께 리딩');
		expect(cupix.description).not.toBe(
			'건물 3D 설계 모델과 현장 360° 캡처 데이터를 연결해 시공 진행률과 자산 상태를 추적하는 글로벌 공간 AI SaaS 기업입니다. SiteInsights 데이터 검증, Kinesis/SQS 기반 이벤트 처리, BIM AI 전처리, Redis/Sidekiq 운영 안정화, API/SDK 계약 정리를 담당했습니다.'
		);
	});

	it('Miridih 경력이 GPU와 CDN 비용 절감 기준을 설명함', () => {
		const miridih = koData.resume.experience.find((exp) => exp.company === 'Miridih');
		expect(miridih).toBeDefined();
		if (!miridih) {
			throw new Error('Miridih 경력 항목이 필요함');
		}

		const details = JSON.stringify(miridih.achievements);
		expect(miridih.description).toContain('외부 AI 모델 연동부터');
		expect(miridih.description).toContain('월 100만 건 이상 이미지 생성 요청 처리');
		expect(miridih.description).toContain('GPU·CDN 비용 최적화');
		expect(miridih.description).toContain('운영 환경으로 확장');
		expect(details).toContain('GPU 인프라 다운사이징으로 월 약 $185/대 절감');
		expect(details).toContain('월 GPU 인프라 비용을 20%(인스턴스 1대당 월 약 $185) 절감');
		expect(details).toContain('월 약 5TB 규모의 CDN egress 비용을 월 약 $450 절감');
		expect(details).toContain('AI 이미지 생성 비동기 파이프라인의 동시성·재시도 안정화');
		expect(details).toContain(
			'사용자 재시도나 job 재실행으로 같은 생성 요청이 두 번 처리될 수 있는 구간 점검'
		);
		expect(details).toContain(
			'생성 요청 단위 식별자를 기준으로 job 실행과 결과 저장이 한 번만 이어지도록 정리'
		);
		expect(details).toContain(
			'외부 AI API 호출 실패 후 재시도되는 경우에도 생성 상태와 저장 결과가 어긋나지 않도록 개선'
		);
		expect(details).not.toContain('DALL·E 3 통합으로 일일 이미지 생성 요청량 40% 증가 달성');
		expect(details).not.toContain('Redis 분산 락');
		expect(details).not.toContain('AutoIncrement PK');
		expect(details).not.toContain('어드민 서버 동시성');
		expect(details).not.toContain('인프라 비용 최적화로 월간 비용 20% 절감');
	});

	it('학력 기간이 병역으로 인한 재학 기간 오해를 줄임', () => {
		const education = koData.resume.education.find((edu) => edu.institution === '건국대학교');
		expect(education).toBeDefined();
		if (!education) {
			throw new Error('건국대학교 학력 항목이 필요함');
		}

		expect(education.period).toContain('2017.03 ~ 2023.02');
		expect(education.period).toContain('병역: 군 복무 완료 (2018 ~ 2019)');
	});

	it('Tibero 오픈소스 기여가 테스트·마이그레이션 도구 공개로 설명됨', () => {
		const tibero = koData.resume.opensource.find(
			(project) => project.name === 'Tibero Support Organization'
		);
		expect(tibero).toBeDefined();
		if (!tibero) {
			throw new Error('Tibero Support Organization 오픈소스 항목이 필요함');
		}

		const contents = JSON.stringify(tibero);
		expect(tibero.description).toContain('로컬 테스트 DB');
		expect(tibero.description).toContain('통합 테스트');
		expect(tibero.description).toContain('schema migration');
		expect(tibero.description).toContain('반복 가능');
		expect(contents).toContain('Docker/Testcontainers 기반 테스트 환경 구성');
		expect(contents).toContain('Flyway dialect 구현으로 schema migration 자동화');
		expect(contents).toContain('Tibero Docker 이미지 경량화');
		expect(contents).not.toContain('국내 기업들이 널리 사용하는 DBMS');
		expect(contents).not.toContain('개발자 생태계 지원이 부족');
	});

	it('MDN 오픈소스 기여가 웹 표준 문서 정확성 개선으로 설명됨', () => {
		const mdn = koData.resume.opensource.find((project) => project.name.includes('MDN Web Docs'));
		expect(mdn).toBeDefined();
		if (!mdn) {
			throw new Error('MDN Web Docs 오픈소스 항목이 필요함');
		}

		const contents = JSON.stringify(mdn);
		expect(mdn.name).toContain('한국어 문서 개선');
		expect(contents).toContain('JavaScript, Web API 등 웹 표준 문서의 오역을 수정');
		expect(contents).toContain('원문 명세와 실제 동작에 맞게 설명을 정리');
		expect(contents).toContain('기술 문서의 정확성');
		expect(contents).not.toContain('한글화');
		expect(contents).not.toContain('번역 품질 향상');
	});

	it('Tmax Fintech 경력이 Tibero 개발·테스트 환경 표준화 성과를 설명함', () => {
		const tmax = koData.resume.experience.find((exp) => exp.company === 'Tmax Fintech');
		expect(tmax).toBeDefined();
		if (!tmax) {
			throw new Error('Tmax Fintech 경력 항목이 필요함');
		}

		expect(tmax.description).toContain('핀테크 서비스 개발 조직');
		expect(tmax.description).toContain('Tibero 기반 개발·테스트 환경을 표준화');
		expect(tmax.description).toContain('로컬 테스트 DB');
		expect(tmax.description).toContain('CI 통합 테스트');
		expect(tmax.description).toContain('Flyway 마이그레이션');
		expect(tmax.description).not.toContain('서비스 최적화 및 개발 생산성 향상');

		const details = JSON.stringify(tmax.achievements);
		expect(details).toContain('Tibero Docker/TestContainer를 구축');
		expect(details).toContain('CI 파이프라인에 통합해 DB 의존 테스트를 자동화');
		expect(details).toContain('Tibero 전용 dialect');
		expect(details).toContain('1.5GB에서 401MB');
		expect(details).toContain('3개 오픈소스 프로젝트');
	});
});
