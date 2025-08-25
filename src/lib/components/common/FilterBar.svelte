<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Search, Plus, RefreshCw, Download, Trash2 } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';

	export let searchValue = '';
	export let searchPlaceholder = '검색...';
	export let createLabel = '추가';
	export let selectedCount = 0;
	export let loading = false;

	const dispatch = createEventDispatcher();

	let searchTimer: ReturnType<typeof setTimeout>;

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		if (searchTimer) clearTimeout(searchTimer);

		searchTimer = setTimeout(() => {
			dispatch('search', value);
		}, 300);
	}
</script>

<div
	class="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between"
>
	<!-- Left side: Search and Filters -->
	<div class="flex flex-1 items-center gap-3">
		<!-- Search -->
		<div class="relative flex-1 sm:max-w-xs">
			<Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
			<input
				type="text"
				bind:value={searchValue}
				on:input={handleSearchInput}
				placeholder={searchPlaceholder}
				class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			/>
		</div>

		<!-- Filter Slot -->
		<slot name="filters" />
	</div>

	<!-- Right side: Action Buttons -->
	<div class="flex items-center gap-2">
		{#if selectedCount > 0}
			<Button
				variant="danger"
				size="sm"
				on:click={() => dispatch('bulkDelete')}
				class="whitespace-nowrap"
			>
				<Trash2 class="h-4 w-4" />
				<span class="hidden sm:inline">삭제 ({selectedCount})</span>
			</Button>
		{/if}

		<Button
			variant="outline"
			size="sm"
			on:click={() => dispatch('refresh')}
			disabled={loading}
			title="새로고침"
			class="whitespace-nowrap"
		>
			<RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
			<span class="hidden sm:inline">새로고침</span>
		</Button>

		<slot name="actions" />

		<Button
			variant="outline"
			size="sm"
			on:click={() => dispatch('export')}
			class="hidden whitespace-nowrap sm:flex"
		>
			<Download class="h-4 w-4" />
			<span>엑셀</span>
		</Button>

		<Button
			variant="primary"
			size="sm"
			on:click={() => dispatch('create')}
			class="whitespace-nowrap"
		>
			<Plus class="h-4 w-4" />
			<span class="hidden sm:inline">{createLabel}</span>
		</Button>
	</div>
</div>
