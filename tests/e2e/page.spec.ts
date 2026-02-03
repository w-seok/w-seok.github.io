/**
 * @file 메인 페이지 E2E 테스트
 */

import { expect, test } from '@playwright/test';

test.describe('메인 페이지', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('페이지가 정상 로드됨', async ({ page }) => {
		await expect(page).toHaveTitle(/신원석|Leo Shin/);
	});

	test('Hero 섹션에 이름이 표시됨', async ({ page }) => {
		const heroHeading = page.locator('#hero-heading');
		await expect(heroHeading).toBeVisible();
		await expect(
			heroHeading.locator('text=신원석').or(heroHeading.locator('text=Leo Shin'))
		).toBeVisible();
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
		await expect(footer).toBeVisible();
		await expect(footer.locator('text=신원석').or(footer.locator('text=Leo Shin'))).toBeVisible();
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

		// hover로 드롭다운 표시
		await langMenuContainer.hover();

		await expect(page.locator('role=menuitem >> text=한국어')).toBeVisible();
		await expect(page.locator('role=menuitem >> text=English')).toBeVisible();
		await expect(page.locator('role=menuitem >> text=Español')).toBeVisible();
	});

	test('언어 선택 시 콘텐츠가 변경됨', async ({ page }) => {
		const aboutHeading = page.locator('#about-heading');
		await expect(aboutHeading).toHaveText('소개');

		const langMenuContainer = page.locator('.lang-menu-container');
		await langMenuContainer.hover();
		await page.locator('role=menuitem >> text=English').click();

		await expect(aboutHeading).toHaveText('About');

		await langMenuContainer.hover();
		await page.locator('role=menuitem >> text=Español').click();

		await expect(aboutHeading).toHaveText('Sobre mí');
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
		const html = page.locator('html');
		const themeButton = page.locator('button[aria-label="테마 전환"]');

		await expect(html).toHaveClass(/light/);

		await themeButton.click();

		await expect(html).toHaveClass(/dark/);

		await themeButton.click();

		await expect(html).toHaveClass(/light/);
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
