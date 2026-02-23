<script lang="ts">
	/**
	 * @file 메인 이력서 페이지
	 * @description jejeeun 스타일 + Toss/Daangn UX - 반응형 여백 시스템
	 */

	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { locale, t, type Locale } from '$lib/i18n';
	import { theme } from '$lib/stores/theme';

	let sections: HTMLElement[] = $state([]);
	let isLangMenuOpen = $state(false);

	const languages: { code: Locale; label: string }[] = [
		{ code: 'ko', label: '한국어' },
		{ code: 'en', label: 'English' },
		{ code: 'es', label: 'Español' }
	];

	/**
	 * 언어에 따른 이름 반환
	 */
	function getName(currentLocale: Locale): string {
		return currentLocale === 'ko' ? '신원석' : 'Leo Shin';
	}

	/**
	 * 언어 변경
	 */
	function changeLanguage(code: Locale) {
		locale.set(code);
		isLangMenuOpen = false;
	}

	/**
	 * 메뉴 외부 클릭 시 닫기
	 */
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.lang-menu-container')) {
			isLangMenuOpen = false;
		}
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
					}
				}
			},
			{ threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
		);

		for (const section of sections) {
			if (section) observer.observe(section);
		}

		document.addEventListener('click', handleClickOutside);

		return () => {
			observer.disconnect();
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<svelte:head>
	<title>{getName($locale)} | {$t.header.title}</title>
</svelte:head>

<div class="min-h-screen bg-background text-primary" class:dark={$theme === 'dark'}>
	<!-- 플로팅 컨트롤 (우측 상단) -->
	<div class="floating-control no-print">
		<div class="floating-control-inner">
			<!-- 언어 선택 드롭다운 (hover + click for mobile) -->
			<div
				class="relative lang-menu-container"
				onmouseenter={() => (isLangMenuOpen = true)}
				onmouseleave={() => (isLangMenuOpen = false)}
				role="presentation"
			>
				<button
					class="btn-icon"
					onclick={() => (isLangMenuOpen = !isLangMenuOpen)}
					aria-label={$t.common.toggleLanguage}
					aria-expanded={isLangMenuOpen}
					aria-haspopup="true"
				>
					<svg
						class="w-5 h-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
						/>
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9Z"
						/>
					</svg>
				</button>

				{#if isLangMenuOpen}
					<div
						class="dropdown-menu"
						role="menu"
						transition:fly={{ y: -8, duration: 200 }}
					>
						{#each languages as lang}
							<button
								class="dropdown-item"
								class:active={$locale === lang.code}
								onclick={() => changeLanguage(lang.code)}
								role="menuitem"
							>
								{lang.label}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- 테마 전환 버튼 -->
			<button class="btn-icon" onclick={() => theme.toggle()} aria-label={$t.common.toggleTheme}>
				{#if $theme === 'light'}
					<svg
						class="w-5 h-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="4" />
						<path
							d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
						/>
					</svg>
				{:else}
					<svg
						class="w-5 h-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75 9.75 9.75 0 0 1 8.25 6c0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25 9.75 9.75 0 0 0 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- 메인 콘텐츠 -->
	<main class="section-container page-content">
		<!-- Hero/Header 섹션 -->
		<section class="hero-section" aria-labelledby="hero-heading" bind:this={sections[0]}>
			<div class="hero-layout">
				<!-- 왼쪽: 이름 + 타이틀 -->
				<div class="page-enter stagger-1">
					<h1 id="hero-heading" class="hero-name">
						{getName($locale)}
					</h1>
					<p class="hero-title">{$t.header.title}</p>
				</div>

				<!-- 오른쪽: 연락처 (아이콘 통일) -->
				<div class="contact-icons page-enter stagger-2">
					<a
						href="https://github.com/w-seok"
						target="_blank"
						rel="noopener noreferrer"
						class="contact-link"
						aria-label="GitHub"
					>
						<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
					</a>
					<a href="mailto:tkddls4456@gmail.com" class="contact-link" aria-label="Email">
						<svg
							class="w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
							/>
						</svg>
					</a>
					<a
						href="https://w-seok.github.io/blog"
						target="_blank"
						rel="noopener noreferrer"
						class="contact-link"
						aria-label="Blog"
					>
						<svg
							class="w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
							/>
						</svg>
					</a>
				</div>
			</div>
		</section>

		<!-- 구분선 -->
		<hr class="section-divider page-enter stagger-3" />

		<!-- About 섹션 -->
		<section
			class="content-section animate-on-scroll"
			aria-labelledby="about-heading"
			bind:this={sections[1]}
		>
			<h2 id="about-heading" class="section-heading">
				{$t.sections.about}
			</h2>
			<div class="section-body">
				<p class="body-text about-summary">
					{$t.resume.about.summary}
				</p>
				<ul class="highlight-list">
					{#each $t.resume.about.highlights as highlight}
						<li class="highlight-item">{highlight}</li>
					{/each}
				</ul>
			</div>
		</section>

		<!-- 구분선 -->
		<hr class="section-divider" />

		<!-- Experience 섹션 -->
		<section
			class="content-section animate-on-scroll"
			aria-labelledby="experience-heading"
			bind:this={sections[2]}
		>
			<h2 id="experience-heading" class="section-heading">
				{$t.sections.experience}
			</h2>
			<div class="section-body">
				{#each $t.resume.experience as exp, i}
					<article class="experience-item" class:mt-experience={i > 0}>
						<div class="experience-header">
							<div class="experience-company-info">
								<h3 class="experience-company">{exp.company}</h3>
								<p class="experience-position">{exp.position}</p>
							</div>
							<span class="experience-period">{exp.period}</span>
						</div>
						<p class="experience-description">{exp.description}</p>
						{#each exp.achievements as achievement}
							<div class="achievement-block">
								<h4 class="achievement-title">{achievement.title}</h4>
								<ul class="achievement-details">
									{#each achievement.details as detail}
										<li class="achievement-detail">{detail}</li>
									{/each}
								</ul>
							</div>
						{/each}
					</article>
				{/each}
			</div>
		</section>

		<!-- 구분선 -->
		<hr class="section-divider" />

		<!-- Skills 섹션 -->
		<section
			class="content-section animate-on-scroll"
			aria-labelledby="skills-heading"
			bind:this={sections[3]}
		>
			<h2 id="skills-heading" class="section-heading">
				{$t.sections.skills}
			</h2>
			<div class="section-body">
				{#each $t.resume.skills as category}
					<div class="skill-category">
						<h3 class="skill-category-title">{category.category}</h3>
						<div class="skill-tags">
							{#each category.items as skill}
								<div class="skill-tag">
									<span class="skill-tag-name">{skill.name}</span>
									{#if skill.context}
										<span class="skill-tag-context">{skill.context}</span>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- 구분선 -->
		<hr class="section-divider" />

		<!-- Opensource 섹션 -->
		<section
			class="content-section animate-on-scroll"
			aria-labelledby="opensource-heading"
			bind:this={sections[4]}
		>
			<h2 id="opensource-heading" class="section-heading">
				{$t.sections.opensource}
			</h2>
			<div class="section-body">
				{#each $t.resume.opensource as project, i}
					<article class="opensource-item" class:mt-experience={i > 0}>
						<div class="opensource-header">
							<h3 class="opensource-name">{project.name}</h3>
							<span class="opensource-period">{project.period}</span>
						</div>
						<p class="opensource-description">{project.description}</p>
						<ul class="opensource-contributions">
							{#each project.contributions as contribution}
								<li class="contribution-item">{contribution}</li>
							{/each}
						</ul>
						<div class="opensource-links">
							{#each project.links as link}
								<a
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									class="opensource-link"
								>
									{link.label}
									<svg
										class="w-3 h-3 ml-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
										/>
									</svg>
								</a>
							{/each}
						</div>
					</article>
				{/each}
			</div>
		</section>

		<!-- 구분선 -->
		<hr class="section-divider" />

		<!-- Activities 섹션 -->
		<section
			class="content-section animate-on-scroll"
			aria-labelledby="activities-heading"
			bind:this={sections[5]}
		>
			<h2 id="activities-heading" class="section-heading">
				{$t.sections.activities}
			</h2>
			<div class="section-body">
				{#each $t.resume.activities as activity}
					<article class="activity-item">
						<div class="activity-header">
							<div>
								<h3 class="activity-name">{activity.name}</h3>
								<p class="activity-org">{activity.organization}</p>
							</div>
							<span class="activity-period">{activity.period}</span>
						</div>
						<p class="activity-description">{activity.description}</p>
						<ul class="activity-highlights">
							{#each activity.highlights as highlight}
								<li class="activity-highlight">{highlight}</li>
							{/each}
						</ul>
					</article>
				{/each}
			</div>
		</section>

		<!-- 구분선 -->
		<hr class="section-divider" />

		<!-- Awards 섹션 -->
		<section
			class="content-section animate-on-scroll"
			aria-labelledby="awards-heading"
			bind:this={sections[6]}
		>
			<h2 id="awards-heading" class="section-heading">
				{$t.sections.awards}
			</h2>
			<div class="section-body">
				<div class="awards-grid">
					{#each $t.resume.awards as award}
						<article class="award-item">
							<div class="award-header">
								<h3 class="award-name">
									{#if award.link}
										<a href={award.link} target="_blank" rel="noopener noreferrer" class="award-link">
											{award.name}
										</a>
									{:else}
										{award.name}
									{/if}
								</h3>
								<span class="award-date">{award.date}</span>
							</div>
							<p class="award-org">{award.organization}</p>
							<p class="award-result">{award.result}</p>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- 구분선 -->
		<hr class="section-divider" />

		<!-- Certificates 섹션 -->
		<section
			class="content-section animate-on-scroll"
			aria-labelledby="certificates-heading"
			bind:this={sections[7]}
		>
			<h2 id="certificates-heading" class="section-heading">
				{$t.sections.certificates}
			</h2>
			<div class="section-body">
				<div class="certificates-grid">
					{#each $t.resume.certificates as cert}
						<article class="certificate-item">
							<h3 class="certificate-name">{cert.name}</h3>
							<p class="certificate-issuer">{cert.issuer}</p>
							<p class="certificate-date">{cert.date}</p>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- 구분선 -->
		<hr class="section-divider" />

		<!-- Education 섹션 -->
		<section
			class="content-section animate-on-scroll"
			aria-labelledby="education-heading"
			bind:this={sections[8]}
		>
			<h2 id="education-heading" class="section-heading">
				{$t.sections.education}
			</h2>
			<div class="section-body">
				{#each $t.resume.education as edu}
					<article class="education-item">
						<div class="education-header">
							<div>
								<h3 class="education-institution">{edu.institution}</h3>
								<p class="education-degree">
									{edu.degree} · {edu.major}
								</p>
							</div>
							<span class="education-period">{edu.period}</span>
						</div>
						{#if edu.gpa}
							<p class="education-gpa">GPA: {edu.gpa}</p>
						{/if}
						{#if edu.courses && edu.courses.length > 0}
							<div class="education-courses">
								{#each edu.courses as course}
									<span class="course-tag">{course}</span>
								{/each}
							</div>
						{/if}
					</article>
				{/each}
			</div>
		</section>
	</main>

	<!-- 푸터 -->
	<footer class="page-footer no-print">
		<div class="section-container">
			<p class="footer-text">&copy; {new Date().getFullYear()} Wonseok Shin. All rights reserved.</p>
		</div>
	</footer>
</div>

<style>
	/* ===== 플로팅 컨트롤 ===== */
	.floating-control {
		position: fixed;
		top: var(--space-4);
		right: var(--space-4);
		z-index: var(--z-fixed);
	}

	@media (min-width: 768px) {
		.floating-control {
			top: var(--space-6);
			right: var(--space-6);
		}
	}

	@media (min-width: 1024px) {
		.floating-control {
			top: var(--space-8);
			right: var(--space-8);
		}
	}

	.floating-control-inner {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1);
		border-radius: var(--space-3);
		background: var(--color-surface-elevated);
		background: color-mix(in srgb, var(--color-surface-elevated) 90%, transparent);
		border: 1px solid var(--color-border);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	/* ===== 페이지 콘텐츠 ===== */
	.page-content {
		padding-top: var(--space-8);
		padding-bottom: var(--space-16);
	}

	@media (min-width: 768px) {
		.page-content {
			padding-top: var(--space-12);
			padding-bottom: var(--space-20);
		}
	}

	@media (min-width: 1024px) {
		.page-content {
			padding-top: var(--space-16);
			padding-bottom: var(--space-24);
		}
	}

	/* ===== Hero 섹션 ===== */
	.hero-section {
		margin-bottom: var(--section-gap);
	}

	.hero-layout {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	@media (min-width: 768px) {
		.hero-layout {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-start;
			gap: var(--space-8);
		}
	}

	.hero-name {
		font-size: 1.875rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: var(--space-2);
	}

	@media (min-width: 768px) {
		.hero-name {
			font-size: 2.25rem;
		}
	}

	@media (min-width: 1024px) {
		.hero-name {
			font-size: 2.5rem;
		}
	}

	.hero-title {
		font-size: 1.125rem;
		color: var(--color-secondary);
	}

	.contact-icons {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.contact-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		padding: var(--space-2);
		border-radius: var(--space-2);
		color: var(--color-secondary);
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			transform 100ms var(--ease-out);
	}

	.contact-link:hover {
		color: var(--color-primary);
		background-color: var(--color-surface);
	}

	.contact-link:active {
		background-color: var(--color-border);
		transform: scale(0.98);
	}

	@media (hover: none) {
		.contact-link:active {
			transform: scale(0.96);
		}
	}

	/* ===== 구분선 ===== */
	.section-divider {
		border: none;
		border-top: 1px dashed var(--color-border);
		margin: 0;
	}

	/* ===== 콘텐츠 섹션 ===== */
	.content-section {
		padding-top: var(--section-padding);
		padding-bottom: var(--section-padding);
	}

	.section-heading {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-8);
	}

	@media (min-width: 768px) {
		.section-heading {
			font-size: 1.25rem;
			margin-bottom: var(--space-10);
		}
	}

	.section-body {
		/* 본문 컨테이너 */
	}

	.body-text {
		font-size: 1rem;
		color: var(--color-secondary);
		line-height: 1.75;
	}

	/* ===== About 섹션 ===== */
	.about-summary {
		margin-bottom: var(--space-6);
	}

	.highlight-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.highlight-item {
		position: relative;
		padding-left: var(--space-5);
		margin-bottom: var(--space-2);
		font-size: 0.9375rem;
		color: var(--color-secondary);
		line-height: 1.6;
	}

	.highlight-item::before {
		content: '•';
		position: absolute;
		left: var(--space-2);
		color: var(--color-muted);
	}

	/* ===== Experience 섹션 ===== */
	.experience-item {
		/* 경력 아이템 */
	}

	.mt-experience {
		margin-top: var(--space-10);
	}

	.experience-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	@media (min-width: 640px) {
		.experience-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-start;
		}
	}

	.experience-company-info {
		/* 회사 정보 */
	}

	.experience-company {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-1);
	}

	.experience-position {
		font-size: 0.9375rem;
		color: var(--color-secondary);
	}

	.experience-period {
		font-size: 0.875rem;
		color: var(--color-muted);
		white-space: nowrap;
	}

	.experience-description {
		font-size: 0.9375rem;
		color: var(--color-secondary);
		margin-bottom: var(--space-6);
		line-height: 1.6;
	}

	.achievement-block {
		margin-bottom: var(--space-6);
	}

	.achievement-block:last-child {
		margin-bottom: 0;
	}

	.achievement-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-3);
		padding-left: var(--space-3);
		border-left: 2px solid var(--color-border-hover);
	}

	.achievement-details {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.achievement-detail {
		position: relative;
		padding-left: var(--space-5);
		margin-bottom: var(--space-2);
		font-size: 0.875rem;
		color: var(--color-secondary);
		line-height: 1.6;
	}

	.achievement-detail::before {
		content: '–';
		position: absolute;
		left: var(--space-2);
		color: var(--color-muted);
	}

	/* ===== Skills 섹션 ===== */
	.skill-category {
		margin-bottom: var(--space-6);
	}

	.skill-category:last-child {
		margin-bottom: 0;
	}

	.skill-category-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-3);
	}

	.skill-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.skill-tag {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-4);
		background: var(--color-card-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-width: 140px;
		max-width: 220px;
	}

	.skill-tag-name {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-primary);
	}

	.skill-tag-context {
		font-size: 0.75rem;
		color: var(--color-muted);
		line-height: 1.4;
	}

	/* ===== Opensource 섹션 ===== */
	.opensource-item {
		/* 오픈소스 아이템 */
	}

	.opensource-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-3);
	}

	@media (min-width: 640px) {
		.opensource-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}

	.opensource-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-primary);
	}

	.opensource-period {
		font-size: 0.875rem;
		color: var(--color-muted);
	}

	.opensource-description {
		font-size: 0.9375rem;
		color: var(--color-secondary);
		line-height: 1.6;
		margin-bottom: var(--space-4);
	}

	.opensource-contributions {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-4) 0;
	}

	.contribution-item {
		position: relative;
		padding-left: var(--space-5);
		margin-bottom: var(--space-2);
		font-size: 0.875rem;
		color: var(--color-secondary);
		line-height: 1.6;
	}

	.contribution-item::before {
		content: '•';
		position: absolute;
		left: var(--space-2);
		color: var(--color-muted);
	}

	.opensource-links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.opensource-link {
		display: inline-flex;
		align-items: center;
		font-size: 0.8125rem;
		color: var(--color-secondary);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.opensource-link:hover {
		color: var(--color-primary);
	}

	.opensource-link svg {
		margin-left: var(--space-1);
	}

	/* ===== Activities 섹션 ===== */
	.activity-item {
		/* 활동 아이템 */
	}

	.activity-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	@media (min-width: 640px) {
		.activity-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-start;
		}
	}

	.activity-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-1);
	}

	.activity-org {
		font-size: 0.875rem;
		color: var(--color-secondary);
	}

	.activity-period {
		font-size: 0.875rem;
		color: var(--color-muted);
	}

	.activity-description {
		font-size: 0.9375rem;
		color: var(--color-secondary);
		line-height: 1.6;
		margin-bottom: var(--space-4);
	}

	.activity-highlights {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.activity-highlight {
		position: relative;
		padding-left: var(--space-5);
		margin-bottom: var(--space-2);
		font-size: 0.875rem;
		color: var(--color-secondary);
		line-height: 1.6;
	}

	.activity-highlight::before {
		content: '•';
		position: absolute;
		left: var(--space-2);
		color: var(--color-muted);
	}

	/* ===== Awards 섹션 ===== */
	.awards-grid {
		display: grid;
		gap: var(--space-6);
	}

	@media (min-width: 640px) {
		.awards-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.award-item {
		padding: var(--space-4);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--space-2);
	}

	.award-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-2);
	}

	@media (min-width: 480px) {
		.award-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-start;
		}
	}

	.award-name {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-primary);
		line-height: 1.4;
	}

	.award-link {
		color: inherit;
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.award-link:hover {
		color: var(--color-secondary);
	}

	.award-date {
		font-size: 0.8125rem;
		color: var(--color-muted);
		white-space: nowrap;
	}

	.award-org {
		font-size: 0.8125rem;
		color: var(--color-secondary);
		margin-bottom: var(--space-1);
	}

	.award-result {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-primary);
	}

	/* ===== Certificates 섹션 ===== */
	.certificates-grid {
		display: grid;
		gap: var(--space-4);
	}

	@media (min-width: 640px) {
		.certificates-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.certificate-item {
		padding: var(--space-4);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--space-2);
	}

	.certificate-name {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-2);
	}

	.certificate-issuer {
		font-size: 0.8125rem;
		color: var(--color-secondary);
		margin-bottom: var(--space-1);
	}

	.certificate-date {
		font-size: 0.8125rem;
		color: var(--color-muted);
	}

	/* ===== Education 섹션 ===== */
	.education-item {
		/* 학력 아이템 */
	}

	.education-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	@media (min-width: 640px) {
		.education-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-start;
		}
	}

	.education-institution {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-1);
	}

	.education-degree {
		font-size: 0.9375rem;
		color: var(--color-secondary);
	}

	.education-period {
		font-size: 0.875rem;
		color: var(--color-muted);
	}

	.education-gpa {
		font-size: 0.875rem;
		color: var(--color-secondary);
		margin-bottom: var(--space-3);
	}

	.education-courses {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.course-tag {
		display: inline-flex;
		padding: var(--space-1) var(--space-2);
		font-size: 0.75rem;
		color: var(--color-secondary);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--space-1);
	}

	/* ===== 푸터 ===== */
	.page-footer {
		border-top: 1px solid var(--color-border);
		padding: var(--space-8) 0;
	}

	@media (min-width: 1024px) {
		.page-footer {
			padding: var(--space-10) 0;
		}
	}

	.footer-text {
		font-size: 0.875rem;
		color: var(--color-muted);
		text-align: center;
	}
</style>
