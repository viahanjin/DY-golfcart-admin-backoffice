<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Search, Plus, RefreshCw, Download, Trash2 } from 'lucide-svelte';

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
	class="mb-4 flex flex-col gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between"
>
	<!-- Left side: Search and Filters -->
	<div class="flex flex-1 items-center gap-2">
		<!-- Search -->
		<div class="relative flex-1 sm:max-w-xs">
			<Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
			<input
				type="text"
				bind:value={searchValue}
				on:input={handleSearchInput}
				placeholder={searchPlaceholder}
				class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			/>
		</div>

		<!-- Filter Slot -->
		<slot name="filters" />
	</div>

	<!-- Right side: Action Buttons -->
	<div class="flex items-center gap-2">
		{#if selectedCount > 0}
			<button
				on:click={() => dispatch('bulkDelete')}
				class="flex items-center gap-2 whitespace-nowrap rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 sm:px-4"
			>
				<Trash2 class="h-4 w-4" />
				<span class="hidden sm:inline">삭제 ({selectedCount})</span>
			</button>
		{/if}

		<button
			on:click={() => dispatch('refresh')}
			disabled={loading}
			title="새로고침"
			class="flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
		>
			<RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
			<span class="hidden sm:inline">새로고침</span>
		</button>

		<slot name="actions" />

		<button
			on:click={() => dispatch('export')}
			class="hidden items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:flex"
		>
			<Download class="h-4 w-4" />
			<span>엑셀</span>
		</button>

		<button
			on:click={() => dispatch('create')}
			class="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:px-4"
		>
			<Plus class="h-4 w-4" />
			<span class="hidden sm:inline">{createLabel}</span>
		</button>
	</div>
</div>
