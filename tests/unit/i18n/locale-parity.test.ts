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
		expect(koData.resume.about.summary).toContain('문제가 생긴 맥락');
		expect(koData.resume.about.summary).toContain('데이터가 흐르는 과정');
		expect(koData.resume.about.summary).toContain('먼저 확인하는');
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
});
