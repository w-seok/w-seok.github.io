<script lang="ts">
	/**
	 * @file 메인 이력서 페이지
	 * @description jejeeun 스타일 + Toss/Daangn UX - 반응형 여백 시스템
	 */

	import { onMount } from 'svelte';
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
			<!-- 언어 선택 드롭다운 -->
			<div class="relative lang-menu-container">
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
					<div class="dropdown-menu" role="menu">
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
				<p class="body-text">
					{$t.header.subtitle}
				</p>
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
				<div class="card">
					<p class="text-secondary">경력 정보가 여기에 표시됩니다.</p>
				</div>
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
				<div class="skill-tags">
					<span class="skill-tag">Java</span>
					<span class="skill-tag">Spring</span>
					<span class="skill-tag">TypeScript</span>
					<span class="skill-tag">React</span>
					<span class="skill-tag">Node.js</span>
				</div>
			</div>
		</section>
	</main>

	<!-- 푸터 -->
	<footer class="page-footer no-print">
		<div class="section-container">
			<p class="footer-text">&copy; {new Date().getFullYear()} {getName($locale)}</p>
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
		text-align: center;
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

	/* ===== 스킬 태그 ===== */
	.skill-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		justify-content: center;
	}

	.skill-tag {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-3);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-secondary);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--space-2);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.skill-tag:hover {
		border-color: var(--color-border-hover);
		background-color: var(--color-surface-elevated);
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
