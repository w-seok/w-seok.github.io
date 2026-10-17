/**
 * @file 메인 페이지 E2E 테스트
 */

import { expect, test } from '@playwright/test';

test.describe('초기 언어 복원', () => {
	test.use({ locale: 'en-US' });

	for (const scenario of [
		{ stored: null, expected: 'en', heading: 'About' },
		{ stored: 'es', expected: 'es', heading: 'Sobre mí' },
		{ stored: 'invalid', expected: 'en', heading: 'About' }
	]) {
		test(`${scenario.stored} 저장값에서 콘텐츠와 HTML 언어가 일치함`, async ({ page }) => {
			if (scenario.stored !== null) {
				await page.addInitScript(
					(stored) => localStorage.setItem('locale', stored),
					scenario.stored
				);
			}
			await page.goto('/');
			await expect(page.locator('#about-heading')).toHaveText(scenario.heading);
			await expect(page.locator('html')).toHaveAttribute('lang', scenario.expected);
		});
	}

	test('언어 선택을 새로고침 후에도 복원함', async ({ page }) => {
		await page.goto('/');
		await page.locator('.lang-menu-container > button').click();
		await page.getByRole('menuitem', { name: 'Español' }).click();
		await expect(page.locator('#about-heading')).toHaveText('Sobre mí');
		await page.reload();
		await expect(page.locator('#about-heading')).toHaveText('Sobre mí');
		await expect(page.locator('html')).toHaveAttribute('lang', 'es');
	});
});

test.describe('터치 언어 선택', () => {
	test.use({ hasTouch: true });

	test('탭으로 열고 닫으며 언어를 선택함', async ({ page }) => {
		await page.goto('/');
		const button = page.locator('.lang-menu-container > button');
		await button.tap();
		await expect(button).toHaveAttribute('aria-expanded', 'true');
		await button.tap();
		await expect(button).toHaveAttribute('aria-expanded', 'false');
		await button.tap();
		await page.getByRole('menuitem', { name: 'Español' }).tap();
		await expect(page.locator('#about-heading')).toHaveText('Sobre mí');
		await expect(button).toHaveAttribute('aria-expanded', 'false');
	});
});

test.describe('JavaScript 없는 본문', () => {
	test.use({ javaScriptEnabled: false, contextOptions: { reducedMotion: 'no-preference' } });

	test('본문 8개 섹션을 모두 표시함', async ({ page }) => {
		await page.goto('/');
		const sections = page.locator('.content-section');
		await expect(sections).toHaveCount(8);
		for (const section of await sections.all()) {
			await expect(section).toHaveCSS('opacity', '1');
		}
		await expect(page.locator('#about-heading')).toHaveText('소개');
	});
});

test.describe('스크롤 애니메이션', () => {
	test.use({ contextOptions: { reducedMotion: 'no-preference' } });

	test('스크롤로 만나는 섹션을 표시함', async ({ page }) => {
		await page.goto('/');
		const education = page.locator('section[aria-labelledby="education-heading"]');
		await expect(education).toHaveCSS('opacity', '0');
		await education.scrollIntoViewIfNeeded();
		await expect(education).toHaveCSS('opacity', '1');
	});

	for (const media of ['reduced-motion', 'print'] as const) {
		test(`${media} 환경에서는 스크롤 전에도 본문을 표시함`, async ({ page }) => {
			await page.emulateMedia(media === 'print' ? { media: 'print' } : { reducedMotion: 'reduce' });
			await page.goto('/');
			const sections = page.locator('.content-section');
			await expect(sections).toHaveCount(8);
			for (const section of await sections.all()) {
				await expect(section).toHaveCSS('opacity', '1');
			}
		});
	}
});

