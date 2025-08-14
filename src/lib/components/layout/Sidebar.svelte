<script lang="ts">
	import { page } from '$app/stores';
	import { MENU_ITEMS } from '../../constants/navigation';
	import { Activity } from 'lucide-svelte';

	export let isOpen = true;

	// 현재 경로 추적
	$: currentPath = $page.url.pathname;

	// 활성 메뉴 찾기 (간단한 헬퍼)
	$: activeMenu = MENU_ITEMS.find((item: { path: string }) => currentPath === item.path);

	// 개발 환경 로깅
	$: if (import.meta.env.DEV) {
		console.log('📍 Current path:', currentPath);
	}
</script>

<!-- 사이드바 -->
<div
	class="flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 {isOpen
		? 'w-64'
		: 'w-16'}"
>
	<!-- 사이드바 헤더 -->
	<div class="border-b border-gray-200 p-4 dark:border-gray-700">
		{#if isOpen}
			<div class="flex items-center gap-2">
				<Activity class="h-5 w-5 text-blue-600" />
				<span class="font-semibold text-gray-900 dark:text-white">관제 메뉴</span>
			</div>
		{:else}
			<div class="flex justify-center">
				<Activity class="h-6 w-6 text-blue-600" />
			</div>
		{/if}
	</div>

	<!-- 메뉴 항목들 -->
	<nav class="flex-1 overflow-y-auto p-2">
		<ul class="space-y-1">
			{#each MENU_ITEMS as item (item.id)}
				{@const isActive = currentPath === item.path}
				<li>
					<a
						href={item.path}
						class="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors
							{isActive
							? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
							: 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}"
						title={isOpen ? '' : item.label}
						aria-current={isActive ? 'page' : undefined}
					>
						<!-- 아이콘 -->
						<svelte:component
							this={item.icon}
							class="h-5 w-5 flex-shrink-0 {isActive
								? 'text-blue-600 dark:text-blue-400'
								: 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'}"
						/>

						<!-- 라벨 -->
						{#if isOpen}
							<div class="min-w-0 flex-1">
								<div class="truncate">{item.label}</div>
								<div class="truncate text-xs text-gray-500 dark:text-gray-400">
									{item.description}
								</div>
							</div>
						{/if}

						<!-- 활성 상태 표시 -->
						{#if isActive}
							<div class="h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- 사이드바 하단 -->
	<div class="border-t border-gray-200 p-4 dark:border-gray-700">
		{#if isOpen}
			<div class="text-xs text-gray-500 dark:text-gray-400">
				<div class="mb-1 flex items-center gap-1">
					<div class="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
					<span>시스템 정상</span>
				</div>
				<div>버전: v1.0.0</div>

				<!-- 개발 환경에서만 디버깅 정보 -->
				{#if import.meta.env.DEV}
					<div class="mt-2 rounded bg-gray-800 p-2 text-xs">
						<div class="text-white">현재: {currentPath}</div>
						<div class="text-green-300">활성: {activeMenu?.label || '없음'}</div>
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex justify-center">
				<div class="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
			</div>
		{/if}
	</div>
</div>
