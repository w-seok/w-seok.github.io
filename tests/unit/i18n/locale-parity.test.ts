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
});
