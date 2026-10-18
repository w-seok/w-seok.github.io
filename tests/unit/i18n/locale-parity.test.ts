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

	it('Hero 직함이 Software Engineer로 표시됨', () => {
		expect(koData.header.title).toBe('Software Engineer');
		expect(enData.header.title).toBe('Software Engineer');
		expect(esData.header.title).toBe('Ingeniero de Software');
	});

	it('소개글이 반복해 푼 문제 축과 대표 성과를 설명함', () => {
		expect(koData.resume.about.summary.split('\n\n')).toHaveLength(4);
		expect(koData.resume.about.summary.split('\n\n')[0]).toBe(
			'안녕하세요. 대용량 데이터를 빠르게 처리하고, 여러 시스템을 거쳐도 데이터가 어긋나지 않게 만드는 일을 반복해 온 4년 차 소프트웨어 엔지니어 신원석입니다. AI 이미지 생성, 핀테크, 공간 AI SaaS로 도메인은 달랐지만, 맡아 온 문제는 대부분 처리 성능과 데이터 정합성이었습니다.'
		);
		// 도메인 나열보다 반복해 푼 문제 축(처리 성능 · 데이터 정합성)이 먼저 읽혀야 한다
		expect(koData.resume.about.summary).toContain('4년 차 소프트웨어 엔지니어 신원석');
		expect(koData.resume.about.summary).toContain('처리 성능과 데이터 정합성');
		expect(koData.resume.about.summary).not.toContain('Backend Engineer 신원석');
		expect(koData.resume.about.summary).toContain('Cupix');
		expect(koData.resume.about.summary).toContain('건설 현장의 영상 데이터와');
		expect(koData.resume.about.summary).toContain('건축 설계 정보가 담긴 BIM 파일');
		expect(koData.resume.about.summary).not.toContain('건축 설계 정보를 담은 BIM 파일');
		expect(koData.resume.about.summary).toContain('공정률');
		expect(koData.resume.about.summary).toContain(
			'기능 스펙 검토부터 데이터 모델 · 이벤트 흐름 · API 설계까지'
		);
		expect(koData.resume.about.summary).toContain('수십 분에서 수 분으로');
		expect(koData.resume.about.summary).toContain('6개 이상 리전에 걸친');
		expect(koData.resume.about.summary).toContain('2천만 건 이상');
		expect(koData.resume.about.summary).toContain('1억 건 이상');
		expect(koData.resume.about.summary).toContain('스냅샷·이벤트');
		expect(koData.resume.about.summary).toContain('어긋나지 않도록');
		expect(koData.resume.about.summary).toContain('월 30만 건 이상의 요청');
		expect(koData.resume.about.summary).not.toContain('월 100만 건');
		expect(koData.resume.about.summary).toContain('Tibero');
		expect(koData.resume.about.summary).toContain('3개 오픈소스');
		expect(koData.resume.about.summary).toContain('여러 시스템이 맞물린 문제일수록');
		expect(koData.resume.about.summary).toContain('급하게 고치면 같은 문제가 다시 생긴다');
		expect(koData.resume.about.summary).toContain('원인을 끝까지 확인');
		expect(koData.resume.about.summary).toContain('팀이 바로 적용할 수 있는 방법까지 정리하는');
		expect(koData.resume.about.summary).toContain('엔지니어로 일하고자 합니다');
		expect(koData.resume.about.summary).not.toContain('백엔드 개발자');

		// 현재 하는 일(Cupix)이 과거 이력(Java/Spring)보다 먼저 나와야 한다
		const paragraphs = koData.resume.about.summary.split('\n\n');
		expect(paragraphs).toHaveLength(4);
		expect(paragraphs[1]).toContain('현재는 Cupix');
		expect(paragraphs[2]).toContain('그 전에는');
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

		expect(enData.resume.about.summary.split('\n\n')).toHaveLength(4);
		expect(enData.resume.about.summary).toContain('fourth-year software engineer');
		// 영어권 순서(이름 성)로 쓰고, 푸터 표기(Wonseok Shin)와 맞춘다
		expect(enData.resume.about.summary).toContain("I'm Wonseok Shin");
		expect(enData.resume.about.summary).not.toContain('Shin Wonseok');
		expect(enData.resume.about.summary).toContain('processing performance and data consistency');
		expect(enData.resume.about.summary).not.toContain('Backend Engineer');
		expect(enData.resume.about.summary).toContain('Cupix');
		expect(enData.resume.about.summary).toContain('construction-site video data');
		expect(enData.resume.about.summary).toContain('BIM files');
		expect(enData.resume.about.summary).toContain('6+ regions');
		expect(enData.resume.about.summary).toContain('20M+');
		expect(enData.resume.about.summary).toContain('100M+');
		expect(enData.resume.about.summary).toContain('300K+ monthly requests');
		expect(enData.resume.about.summary).not.toContain('1M+ monthly');
		expect(enData.resume.about.summary).toContain('solutions the team can apply right away');
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

		expect(esData.resume.about.summary.split('\n\n')).toHaveLength(4);
		expect(esData.resume.about.summary).toContain('ingeniero de software');
		expect(esData.resume.about.summary).toContain('Soy Wonseok Shin');
		expect(esData.resume.about.summary).not.toContain('Shin Wonseok');
		expect(esData.resume.about.summary).toContain(
			'rendimiento de procesamiento y consistencia de datos'
		);
		expect(esData.resume.about.summary).not.toContain('Backend Engineer');
		expect(esData.resume.about.summary).toContain('Cupix');
		expect(esData.resume.about.summary).toContain('video de obras de construcción');
		expect(esData.resume.about.summary).toContain('archivos BIM');
		expect(esData.resume.about.summary).toContain('6+ regiones');
		expect(esData.resume.about.summary).toContain('20M+');
		expect(esData.resume.about.summary).toContain('100M+');
		expect(esData.resume.about.summary).toContain('más de 300K solicitudes mensuales');
		expect(esData.resume.about.summary).toContain(
			'soluciones que el equipo pueda aplicar de inmediato'
		);
		expect(esData.resume.about.summary).toContain('sigue las causas hasta el final');
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

	it('기술 스택이 직군을 한정하지 않는 영어 분류와 기술별 쓰임으로 구성됨', () => {
		for (const data of [koData, enData, esData]) {
			expect(data.resume.skills.map((cat) => cat.category)).toEqual([
				'Languages & Frameworks',
				'Data',
				'Infrastructure & Tools'
			]);
			const contexts = data.resume.skills.flatMap((cat) => cat.items.map((item) => item.context));
			// 회사별 연결은 경력 칩이 맡으므로 설명에 회사 이름을 붙이지 않는다
			for (const company of ['Cupix', 'Miridih', 'Tmax']) {
				expect(contexts.join('\n')).not.toContain(company);
			}
			expect(contexts.join('\n')).not.toContain('LOC');
			// PR 리뷰 도구는 Go 로 이전했다 — 기술 스택 · 경력 칩 · 성과 문장 모두 같아야 한다
			expect(JSON.stringify(data.resume)).not.toContain('Rust');
			expect(data.resume.skills[0].items.map((item) => item.name)).toContain('Go');
			expect(data.resume.experience[0].stack).toContain('Go 1.26');
		}
		const tibero = koData.resume.skills
			.flatMap((cat) => cat.items)
			.find((item) => item.name === 'Tibero');
		// 어느 DB 에서나 하는 일(N+1 제거)이 아니라 Tibero 라서 한 일을 적는다
		expect(tibero?.context).toBe('Flyway · Testcontainers 지원 직접 개발, Docker 이미지 공개');
	});

	it('Cupix 경력이 제품 단위 블록과 해결 중심 문장으로 구성됨', () => {
		const cupix = koData.resume.experience.find((exp) => exp.company === 'Cupix');
		expect(cupix).toBeDefined();
		if (!cupix) {
			throw new Error('Cupix 경력 항목이 필요함');
		}

		expect(cupix.position).toBe('Backend Engineer / Application Part Lead · Backend');
		expect(cupix.description).toContain('글로벌 공간 AI SaaS 기업');
		// 소제목은 추상 명사 짝이 아니라 제품 · 프로젝트 이름으로 쓴다
		expect(cupix.achievements.map((ach) => ach.title)).toEqual([
			'BimAI (BIM 부품 AI 분류 서비스)',
			'SiteInsights (시공 진척 분석 서비스)',
			'운영 및 장애 대응',
			'Application Part 리딩'
		]);

		const details = cupix.achievements.flatMap((ach) => ach.details);
		const text = details.join('\n');
		expect(text).toContain('scale up으로 임시 조치한 뒤');
		expect(text).toContain('약 20분에서 3분으로 단축');
		expect(text).toContain('98%가 출시 후 재작업 없이 마무리');
		expect(text).toContain('49분에서 12분으로 76% 단축');
		// 장애는 팀 대응 · 레거시 개선으로 쓰고 심각도 수치는 넣지 않는다
		for (const severity of ['550배', '919건', '41,271']) {
			expect(text).not.toContain(severity);
		}
		// 내부 용어와 기록상 부분 숫자는 쓰지 않는다
		for (const internal of ['facility', 'test:core', '475건', '이식']) {
			expect(text).not.toContain(internal);
		}
		// 문장 안 em dash · 띄어 쓴 가운뎃점 · 분석으로 끝나는 문장 · 구어체 끝맺음을 막는다
		for (const detail of details) {
			expect(detail).not.toMatch(/—| · /);
			for (const sentence of detail.split(/(?<=\.)\s+/)) {
				expect(sentence.replace(/[.)]+$/, '')).not.toMatch(/(확인|제시|제안|검토|임|음|함)$/);
			}
		}
	});

	it('Miridih 경력이 확장 · 멱등 처리 · 비용 절감 근거를 설명함', () => {
		const miridih = koData.resume.experience.find((exp) => exp.company === 'Miridih');
		expect(miridih).toBeDefined();
		if (!miridih) {
			throw new Error('Miridih 경력 항목이 필요함');
		}

		expect(miridih.description).toContain('월 30만 건 이상 이미지 생성 요청 처리');
		expect(JSON.stringify(miridih)).not.toContain('100만');
		expect(miridih.achievements.map((ach) => ach.title)).toEqual([
			'미리캔버스 AI 드로잉',
			'인프라 비용 절감'
		]);
		const text = miridih.achievements.flatMap((ach) => ach.details).join('\n');
		expect(text).toContain('멱등 처리로 차단');
		expect(text).toContain('GPU 비용 20% 절감(대당 월 약 $185)');
		expect(text).toContain('25분에서 15분으로 단축');
		// 75% 가 감소인지 수준인지 모호하지 않게 쓴다
		expect(text).toContain('평균 파일 크기를 75% 줄이고');
		expect(text).toContain('Lambda@Edge');
		expect(text).not.toContain('DALL·E 3 통합으로 일일 이미지 생성 요청량 40% 증가 달성');
		expect(text).not.toContain('Redis 분산 락');
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

	it('Hindsight 오픈소스 기여가 최신순 첫 항목이며 본인 PR·Issue 목록으로 연결됨', () => {
		const repo = 'https://github.com/vectorize-io/hindsight';
		for (const data of [koData, enData, esData]) {
			const [hindsight] = data.resume.opensource;
			expect(hindsight.name).toBe('Hindsight (vectorize-io)');
			expect(hindsight.contributions).toHaveLength(3);
			// PR 은 메인테이너가 올린 반영 PR 까지 보이도록 merge + involves, Issue 는 작성자 필터로 본인 기여만 보인다
			expect(hindsight.links).toEqual([
				{ label: 'GitHub', url: repo },
				{ label: 'PR', url: `${repo}/pulls?q=is%3Apr+is%3Amerged+involves%3Aw-seok` },
				{ label: 'Issues', url: `${repo}/issues?q=is%3Aissue+author%3Aw-seok` }
			]);
		}

		expect(koData.resume.opensource[0].period).toBe('2026.09 ~');

		// 대표 수치(누수 규모)를 각 언어의 소수점 표기로 담는다
		expect(JSON.stringify(koData.resume.opensource[0])).toContain('42.7GB까지 늘던 메모리');
		expect(JSON.stringify(enData.resume.opensource[0])).toContain('growing to 42.7GB');
		expect(JSON.stringify(esData.resume.opensource[0])).toContain('creciera hasta 42,7GB');
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

	it('Tmax Fintech 경력이 백오피스 완결 · 성능 · Tibero 환경 성과를 설명함', () => {
		const tmax = koData.resume.experience.find((exp) => exp.company === 'Tmax Fintech');
		expect(tmax).toBeDefined();
		if (!tmax) {
			throw new Error('Tmax Fintech 경력 항목이 필요함');
		}

		expect(tmax.description).toContain('배달서비스공제조합 공제보험 백오피스');
		expect(tmax.description).toContain('Tibero 기반 개발·테스트 환경도 표준화');
		expect(tmax.achievements.map((ach) => ach.title)).toEqual([
			'공제보험 백오피스',
			'Tibero 개발 환경'
		]);
		const text = tmax.achievements.flatMap((ach) => ach.details).join('\n');
		expect(text).toContain('가입설계, 수납, 계약 승인, 배서');
		expect(text).toContain('커버리지를 0%에서 약 70%로');
		expect(text).toContain('3.6초에서 0.7초로');
		expect(text).toContain('동시 저장 테스트로 유실 0건 검증');
		expect(text).toContain('3개 오픈소스로 공개');
		expect(text).toContain('1.5GB에서 401MB로 70% 경량화');
		expect(text).not.toContain('줄임');
	});

	it('경력 번역이 ko 와 같은 블록 구조를 갖고 같은 문체 규칙을 지킴', () => {
		for (const data of [enData, esData]) {
			const titles = data.resume.experience.map((exp) => exp.achievements.length);
			expect(titles).toEqual(koData.resume.experience.map((exp) => exp.achievements.length));
			const text = JSON.stringify(data.resume.experience);
			expect(text).not.toMatch(/—/);
			expect(text).not.toContain('facility');
		}
		expect(enData.resume.experience[0].achievements[0].title).toBe(
			'BimAI (AI classification of BIM components)'
		);
		expect(esData.resume.experience[0].achievements[1].title).toBe(
			'SiteInsights (análisis del avance de obra)'
		);
	});
});
