<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { mapStore, isLoading, errorMessage, selectedCount } from '$lib/stores/map.store';
	import type { MapData } from '$lib/types/map';
	import type { StatItem } from '$lib/components/common/StatsCards.svelte';
	import type { ColumnDefinition } from '$lib/components/common/DataTable.svelte';

	// Component Imports
	import StatsCards from '$lib/components/common/StatsCards.svelte';
	import FilterBar from '$lib/components/common/FilterBar.svelte';
	import DataTable from '$lib/components/common/DataTable.svelte';
	import MapModal from '$lib/components/map/MapModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	// Icon Imports
	import {
		Map,
		Activity,
		CheckCircle,
		Eye,
		Edit,
		Trash2,
		AlertCircle,
		X,
		Clock,
		XCircle
	} from 'lucide-svelte';

	// --- Store and State ---
	let storeState: any;
	const unsubscribeStore = mapStore.subscribe((value) => {
		storeState = value;
	});

	let loading = false;
	const unsubscribeLoading = isLoading.subscribe((value) => (loading = value));

	let error: string | null = null;
	const unsubscribeError = errorMessage.subscribe((value) => (error = value));

	let currentSelectedCount = 0;
	const unsubscribeSelected = selectedCount.subscribe((value) => (currentSelectedCount = value));

	// Modal and Dialog state
	let showModal = false;
	let modalMode: 'create' | 'edit' | 'view' = 'create';
	let selectedMap: MapData | null = null;
	let mapToDelete: MapData | null = null;
	let showDeleteDialog = false;
	let showBulkDeleteDialog = false;

	// --- Lifecycle ---
	onMount(() => {
		mapStore.loadMaps();
	});

	onDestroy(() => {
		unsubscribeStore();
		unsubscribeLoading();
		unsubscribeError();
		unsubscribeSelected();
	});

	// --- Component Props ---
	$: stats = storeState
		? ([
				{ label: '전체 맵', value: storeState.total, icon: Map, color: 'text-blue-500' },
				{
					label: '활성 맵',
					value: storeState.items.filter((m: MapData) => m.mapStatus.status === 'active').length,
					icon: Activity,
					color: 'text-green-500'
				},
				{
					label: '테스트 중',
					value: storeState.items.filter((m: MapData) => m.mapStatus.status === 'testing').length,
					icon: Clock,
					color: 'text-yellow-500'
				},
				{
					label: '검증 완료',
					value: storeState.items.filter(
						(m: MapData) => m.mapStatus.validationStatus === 'verified'
					).length,
					icon: CheckCircle,
					color: 'text-purple-500'
				}
			] as StatItem[])
		: [];

	const columns: ColumnDefinition<MapData>[] = [
		{ key: 'select', label: 'Select', class: 'w-12' },
		{ key: 'mapName', label: '맵 정보', sortable: true },
		{ key: 'version', label: '버전', sortable: true, class: 'text-center' },
		{ key: 'connectedGolfCourseId', label: '연결 골프장' },
		{ key: 'mapStatus', label: '상태', sortable: true, class: 'text-center' },
		// { key: 'mapStatus.validationStatus', label: '검증', class: 'text-center' },
		{ key: 'updatedAt', label: '최근 수정', sortable: true },
		{ key: 'actions', label: '액션', class: 'w-24 text-center' }
	];

	// --- Event Handlers ---
	function handleCreate() {
		modalMode = 'create';
		selectedMap = null;
		showModal = true;
	}

	function handleView(map: MapData) {
		modalMode = 'view';
		selectedMap = map;
		showModal = true;
	}

	function handleEdit(map: MapData) {
		modalMode = 'edit';
		selectedMap = map;
		showModal = true;
	}

	function handleDelete(map: MapData) {
		mapToDelete = map;
		showDeleteDialog = true;
	}

	async function handleModalSave(event: CustomEvent) {
		const { mode, data } = event.detail;
		let success = false;
		if (mode === 'create') {
			success = await mapStore.createMap(data);
		} else if (mode === 'edit' && selectedMap) {
			success = await mapStore.updateMap(selectedMap.mapId, data);
		}
		if (success) {
			showModal = false;
		}
	}

	async function confirmDelete() {
		if (mapToDelete) {
			await mapStore.deleteMap(mapToDelete.mapId);
		}
		mapToDelete = null;
		showDeleteDialog = false;
	}

	async function confirmBulkDelete() {
		await mapStore.bulkDelete();
		showBulkDeleteDialog = false;
	}

	// --- Helper Functions ---
	function getStatusInfo(status: 'active' | 'testing' | 'inactive') {
		switch (status) {
			case 'active':
				return {
					color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50',
					text: '활성'
				};
			case 'testing':
				return {
					color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50',
					text: '테스트 중'
				};
			case 'inactive':
				return {
					color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700',
					text: '비활성'
				};
		}
	}

	function getValidationIcon(status: 'verified' | 'pending' | 'failed') {
		switch (status) {
			case 'verified':
				return CheckCircle;
			case 'pending':
				return Clock;
			case 'failed':
				return XCircle;
		}
	}

	function getValidationClass(status: 'verified' | 'pending' | 'failed') {
		const baseClass = 'h-5 w-5';
		switch (status) {
			case 'verified':
				return `${baseClass} text-green-500`;
			case 'pending':
				return `${baseClass} text-yellow-500`;
			case 'failed':
				return `${baseClass} text-red-500`;
			default:
				return baseClass;
		}
	}

	function formatDate(dateString: string) {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

{#if storeState}
	<div class="p-4 md:p-6">
		<!-- Header -->
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">맵 관리</h1>
			<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
				골프장 맵 데이터를 관리하고 버전을 제어합니다.
			</p>
		</div>

		<!-- Error Message -->
		{#if error}
			<div
				class="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-4 dark:bg-red-900/20"
			>
				<div class="flex items-center">
					<AlertCircle class="h-5 w-5 text-red-400" />
					<p class="ml-3 text-sm text-red-800 dark:text-red-300">{error}</p>
				</div>
				<button
					on:click={mapStore.clearError}
					class="text-red-500 hover:text-red-700"
					aria-label="Close error message"
				>
					<X class="h-4 w-4" />
				</button>
			</div>
		{/if}

		<!-- Stats Cards -->
		<StatsCards {stats} />

		<!-- Filter Bar -->
		<FilterBar
			bind:searchValue={storeState.searchQuery}
			searchPlaceholder="맵 이름, ID 검색..."
			createLabel="맵 추가"
			selectedCount={currentSelectedCount}
			{loading}
			on:search={(e) => mapStore.search(e.detail)}
			on:refresh={() => mapStore.loadMaps()}
			on:create={handleCreate}
			on:export={() => alert('엑셀 내보내기 기능은 준비중입니다.')}
			on:bulkDelete={() => (showBulkDeleteDialog = true)}
		>
			<svelte:fragment slot="filters">
				<select
					value={storeState.selectedStatus}
					on:change={(e) => mapStore.changeFilter(e.currentTarget.value)}
					class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					<option value="all">전체 상태</option>
					<option value="active">활성</option>
					<option value="testing">테스트 중</option>
					<option value="inactive">비활성</option>
				</select>
			</svelte:fragment>
		</FilterBar>

		<!-- Data Table -->
		<DataTable
			items={storeState.items}
			{columns}
			idKey="mapId"
			{loading}
			selectedItems={storeState.selectedItems}
			sortBy={storeState.sortBy}
			sortOrder={storeState.sortOrder}
			page={storeState.page}
			totalPages={storeState.totalPages}
			totalItems={storeState.total}
			on:sort={(e) => mapStore.changeSort(e.detail)}
			on:select={(e) => mapStore.toggleSelection(String(e.detail))}
			on:selectAll={mapStore.toggleSelectAll}
			on:pageChange={(e) => mapStore.changePage(e.detail)}
		>
			<div
				slot="empty-state"
				class="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400"
			>
				<Map class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
				<p class="text-lg font-medium">등록된 맵이 없습니다</p>
				<p class="mt-1 text-sm">새로운 맵을 추가해주세요.</p>
			</div>

			<svelte:fragment slot="cell-mapName" let:item>
				<div>
					<p class="font-medium text-gray-900 dark:text-white">{item.mapName}</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">{item.mapId}</p>
				</div>
			</svelte:fragment>

			<svelte:fragment slot="cell-version" let:item>
				<span class="text-gray-900 dark:text-gray-200">
					v{item.version}
				</span>
			</svelte:fragment>

			<svelte:fragment slot="cell-mapStatus.status" let:item>
				{@const status = getStatusInfo(item.mapStatus.status)}
				<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {status.color}">
					{status.text}
				</span>
			</svelte:fragment>

			<svelte:fragment slot="cell-mapStatus.validationStatus" let:item>
				<svelte:component
					this={getValidationIcon(item.mapStatus.validationStatus)}
					class={getValidationClass(item.mapStatus.validationStatus)}
				/>
			</svelte:fragment>

			<svelte:fragment slot="cell-updatedAt" let:item>
				<span class="text-gray-900 dark:text-gray-200">
					{formatDate(item.updatedAt)}
				</span>
			</svelte:fragment>

			<svelte:fragment slot="cell-actions" let:item>
				<div class="flex items-center justify-center gap-1">
					<button
						on:click={() => handleView(item)}
						class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700"
						title="상세보기"
					>
						<Eye class="h-4 w-4" />
					</button>
					<button
						on:click={() => handleEdit(item)}
						class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-700"
						title="수정"
					>
						<Edit class="h-4 w-4" />
					</button>
					<button
						on:click={() => handleDelete(item)}
						class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700"
						title="삭제"
					>
						<Trash2 class="h-4 w-4" />
					</button>
				</div>
			</svelte:fragment>
		</DataTable>
	</div>
{/if}

<!-- Modals and Dialogs -->
{#if showModal}
	<MapModal
		{modalMode}
		{selectedMap}
		on:close={() => (showModal = false)}
		on:save={handleModalSave}
	/>
{/if}

{#if showDeleteDialog}
	<ConfirmDialog
		title="맵 삭제"
		message={`'${mapToDelete?.mapName}' (v${mapToDelete?.version}) 맵을 정말 삭제하시겠습니까?`}
		confirmText="삭제"
		danger={true}
		on:confirm={confirmDelete}
		on:cancel={() => {
			showDeleteDialog = false;
			mapToDelete = null;
		}}
	/>
{/if}

{#if showBulkDeleteDialog}
	<ConfirmDialog
		title="선택 항목 삭제"
		message={`선택한 ${currentSelectedCount}개의 맵을 삭제하시겠습니까?`}
		confirmText="모두 삭제"
		danger={true}
		on:confirm={confirmBulkDelete}
		on:cancel={() => (showBulkDeleteDialog = false)}
	/>
{/if}
