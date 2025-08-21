<script context="module" lang="ts">
	import type { ComponentType } from 'svelte';
	
	// Type exports must be in module context
	export type StatItem = {
		label: string;
		value: number | string;
		icon: ComponentType;
		color?: string;
	};
</script>

<script lang="ts">
	export let stats: StatItem[] = [];
</script>

<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	{#each stats as stat}
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div
					class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg {stat.color
						? `${stat.color.replace('text-', 'bg-')} bg-opacity-10`
						: 'bg-gray-100 dark:bg-gray-700'}"
				>
					<svelte:component this={stat.icon} class="h-6 w-6 {stat.color || 'text-gray-500'}" />
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
				</div>
			</div>
		</div>
	{/each}
</div>