test.describe('메인 페이지', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('페이지가 정상 로드됨', async ({ page }) => {
		await expect(page).toHaveTitle(/신원석|Wonseok Shin/);
	});

	test('Hero 섹션에 이름이 표시됨', async ({ page }) => {
		const heroHeading = page.locator('#hero-heading');
		await expect(heroHeading).toBeVisible();
		await expect(
			heroHeading.locator('text=신원석').or(heroHeading.locator('text=Wonseok Shin'))
		).toBeVisible();
		// 영어판 이름은 서류 · 푸터와 같은 Wonseok Shin 하나로 쓴다
		await expect(page.locator('body')).not.toContainText('Leo Shin');
	});

	test('About 섹션이 표시됨', async ({ page }) => {
		const aboutSection = page.locator('section[aria-labelledby="about-heading"]');
		await expect(aboutSection).toBeVisible();
	});

	test('Experience 섹션이 표시됨', async ({ page }) => {
		const experienceSection = page.locator('section[aria-labelledby="experience-heading"]');
		await expect(experienceSection).toBeVisible();
	});

	test('Skills 섹션이 표시됨', async ({ page }) => {
		const skillsSection = page.locator('section[aria-labelledby="skills-heading"]');
		await expect(skillsSection).toBeVisible();
	});

	test('푸터가 표시됨', async ({ page }) => {
		const footer = page.locator('footer');
		await footer.scrollIntoViewIfNeeded();
		await expect(footer).toBeVisible();
		await expect(footer.locator('text=Wonseok Shin')).toBeVisible();
	});

	test('GitHub 링크가 올바른 URL을 가짐', async ({ page }) => {
		const githubLink = page.locator('a[aria-label="GitHub"]');
		await expect(githubLink).toHaveAttribute('href', 'https://github.com/w-seok');
		await expect(githubLink).toHaveAttribute('target', '_blank');
	});

	test('Email 링크가 올바른 URL을 가짐', async ({ page }) => {
		const emailLink = page.locator('a[aria-label="Email"]');
		await expect(emailLink).toHaveAttribute('href', 'mailto:tkddls4456@gmail.com');
	});

	test('Blog 링크가 올바른 URL을 가짐', async ({ page }) => {
		const blogLink = page.locator('a[aria-label="Blog"]');
		await expect(blogLink).toHaveAttribute('href', 'https://w-seok.github.io/blog');
		await expect(blogLink).toHaveAttribute('target', '_blank');
	});
});

// 섹션 제목과 학력 문구는 한국어 데이터 기준으로 확인한다 (기본 브라우저 언어는 en-US)
test.describe('한국어 본문 구성', () => {
	test.beforeEach(async ({ page, context }) => {
		await context.addInitScript(() => {
			localStorage.setItem('locale', 'ko');
		});
		await page.goto('/');
	});

	test('섹션이 기술 스택 → 활동 → 학력 순서이고 목차도 같음', async ({ page }) => {
		const headings = page.locator('.content-section .section-heading');
		await expect(headings).toHaveText([
			'소개',
			'경력',
			'오픈소스',
			'기술 스택',
			'활동',
			'수상',
			'자격증',
			'학력'
		]);
		// 목차 순서(SECTION_IDS)가 문서 배치와 어긋나면 활성 섹션 표시가 틀어진다
		await expect(page.locator('.side-nav-label')).toHaveText(await headings.allTextContents());
	});

	test('오픈소스와 활동 항목이 같은 크기와 간격으로 표시됨', async ({ page }) => {
		// 같은 구조(이름 · 기간 · 설명 · bullet)의 항목이 섹션마다 다르게 보이면 다른 종류의 정보로 읽힌다
		const pairs = [
			['.opensource-name', '.activity-name', 'font-size'],
			['.opensource-name', '.activity-name', 'font-weight'],
			['.opensource-description', '.activity-description', 'margin-bottom'],
			['.contribution-item', '.activity-highlight', 'font-size'],
			['.contribution-item', '.activity-highlight', 'margin-bottom']
		] as const;
		for (const [opensource, activity, property] of pairs) {
			const expected = await page
				.locator(activity)
				.first()
				.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
			await expect(page.locator(opensource).first()).toHaveCSS(property, expected);
		}
	});

	test('학력의 날짜 열에는 날짜만 두고 병역은 아래 줄에 표시함', async ({ page }) => {
		const education = page.locator('section[aria-labelledby="education-heading"]');
		await expect(education.locator('.education-period')).toHaveText('2017.03 ~ 2023.02');
		await expect(education.locator('.education-note')).toHaveText(
			'병역: 군 복무 완료 (2018 ~ 2019)'
		);
		await expect(education.locator('.education-title')).toHaveText(
			'건국대학교 · 학사 · 스마트ICT융합공학과 · GPA 3.85/4.5 (전공)'
		);
	});
});

