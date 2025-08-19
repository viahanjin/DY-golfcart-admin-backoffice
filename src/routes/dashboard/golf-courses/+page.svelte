<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { golfCourseStore, isLoading, errorMessage, selectedCount } from '$lib/stores/golf-course.store';
	import { golfCourseService } from '$lib/services/golf-course.service';
	import type { GolfCourse } from '$lib/types/golf-course';
	import type { StatItem, ColumnDefinition } from '$lib/types/common';

	// Component Imports
	import StatsCards from '$lib/components/common/StatsCards.svelte';
	import FilterBar from '$lib/components/common/FilterBar.svelte';
	import DataTable from '$lib/components/common/DataTable.svelte';
	import GolfCourseModal from '$lib/components/golf/GolfCourseModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	
	// Icon Imports
	import { MapPin, Activity, Car, Clock, Eye, Edit, Trash2, AlertCircle, X } from 'lucide-svelte';

	// --- Store and State ---
	let storeState: any;
	const unsubscribeStore = golfCourseStore.subscribe(value => {
		storeState = value;
	});

	let loading = false;
	const unsubscribeLoading = isLoading.subscribe(value => loading = value);

	let error: string | null = null;
	const unsubscribeError = errorMessage.subscribe(value => error = value);
	
	let currentSelectedCount = 0;
	const unsubscribeSelected = selectedCount.subscribe(value => currentSelectedCount = value);

	// Modal and Dialog state
	let showModal = false;
	let modalMode: 'create' | 'edit' | 'view' = 'create';
	let selectedCourse: GolfCourse | null = null;
	let courseToDelete: GolfCourse | null = null;
	let showDeleteDialog = false;
	let showBulkDeleteDialog = false;

	// --- Lifecycle ---
	onMount(() => {
		golfCourseStore.loadGolfCourses();
	});

	onDestroy(() => {
		unsubscribeStore();
		unsubscribeLoading();
		unsubscribeError();
		unsubscribeSelected();
	});

	// --- Component Props ---
	$: stats = storeState ? ([
		{ label: '전체 골프장', value: storeState.total, icon: MapPin, color: 'text-blue-500' },
		{ label: '운영중', value: storeState.items.filter((c: GolfCourse) => c.status === 'ACTIVE').length, icon: Activity, color: 'text-green-500' },
		{ label: '전체 카트', value: storeState.items.reduce((sum: number, c: GolfCourse) => sum + c.cartsCount, 0), icon: Car, color: 'text-purple-500' },
		{ label: '비활성', value: storeState.items.filter((c: GolfCourse) => c.status === 'INACTIVE').length, icon: Clock, color: 'text-yellow-500' }
	] as StatItem[]) : [];

	const columns: ColumnDefinition<GolfCourse>[] = [
		{ key: 'select', label: 'Select', class: 'w-12' },
		{ key: 'name', label: '골프장명', sortable: true },
		{ key: 'id', label: '코드', sortable: true },
		{ key: 'address', label: '주소' },
		{ key: 'cartsCount', label: '카트 수', sortable: true, class: 'text-center' },
		{ key: 'status', label: '상태', sortable: true, class: 'text-center' },
		{ key: 'updatedAt', label: '최종 수정', sortable: true },
		{ key: 'actions', label: '액션', class: 'w-24 text-center' }
	];

	// --- Event Handlers ---
	function handleCreate() {
		modalMode = 'create';
		selectedCourse = null;
		showModal = true;
	}

	function handleView(course: GolfCourse) {
		modalMode = 'view';
		selectedCourse = course;
		showModal = true;
	}

	function handleEdit(course: GolfCourse) {
		modalMode = 'edit';
		selectedCourse = course;
		showModal = true;
	}

	function handleDelete(course: GolfCourse) {
		courseToDelete = course;
		showDeleteDialog = true;
	}

	async function handleModalSave(event: CustomEvent) {
		const { mode, data } = event.detail;
		let success = false;
		if (mode === 'create') {
			success = await golfCourseStore.createGolfCourse(data);
		} else if (mode === 'edit' && selectedCourse) {
			success = await golfCourseStore.updateGolfCourse(selectedCourse.id, data);
		}
		if (success) {
			showModal = false;
		}
	}

	async function confirmDelete() {
		if (courseToDelete) {
			await golfCourseStore.deleteGolfCourse(courseToDelete.id);
		}
		courseToDelete = null;
		showDeleteDialog = false;
	}

	async function confirmBulkDelete() {
		await golfCourseStore.bulkDelete();
		showBulkDeleteDialog = false;
	}

	async function handleExport() {
		if (!storeState) return;
		await golfCourseService.exportToExcel({
			search: storeState.searchQuery,
			status: storeState.selectedStatus,
			sortBy: storeState.sortBy,
			sortOrder: storeState.sortOrder
		});
	}

	// --- Helper Functions ---
	function getStatusInfo(status: string) {
		switch (status) {
			case 'active': return { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50', text: '운영중' };
			case 'inactive': return { color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700', text: '비활성' };
			case 'maintenance': return { color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50', text: '정비중' };
			default: return { color: 'text-gray-600 bg-gray-100', text: '알 수 없음' };
		}
	}

</script>

{#if storeState}
<div class="p-4 md:p-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">골프장 관리</h1>
		<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
			등록된 골프장을 관리하고 새로운 골프장을 추가할 수 있습니다.
		</p>
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
			<div class="flex items-center">
				<AlertCircle class="h-5 w-5 text-red-400" />
				<p class="ml-3 text-sm text-red-800 dark:text-red-300">{error}</p>
			</div>
			<button on:click={golfCourseStore.clearError} class="text-red-500 hover:text-red-700" aria-label="Close error message">
				<X class="h-4 w-4" />
			</button>
		</div>
	{/if}

	<!-- Stats Cards -->
	<StatsCards {stats} />

	<!-- Filter Bar -->
	<FilterBar
		bind:searchValue={storeState.searchQuery}
		searchPlaceholder="골프장명, 코드, 주소 검색..."
		createLabel="골프장 추가"
		selectedCount={currentSelectedCount}
		loading={loading}
		on:search={(e) => golfCourseStore.search(e.detail)}
		on:refresh={() => golfCourseStore.loadGolfCourses()}
		on:create={handleCreate}
		on:export={handleExport}
		on:bulkDelete={() => (showBulkDeleteDialog = true)}
	>
		<svelte:fragment slot="filters">
			<select
				value={storeState.selectedStatus}
				on:change={(e) => golfCourseStore.changeFilter(e.currentTarget.value as any)}
				class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="all">전체 상태</option>
				<option value="ACTIVE">운영중</option>
				<option value="INACTIVE">비활성</option>
			</select>
		</svelte:fragment>
	</FilterBar>

	<!-- Data Table -->
	<DataTable
		items={storeState.items}
		{columns}
		idKey="id"
		loading={loading}
		selectedItems={storeState.selectedItems}
		sortBy={storeState.sortBy}
		sortOrder={storeState.sortOrder}
		page={storeState.page}
		totalPages={storeState.totalPages}
		totalItems={storeState.total}
		on:sort={(e) => {
			const newOrder = storeState.sortBy === e.detail && storeState.sortOrder === 'asc' ? 'desc' : 'asc';
			golfCourseStore.changeSort({ sortBy: e.detail, sortOrder: newOrder } as any);
		}}
		on:select={(e) => golfCourseStore.toggleSelection(String(e.detail))}
		on:selectAll={golfCourseStore.toggleSelectAll}
		on:pageChange={(e) => golfCourseStore.changePage(e.detail)}
	>
		<div slot="empty-state" class="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
			<MapPin class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
			<p class="text-lg font-medium">등록된 골프장이 없습니다</p>
			<p class="mt-1 text-sm">새로운 골프장을 추가해주세요.</p>
		</div>

		<svelte:fragment slot="cell-status" let:item>
			{@const status = getStatusInfo(item.status)}
			<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {status.color}">
				{status.text}
			</span>
		</svelte:fragment>

		<svelte:fragment slot="cell-actions" let:item>
			<div class="flex items-center justify-center gap-1">
				<button on:click={() => handleView(item)} class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700" title="상세보기">
					<Eye class="h-4 w-4" />
				</button>
				<button on:click={() => handleEdit(item)} class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-700" title="수정">
					<Edit class="h-4 w-4" />
				</button>
				<button on:click={() => handleDelete(item)} class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700" title="삭제">
					<Trash2 class="h-4 w-4" />
				</button>
			</div>
		</svelte:fragment>
	</DataTable>
</div>
{/if}

<!-- Modals and Dialogs -->
{#if showModal}
	<GolfCourseModal
		{modalMode}
		{selectedCourse}
		on:close={() => (showModal = false)}
		on:save={handleModalSave}
	/>
{/if}

{#if showDeleteDialog}
	<ConfirmDialog
		title="골프장 삭제"
		message={`정말로 "${courseToDelete?.name}" 골프장을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`}
		confirmText="삭제"
		danger={true}
		on:confirm={confirmDelete}
		on:cancel={() => {
			showDeleteDialog = false;
			courseToDelete = null;
		}}
	/>
{/if}

{#if showBulkDeleteDialog}
	<ConfirmDialog
		title="선택 항목 삭제"
		message={`선택한 ${currentSelectedCount}개의 골프장을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`}
		confirmText="모두 삭제"
		danger={true}
		on:confirm={confirmBulkDelete}
		on:cancel={() => (showBulkDeleteDialog = false)}
	/>
{/if}