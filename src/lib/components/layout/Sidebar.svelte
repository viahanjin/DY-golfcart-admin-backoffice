<script lang="ts">
	import { page } from '$app/stores';
	import {
		MENU_ITEMS,
		MENU_SECTIONS,
		getMenuItemsBySection,
		type NavMenuItem
	} from '$lib/constants/navigation';
	import { ChevronDown } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	export let isOpen = true;

	let openMenus: Record<string, boolean> = {};

	// 현재 경로가 변경될 때마다 활성 메뉴에 따라 상위 메뉴를 열어줌
	$: {
		const currentPath = $page.url.pathname;
		const activeParent = MENU_ITEMS.find((item) =>
			item.children?.some((child) => child.path === currentPath)
		);
		if (activeParent) {
			openMenus[activeParent.id] = true;
		}
	}

	function toggleMenu(id: string) {
		openMenus[id] = !openMenus[id];
	}
</script>

<aside
	class="flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 {isOpen
		? 'w-64'
		: 'w-20'}"
>
	<!-- 메뉴 -->
	<nav class="flex-1 overflow-y-auto p-4">
		{#each MENU_SECTIONS as section (section)}
			<div class="mb-6">
				{#if isOpen}
					<div class="mb-3 px-2">
						<h3
							class="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
						>
							{section}
						</h3>
					</div>
				{/if}

				<div class="space-y-1">
					{#each getMenuItemsBySection(section) as item (item.id)}
						{@const isActive = item.path === $page.url.pathname}
						{@const isParentActive = item.children?.some(
							(child) => child.path === $page.url.pathname
						)}

						{#if item.children}
							<!-- 하위 메뉴가 있는 경우 -->
							<div>
								<button
									on:click={() => toggleMenu(item.id)}
									class="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									<div class="flex items-center gap-3">
										<svelte:component
											this={item.icon}
											class="h-5 w-5 {isParentActive
												? 'text-blue-500'
												: 'text-gray-500 dark:text-gray-400'}"
										/>
										{#if isOpen}
											<span
												class="font-medium {isParentActive
													? 'text-blue-600 dark:text-blue-300'
													: 'text-gray-700 dark:text-gray-200'}">{item.label}</span
											>
										{/if}
									</div>
									{#if isOpen}
										<ChevronDown
											class="h-4 w-4 transform text-gray-500 transition-transform duration-200 dark:text-gray-400 {openMenus[
												item.id
											]
												? 'rotate-180'
												: ''}"
										/>
									{/if}
								</button>
								{#if openMenus[item.id] && isOpen}
									<ul class="mt-1 space-y-1 pl-6" transition:slide={{ duration: 200 }}>
										{#each item.children as child (child.id)}
											{@const isChildActive = child.path === $page.url.pathname}
											<li>
												<a
													href={child.path}
													class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 {isChildActive
														? 'bg-blue-50 font-semibold text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
														: 'text-gray-600 dark:text-gray-300'}"
												>
													<svelte:component this={child.icon} class="h-4 w-4" />
													{child.label}
												</a>
											</li>
										{/each}
									</ul>
								{/if}
							</div>
						{:else}
							<!-- 하위 메뉴가 없는 경우 -->
							<a
								href={item.path}
								class="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors {isActive
									? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
									: 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}"
							>
								<svelte:component
									this={item.icon}
									class="h-5 w-5 {isActive ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}"
								/>
								{#if isOpen}
									<span class="font-medium">{item.label}</span>
								{/if}
							</a>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</nav>

	<!-- 푸터 -->
	<div class="mt-auto border-t p-4 dark:border-gray-700">
		<!-- 푸터 내용 -->
	</div>
</aside>