test.describe('언어 전환', () => {
	test.beforeEach(async ({ page, context }) => {
		await context.addInitScript(() => {
			localStorage.setItem('locale', 'ko');
		});
		await page.goto('/');
	});

	test('언어 선택 드롭다운이 표시됨', async ({ page }) => {
		const langMenuContainer = page.locator('.lang-menu-container');
		await expect(langMenuContainer).toBeVisible();

		const langButton = langMenuContainer.locator('button').first();
		await langButton.click();
		await expect(langButton).toHaveAttribute('aria-expanded', 'true');

		await expect(page.locator('role=menuitem >> text=한국어')).toBeVisible();
		await expect(page.locator('role=menuitem >> text=English')).toBeVisible();
		await expect(page.locator('role=menuitem >> text=Español')).toBeVisible();
	});

	test('마우스 hover 후 클릭해도 메뉴가 유지됨', async ({ page, browserName }) => {
		test.skip(
			browserName === 'firefox',
			'Firefox 테스트 입력의 pointerType이 비어 있어 실제 마우스 hover를 재현하지 못합니다.'
		);
		const button = page.locator('.lang-menu-container > button');
		await button.hover();
		await expect(button).toHaveAttribute('aria-expanded', 'true');
		await button.click();
		await expect(button).toHaveAttribute('aria-expanded', 'true');
	});

	test('언어 선택 시 콘텐츠가 변경됨', async ({ page }) => {
		const aboutHeading = page.locator('#about-heading');
		await expect(aboutHeading).toHaveText('소개');

		const langMenuContainer = page.locator('.lang-menu-container');
		const langButton = langMenuContainer.locator('button').first();

		await langButton.click();
		await page.locator('role=menuitem >> text=English').click();

		await expect(aboutHeading).toHaveText('About');

		// 다시 드롭다운 열기
		await langButton.click();
		await page.locator('role=menuitem >> text=Español').click();

		await expect(aboutHeading).toHaveText('Sobre mí');
	});

	test('키보드로 메뉴를 열고 닫으며 외부 클릭으로 닫음', async ({ page }) => {
		const button = page.locator('.lang-menu-container > button');
		await button.focus();
		await button.press('Enter');
		await expect(button).toHaveAttribute('aria-expanded', 'true');
		await button.press('Enter');
		await expect(button).toHaveAttribute('aria-expanded', 'false');
		await button.press('Enter');
		await page.locator('#hero-heading').click();
		await expect(button).toHaveAttribute('aria-expanded', 'false');
	});
});

test.describe('테마 전환', () => {
	test.beforeEach(async ({ page, context }) => {
		await context.addInitScript(() => {
			localStorage.setItem('theme', 'light');
			localStorage.setItem('locale', 'ko');
		});
		await page.goto('/');
	});

	test('테마 전환 버튼이 표시됨', async ({ page }) => {
		const themeButton = page.locator('button[aria-label="테마 전환"]');
		await expect(themeButton).toBeVisible();
	});

	test('테마 전환 시 클래스가 변경됨', async ({ page }) => {
		// dark 클래스는 min-h-screen div에 적용됨
		const themeContainer = page.locator('.min-h-screen').first();
		const themeButton = page.locator('button[aria-label="테마 전환"]');

		// 초기 상태: light (dark 클래스 없음)
		await expect(themeContainer).not.toHaveClass(/dark/);

		await themeButton.click();

		// dark 모드로 전환
		await expect(themeContainer).toHaveClass(/dark/);

		await themeButton.click();

		// 다시 light 모드로
		await expect(themeContainer).not.toHaveClass(/dark/);
	});
});

test.describe('접근성', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('모든 섹션에 적절한 ARIA 라벨이 있음', async ({ page }) => {
		const sections = [
			'section[aria-labelledby="hero-heading"]',
			'section[aria-labelledby="about-heading"]',
			'section[aria-labelledby="experience-heading"]',
			'section[aria-labelledby="skills-heading"]'
		];

		for (const selector of sections) {
			const section = page.locator(selector);
			await expect(section).toBeVisible();
		}
	});

	test('버튼에 aria-label이 있음', async ({ page }) => {
		const buttons = page.locator('button[aria-label]');
		const count = await buttons.count();
		expect(count).toBeGreaterThanOrEqual(2);
	});

	test('링크에 적절한 접근성 속성이 있음', async ({ page }) => {
		const externalLinks = page.locator('a[target="_blank"]');
		const count = await externalLinks.count();

		for (let i = 0; i < count; i++) {
			const link = externalLinks.nth(i);
			await expect(link).toHaveAttribute('rel', /noopener/);
		}
	});
});

test.describe('반응형 레이아웃', () => {
	test('모바일 뷰포트에서 정상 표시됨', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		const heroHeading = page.locator('#hero-heading');
		await expect(heroHeading).toBeVisible();

		const floatingControl = page.locator('.lang-menu-container');
		await expect(floatingControl).toBeVisible();
	});

	test('태블릿 뷰포트에서 정상 표시됨', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');

		const heroHeading = page.locator('#hero-heading');
		await expect(heroHeading).toBeVisible();
	});

	test('데스크톱 뷰포트에서 정상 표시됨', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/');

		const heroHeading = page.locator('#hero-heading');
		await expect(heroHeading).toBeVisible();
	});
});
