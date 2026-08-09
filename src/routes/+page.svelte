<script lang="ts">
	/**
	 * @file 메인 이력서 페이지
	 * @description jejeeun 스타일 + Toss/Daangn UX - 반응형 여백 시스템
	 */

	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { locale, t, type Locale } from '$lib/i18n';
	import type { SectionTranslation } from '$lib/i18n/types';
	import { theme } from '$lib/stores/theme';

	let sections: HTMLElement[] = $state([]);
	let isLangMenuOpen = $state(false);
	let scrollProgress = $state(0);
	let activeSection = $state<keyof SectionTranslation>('about');

	/**
	 * 목차와 활성 섹션 추적에 사용하는 섹션 순서
	 * @description 문서에 배치된 순서와 일치해야 한다
	 */
	const SECTION_IDS: (keyof SectionTranslation)[] = [
		'about',
		'experience',
		'skills',
		'opensource',
		'activities',
		'awards',
		'certificates',
		'education'
	];

	/** 문서 끝 판정 여유 - 브라우저마다 소수점 오차가 있어 완전히 0이 되지 않는다 */
	const SCROLL_END_TOLERANCE_PX = 4;

	/**
	 * 스크롤 진행률과 현재 보고 있는 섹션을 갱신
	 * @description 진행률은 문서 길이를 암시하고, 활성 섹션은 목차에서 현재 위치를 표시한다.
	 * 활성 섹션은 "화면을 가장 많이 차지한 섹션"으로 정한다. 특정 지점을 넘었는지로 판정하면
	 * 긴 섹션의 제목이 기준선 아래에 있는 동안 이전 섹션이 계속 활성으로 남는다.
	 */
	function updateScrollState() {
		const max = document.documentElement.scrollHeight - window.innerHeight;
		scrollProgress = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;

		// 문서 끝에서는 마지막 섹션을 활성으로 둔다.
		// 마지막 섹션이 짧으면 화면 점유량으로는 1위가 될 수 없기 때문이다.
		if (max > 0 && max - window.scrollY <= SCROLL_END_TOLERANCE_PX) {
			activeSection = SECTION_IDS[SECTION_IDS.length - 1];
			return;
		}

		// 상단 바가 가리는 영역은 "보이는 영역"에서 제외한다
		const barBottom = document.querySelector('.top-bar')?.getBoundingClientRect().bottom ?? 0;
		let current = SECTION_IDS[0];
		let widest = -1;
		for (const id of SECTION_IDS) {
			const section = document.getElementById(`${id}-heading`)?.closest('.content-section');
			if (!section) continue;
			const rect = section.getBoundingClientRect();
			const visible = Math.min(window.innerHeight, rect.bottom) - Math.max(barBottom, rect.top);
			if (visible > widest) {
				widest = visible;
				current = id;
			}
		}
		activeSection = current;
	}

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
		// threshold는 "요소 전체 높이 대비 비율"이므로 긴 섹션일수록 더 많이 보여야 발화한다.
		// 경력 섹션(2,700px)은 첫 화면에 180px이 보여도 6.7%라 0.1을 넘지 못해 빈 칸으로 남았다.
		// 0으로 두면 1px이라도 들어오는 순간 발화한다.
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
					}
				}
			},
			{ threshold: 0, rootMargin: '0px 0px -50px 0px' }
		);

		// 첫 화면에 이미 들어와 있는 섹션은 스크롤로 도달한 것이 아니므로 즉시 노출한다.
		// 등장 애니메이션은 사용자가 스크롤해서 만나는 섹션에만 의미가 있다.
		for (const section of sections) {
			if (section && section.getBoundingClientRect().top < window.innerHeight) {
				section.classList.add('visible');
			}
		}

		for (const section of sections) {
			if (section) observer.observe(section);
		}

		document.addEventListener('click', handleClickOutside);
		window.addEventListener('scroll', updateScrollState, { passive: true });
		window.addEventListener('resize', updateScrollState);
		updateScrollState();

		return () => {
			observer.disconnect();
			document.removeEventListener('click', handleClickOutside);
			window.removeEventListener('scroll', updateScrollState);
			window.removeEventListener('resize', updateScrollState);
		};
	});
</script>

<svelte:head>
	<title>{getName($locale)} | {$t.header.title}</title>
</svelte:head>

