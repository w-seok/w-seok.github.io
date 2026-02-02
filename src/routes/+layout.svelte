<script lang="ts">
	/**
	 * @file 루트 레이아웃 컴포넌트
	 * @description 전역 스타일과 레이아웃 적용
	 */

	import '../app.css';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<meta name="description" content="w-seok - Software Engineer" />
	<meta property="og:title" content="w-seok | Software Engineer" />
	<meta property="og:description" content="Pursuing clarity in an intricate world" />
	<meta property="og:type" content="profile" />
</svelte:head>

{@render children()}
