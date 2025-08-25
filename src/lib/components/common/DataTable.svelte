<script context="module" lang="ts">
	// Type exports must be in module context
	export type ColumnDefinition<T extends Record<string, any>> = {
		key: (keyof T & string) | 'select' | 'actions';
		label: string;
		sortable?: boolean;
		class?: string; // e.g. 'w-24 text-center'
	};
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Loader2, CheckSquare, Square, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';

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
	$: allSelected =
		items.length > 0 && selectedItems.size === items.filter((it) => it[idKey]).length;
	$: fromItem = (page - 1) * itemsPerPage + 1;
	$: toItem = Math.min(page * itemsPerPage, totalItems);

	// --- HELPERS ---
	// Safely access nested properties like 'address.city'
	function get(obj: any, path: string): any {
		const value = path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);

		// Special formatting for address objects
		if (path === 'address' && value && typeof value === 'object') {
			// Format address object as string
			const parts = [];
			if (value.address1) parts.push(value.address1);
			if (value.address2) parts.push(value.address2);
			return parts.join(' ') || '-';
		}

		// Handle other objects by converting to string
		if (value && typeof value === 'object') {
			return JSON.stringify(value);
		}

		return value ?? '-';
	}

	// Helper function to truncate long text
	function truncateText(text: string, maxLength: number = 40): string {
		if (!text) return '-';
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}
</script>

<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
	{#if loading && items.length === 0}
		<div class="flex h-80 flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
			<Loader2 class="h-8 w-8 animate-spin text-blue-500" />
			<p class="font-medium">데이터를 불러오는 중...</p>
		</div>
	{:else if items.length === 0}
		<div
			class="flex h-80 flex-col items-center justify-center gap-3 text-center text-gray-500 dark:text-gray-400"
		>
			<slot name="empty-state">
				<Inbox class="h-12 w-12 text-gray-400" />
				<p class="text-lg font-medium">표시할 데이터가 없습니다.</p>
				<p class="mt-1 text-sm">새로운 항목을 추가하거나 필터를 조정해주세요.</p>
			</slot>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
					<tr>
						{#each columns as column}
							<th
								class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400 {column.class ||
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
										class="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white"
									>
										{column.label}
										{#if sortBy === column.key}
											{#if sortOrder === 'asc'}
												<ArrowUp class="h-3 w-3" />
											{:else}
												<ArrowDown class="h-3 w-3" />
											{/if}
										{:else}
											<ArrowUpDown class="h-3 w-3 text-gray-400" />
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
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
							{#each columns as column (column.key)}
								<td class="px-4 py-3 text-sm whitespace-nowrap {column.class || ''}">
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
									{:else if column.key === 'actions' && $$slots['cell-actions']}
										<slot name="cell-actions" {item} />
									{:else if column.key === 'status' && $$slots['cell-status']}
										<slot name="cell-status" {item} />
									{:else if column.key === 'cartStatus.currentState' && $$slots['cell-cartStatus.currentState']}
										<slot name="cell-cartStatus.currentState" {item} />
									{:else if column.key === 'mapStatus.status' && $$slots['cell-mapStatus.status']}
										<slot name="cell-mapStatus.status" {item} />
									{:else if column.key === 'mapStatus.validationStatus' && $$slots['cell-mapStatus.validationStatus']}
										<slot name="cell-mapStatus.validationStatus" {item} />
									{:else if column.key === 'lastModified' && $$slots['cell-lastModified']}
										<slot name="cell-lastModified" {item} />
									{:else if column.key === 'updatedAt' && $$slots['cell-updatedAt']}
										<slot name="cell-updatedAt" {item} />
									{:else if column.key === 'mapName' && $$slots['cell-mapName']}
										<slot name="cell-mapName" {item} />
									{:else if column.key === 'version' && $$slots['cell-version']}
										<slot name="cell-version" {item} />
									{:else if column.key === 'address' && $$slots['cell-address']}
										<slot name="cell-address" {item} />
									{:else if column.key === 'golfCourseName' && $$slots['cell-golfCourseName']}
										<slot name="cell-golfCourseName" {item} />
									{:else if column.key === 'connectedGolfCourseId' && $$slots['cell-connectedGolfCourseId']}
										<slot name="cell-connectedGolfCourseId" {item} />
									{:else if column.key === 'batteryLevel' && $$slots['cell-batteryLevel']}
										<slot name="cell-batteryLevel" {item} />
									{:else if column.key === 'maintenanceStatus' && $$slots['cell-maintenanceStatus']}
										<slot name="cell-maintenanceStatus" {item} />
									{:else if column.key === 'createdAt' && $$slots['cell-createdAt']}
										<slot name="cell-createdAt" {item} />
									{:else if column.key === 'specs.maxSpeed' && $$slots['cell-specs.maxSpeed']}
										<slot name="cell-specs.maxSpeed" {item} />
									{:else if column.key === 'specs' && $$slots['cell-specs']}
										<slot name="cell-specs" {item} />
									{:else if column.key === 'totalCarts' && $$slots['cell-totalCarts']}
										<slot name="cell-totalCarts" {item} />
									{:else if column.key === 'mapStatus' && $$slots['cell-mapStatus']}
										<slot name="cell-mapStatus" {item} />
									{:else if column.key === 'mapData' && $$slots['cell-mapData']}
										<slot name="cell-mapData" {item} />
									{:else if column.key === 'address'}
										{@const addressValue = get(item, String(column.key))}
										<div class="group relative">
											<span
												class="block truncate text-gray-900 dark:text-gray-200 cursor-help"
												title={addressValue}
											>
												{addressValue}
											</span>
											{#if addressValue && addressValue !== '-' && addressValue.length > 25}
												<div class="pointer-events-none absolute left-0 bottom-full z-[100] mb-2 hidden min-w-[200px] max-w-xs rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block dark:bg-gray-700">
													{addressValue}
													<div class="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-700"></div>
												</div>
											{/if}
										</div>
									{:else}
										{@const cellValue = get(item, String(column.key))}
										{#if typeof cellValue === 'string' && cellValue.length > 40}
											<span class="text-gray-900 dark:text-gray-200" title={cellValue}>
												{truncateText(cellValue)}
											</span>
										{:else}
											<span class="text-gray-900 dark:text-gray-200">
												{cellValue}
											</span>
										{/if}
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
				class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
			>
				<div class="text-sm text-gray-700 dark:text-gray-200">
					<span class="font-medium">{totalItems}</span>개 중
					<span class="font-medium">{fromItem}</span>-<span class="font-medium">{toItem}</span>
					표시
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						on:click={() => dispatch('pageChange', page - 1)}
						disabled={page === 1}
					>
						<ChevronLeft class="h-4 w-4" />
						이전
					</Button>
					<Button
						variant="outline"
						size="sm"
						on:click={() => dispatch('pageChange', page + 1)}
						disabled={page === totalPages}
					>
						다음
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</div>
