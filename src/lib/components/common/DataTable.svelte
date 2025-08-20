<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Loader2, CheckSquare, Square } from 'lucide-svelte';
	import type { ColumnDefinition } from '$lib/types/common';

	// --- PROPS ---
	export let items: any[] = [];
	export let columns: ColumnDefinition<any>[] = [];
	export let idKey: string = 'id';

	// --- STATE PROPS (for controlled component behavior) ---
	export let loading: boolean = false;
	export let selectedItems: Set<string | number> = new Set();
	export let sortBy: string = '';
	export let sortOrder: 'asc' | 'desc' = 'asc';

	// --- PAGINATION PROPS ---
	export let page: number = 1;
	export let totalPages: number = 1;
	export let totalItems: number = 0;
	export let itemsPerPage: number = 10;

	// --- EVENTS ---
	const dispatch = createEventDispatcher<{
		sort: string;
		select: string | number;
		selectAll: undefined;
		pageChange: number;
	}>();

	// --- DERIVED STATE ---
	$: allSelected = items.length > 0 && selectedItems.size === items.filter(it => it[idKey]).length;
	$: fromItem = (page - 1) * itemsPerPage + 1;
	$: toItem = Math.min(page * itemsPerPage, totalItems);

	// Declare slots interface
	interface $$Slots {
		'empty-state': {};
		'cell-status': { item: any };
		'cell-actions': { item: any };
		[key: `cell-${string}`]: { item: any };
	}

	// --- HELPERS ---
	// Safely access nested properties like 'address.city'
	function get(obj: any, path: string): any {
		return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
	}
</script>

<div class="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
	{#if loading && items.length === 0}
		<div class="flex h-80 items-center justify-center">
			<Loader2 class="h-8 w-8 animate-spin text-blue-500" />
		</div>
	{:else if items.length === 0}
		<div
			class="flex h-80 flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400"
		>
			<slot name="empty-state">
				<p class="text-lg font-medium">표시할 데이터가 없습니다.</p>
				<p class="mt-1 text-sm">새로운 항목을 추가하거나 필터를 조정해주세요.</p>
			</slot>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
					<tr>
						{#each columns as column}
							<th
								class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 {column.class ||
									''}"
							>
								{#if column.key === 'select'}
									<button
										on:click={() => dispatch('selectAll')}
										class="flex items-center"
										aria-label="Select all items"
									>
										{#if allSelected}
											<CheckSquare class="h-4 w-4 text-blue-600" />
										{:else}
											<Square class="h-4 w-4 text-gray-400" />
										{/if}
									</button>
								{:else if column.sortable}
									<button
										on:click={() => dispatch('sort', column.key)}
										class="flex items-center gap-1 transition-colors hover:text-gray-900 dark:hover:text-white"
									>
										{column.label}
										{#if sortBy === column.key}
											<span class="text-xs transition-transform">
												{sortOrder === 'asc' ? '▲' : '▼'}
											</span>
										{/if}
									</button>
								{:else}
									{column.label}
								{/if}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
					{#each items as item (item[idKey])}
						<tr>
							{#each columns as column (column.key)}
								<td class="whitespace-nowrap px-6 py-4 text-sm {column.class || ''}">
									{#if column.key === 'select'}
										<button
											on:click={() => dispatch('select', item[idKey])}
											aria-label="Select item {item[idKey]}"
										>
											{#if selectedItems.has(item[idKey])}
												<CheckSquare class="h-4 w-4 text-blue-600" />
											{:else}
												<Square class="h-4 w-4 text-gray-400" />
											{/if}
										</button>
									{:else if column.key === 'status'}
										<slot name="cell-status" {item}>
											<span class="font-medium text-white">
												{get(item, String(column.key))}
											</span>
										</slot>
									{:else if column.key === 'actions'}
										<slot name="cell-actions" {item}>
											<span class="font-medium text-white">
												{get(item, String(column.key))}
											</span>
										</slot>
									{:else}
										<span class="font-medium text-white">
											{get(item, String(column.key))}
										</span>
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div
				class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="text-sm text-gray-700 dark:text-gray-200">
					<span class="font-medium">{totalItems}</span>개 중
					<span class="font-medium">{fromItem}</span>-<span class="font-medium">{toItem}</span>
					표시
				</div>
				<div class="flex gap-2">
					<button
						on:click={() => dispatch('pageChange', page - 1)}
						disabled={page === 1}
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:enabled:hover:bg-gray-700"
					>
						이전
					</button>
					<button
						on:click={() => dispatch('pageChange', page + 1)}
						disabled={page === totalPages}
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:enabled:hover:bg-gray-700"
					>
						다음
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