<div class="min-h-screen bg-background text-primary" class:dark={$theme === 'dark'}>
	<!-- 스크롤 진행 바: 문서 길이를 암시한다 -->
	<div class="scroll-progress no-print" aria-hidden="true">
		<div class="scroll-progress-bar" style="width: {scrollProgress}%"></div>
	</div>

	<!-- 오른쪽 세로 목차 레일: 본문 텍스트 바깥 여백에 놓아 읽기를 방해하지 않는다 -->
	<nav class="side-nav no-print" aria-label={$t.common.tableOfContents}>
		<ul class="side-nav-list">
			{#each SECTION_IDS as id}
				<li>
					<a
						href="#{id}-heading"
						class="side-nav-link"
						class:active={activeSection === id}
						aria-current={activeSection === id ? 'true' : undefined}
					>
						<span class="side-nav-label">{$t.sections[id]}</span>
						<span class="side-nav-dash" aria-hidden="true"></span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

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
					<p class="hero-title">
						{$t.header.title}<span class="hero-role">{$t.header.summary}</span>
					</p>
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
				<div class="about-summary">
					{#each $t.resume.about.summary.split('\n\n') as paragraph}
						<p class="body-text about-paragraph">
							{paragraph}
						</p>
					{/each}
				</div>
				{#if $t.resume.about.highlights.length > 0}
					<ul class="highlight-list">
						{#each $t.resume.about.highlights as highlight}
							<li class="highlight-item">{highlight}</li>
						{/each}
					</ul>
				{/if}
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
						{#if exp.stack?.length}
							<ul class="experience-stack" aria-label="{exp.company} 기술 스택">
								{#each exp.stack as tech}
									<li class="experience-stack-item">{tech}</li>
								{/each}
							</ul>
						{/if}
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
	/* Hero는 이름·직함 2줄뿐인 얕은 블록이라 --section-gap(2560px에서 80px)을 쓰면
	   섹션 간 여백(56+56=112px)보다 커져 페이지 상단이 비어 보인다.
	   섹션과 같은 리듬을 쓰도록 --section-padding으로 맞춘다. */
	.hero-section {
		margin-bottom: var(--section-padding);
	}

	.hero-layout {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* 768~1023px에서는 본문이 화면 폭을 거의 채워, 가로 배치 시 연락처 아이콘이
	   우측 상단 고정 컨트롤에 가려진다(768px 2개·864px 1개). 여백이 확보되는 1024px부터 가로로 둔다. */
	@media (min-width: 1024px) {
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

	/* 현재 역할은 직함과 같은 줄에 덧붙인다. 별도 문단으로 두면 바로 아래 '소개'와 요약이 두 번 반복된다.
	   구분자는 마크업이 아닌 CSS로 넣어 좌우 간격을 정확히 제어한다 */
	.hero-role {
		color: var(--color-muted);
	}

	.hero-role::before {
		content: '·';
		margin: 0 0.45em;
	}

	/* ===== 스크롤 진행 바 ===== */
	.scroll-progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		z-index: 50;
		pointer-events: none;
	}

	.scroll-progress-bar {
		height: 100%;
		background: var(--color-marker);
	}

	/* ===== 오른쪽 세로 목차 레일 ===== */
	/* 본문 텍스트 끝과 화면 끝 사이 여백에 놓는다(864px에서 104px).
	   좁은 폭은 여백이 20px뿐이라 감춘다 - 목차 없이도 문서 이용에 지장이 없다. */
	.side-nav {
		display: none;
	}

	@media (min-width: 768px) {
		.side-nav {
			display: block;
			position: fixed;
			right: var(--space-4);
			top: 50%;
			transform: translateY(-50%);
			z-index: var(--z-fixed);
		}
	}

	.side-nav-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.side-nav-link {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		height: 24px;
		text-decoration: none;
	}

	/* 라벨은 기본적으로 감추고 대시만 남겨 시야를 방해하지 않는다.
	   여백이 좁은 768~1023px에서는 hover/focus 때만 드러낸다. */
	.side-nav-label {
		/* absolute로 빼야 레일 박스 폭이 대시 크기로 유지된다.
		   흐름에 두면 숨긴 상태에서도 폭을 차지해 본문 위를 덮는다. */
		position: absolute;
		right: calc(100% + var(--space-2));
		font-size: 0.75rem;
		color: var(--color-secondary);
		white-space: nowrap;
		opacity: 0;
		transform: translateX(var(--space-2));
		transition:
			opacity var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}

	.side-nav:hover .side-nav-label,
	.side-nav:focus-within .side-nav-label {
		opacity: 1;
		transform: none;
	}

	/* 여백이 152px 이상 확보되는 폭부터는 라벨을 항상 노출한다 */
	@media (min-width: 1024px) {
		.side-nav-label {
			opacity: 1;
			transform: none;
		}
	}

	/* 현재 위치는 색만으로 알리지 않는다. 길이와 두께를 함께 바꾼다 (규칙 9) */
	.side-nav-dash {
		width: 14px;
		height: 1px;
		background: var(--color-border-hover);
		flex-shrink: 0;
		transition:
			width var(--duration-fast) var(--ease-out),
			height var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.side-nav-link:hover .side-nav-dash {
		background: var(--color-secondary);
	}

	.side-nav-link:hover .side-nav-label {
		color: var(--color-primary);
	}

	.side-nav-link.active .side-nav-dash {
		width: 24px;
		height: 2px;
		background: var(--color-marker);
	}

	.side-nav-link.active .side-nav-label {
		color: var(--color-primary);
		font-weight: 600;
	}

	/* 플로팅 컨트롤 (우측 상단) */
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
	/* 화면에서는 섹션 상하 여백(각 48px)만으로 구분이 충분하므로 선을 숨긴다.
	   여백이 20px로 줄어드는 인쇄에서만 선을 표시한다(@media print). */
	.section-divider {
		display: none;
	}

	/* ===== 콘텐츠 섹션 ===== */
	.content-section {
		padding-top: var(--section-padding);
		padding-bottom: var(--section-padding);
	}

	/* 마지막 자식의 margin-bottom이 마진 상쇄로 섹션 밖에 새어나와
	   구분선 위 여백만 24px 늘어나는 것을 차단한다 (위/아래 대칭 유지) */
	.section-body > *:last-child {
		margin-bottom: 0;
	}

	.section-heading {
		/* 목차로 이동했을 때 제목이 상단 바(약 71px) 뒤로 숨지 않도록 여유를 둔다 */
		scroll-margin-top: var(--space-24);
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--color-primary);
		margin-bottom: var(--space-8);
	}

	@media (min-width: 768px) {
		.section-heading {
			font-size: 1.625rem;
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

	.about-paragraph {
		margin-bottom: var(--space-5);
	}

	.about-paragraph:last-child {
		margin-bottom: 0;
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

	/* 회사 전환은 성과 전환(24px)보다 큰 경계다. 섹션 > 회사 > 성과 순서를 모든 폭에서 유지한다.
	   좁은 폭에서는 섹션 간격도 64px까지 줄어들므로 회사 간격을 40px로 낮춰 단계를 보존한다. */
	.mt-experience {
		margin-top: var(--space-10);
	}

	@media (min-width: 768px) {
		.mt-experience {
			margin-top: var(--space-16);
		}
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
		font-size: 1.1875rem;
		font-weight: 700;
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
		margin-bottom: var(--space-4);
		line-height: 1.6;
	}

	.experience-stack {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-6);
	}

	.experience-stack-item {
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--color-secondary);
		background: var(--color-surface);
		border-radius: var(--space-1);
		padding: 0.15em 0.55em;
		white-space: nowrap;
	}

	.achievement-block {
		margin-bottom: var(--space-6);
	}

	.achievement-block:last-child {
		margin-bottom: 0;
	}

	.achievement-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-3);
		padding-left: var(--space-3);
		border-left: 4px solid var(--color-marker);
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
		min-height: 24px;
		color: var(--color-secondary);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.25em;
		display: inline-flex;
		align-items: center;
		font-size: 0.8125rem;
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
		display: inline-flex;
		align-items: center;
		min-height: 24px;
		color: inherit;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-decoration-color: var(--color-border-hover);
		text-underline-offset: 0.25em;
		line-height: 1.5;
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

	@media print {
		.page-content {
			padding-top: var(--space-4);
			padding-bottom: var(--space-8);
		}

		.hero-section {
			margin-bottom: var(--space-6);
		}

		.section-heading,
		.experience-header,
		.experience-description,
		.achievement-title,
		.opensource-header,
		.opensource-description,
		.activity-header,
		.activity-description,
		.award-header,
		.certificate-name,
		.education-header,
		.skill-category-title {
			break-after: avoid;
			page-break-after: avoid;
		}

		.experience-header,
		.achievement-block,
		.opensource-item,
		.activity-item,
		.award-item,
		.certificate-item,
		.education-item,
		.skill-category,
		.skill-tags,
		.skill-tag {
			break-inside: avoid;
			page-break-inside: avoid;
		}

		.section-divider {
			display: block;
			border: none;
			border-top: 1px solid var(--color-border);
			margin: 0;
		}

		.content-section {
			padding-top: var(--space-5);
			padding-bottom: var(--space-5);
		}

		.section-heading {
			margin-bottom: var(--space-4);
		}

		.experience-header {
			margin-bottom: var(--space-3);
		}

		.mt-experience {
			margin-top: var(--space-8);
		}

		.experience-description,
		.achievement-block {
			margin-bottom: var(--space-3);
		}

		.experience-description {
			line-height: 1.45;
			margin-bottom: var(--space-2);
		}

		.experience-stack {
			gap: 0.25rem;
			margin-bottom: var(--space-3);
		}

		.experience-stack-item {
			font-size: 0.6875rem;
			padding: 0;
			background: transparent;
			color: var(--color-secondary);
		}

		.experience-stack-item:not(:last-child)::after {
			content: ' ·';
		}

		.opensource-header,
		.activity-header,
		.education-header {
			margin-bottom: var(--space-2);
		}

		.opensource-description,
		.activity-description,
		.opensource-contributions {
			margin-bottom: var(--space-3);
		}

		.contribution-item,
		.activity-highlight {
			margin-bottom: var(--space-1);
			line-height: 1.45;
		}

		.achievement-title {
			margin-bottom: var(--space-2);
		}

		.achievement-detail {
			margin-bottom: var(--space-1);
			line-height: 1.45;
		}

		.skill-category {
			margin-bottom: var(--space-4);
		}

		.skill-category-title {
			margin-bottom: var(--space-2);
			font-size: 0.75rem;
		}

		.skill-tags {
			display: grid;
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: var(--space-2);
		}

		.skill-tag {
			min-width: 0;
			max-width: none;
			padding: var(--space-2) var(--space-3);
			border-radius: var(--space-1);
		}

		.skill-tag-name {
			font-size: 0.8125rem;
		}

		.skill-tag-context {
			font-size: 0.6875rem;
			line-height: 1.25;
		}
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
