<script lang="ts">
	import { onMount } from 'svelte';
	import { theme, toggleTheme, watchSystemTheme } from '$lib/stores/theme.store';
	import { Sun, Moon } from 'lucide-svelte';

	// 컴포넌트가 마운트될 때 시스템 테마 감지 시작
	onMount(() => {
		watchSystemTheme();
	});

	function handleToggle() {
		toggleTheme();
	}
</script>

<button
	on:click={handleToggle}
	class="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
	title={$theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
	aria-label={$theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
>
	{#if $theme === 'light'}
		<Moon class="h-5 w-5 transition-transform duration-200" />
	{:else}
		<Sun class="h-5 w-5 transition-transform duration-200" />
	{/if}
</button>

<style>
	/* 버튼 호버 시 아이콘 회전 효과 */
	button:hover :global(.lucide) {
		transform: rotate(180deg);
	}
</style>