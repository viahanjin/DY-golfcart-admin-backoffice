<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		golfCourseStore,
		isLoading,
		errorMessage,
		selectedCount
	} from '$lib/stores/golf-course.store';
	import { golfCourseService } from '$lib/services/golf-course.service';
	import type { GolfCourse } from '$lib/types/golf-course';
	import type { StatItem } from '$lib/components/common/StatsCards.svelte';
	import type { ColumnDefinition } from '$lib/components/common/DataTable.svelte';

	// Component Imports
	import StatsCards from '$lib/components/common/StatsCards.svelte';
	import FilterBar from '$lib/components/common/FilterBar.svelte';
	import DataTable from '$lib/components/common/DataTable.svelte';
	import GolfCourseModal from '$lib/components/golf/GolfCourseModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	// Icon Imports
	import {
		Building2,
		Activity,
		Car,
		Clock,
		Eye,
		Edit,
		Trash2,
		AlertCircle,
		X,
		Users,
		Target,
		TrendingUp
	} from 'lucide-svelte';

	// --- Store and State ---
	let storeState: any;
	const unsubscribeStore = golfCourseStore.subscribe((value) => {
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

	// --- Component Props (제조사 관점으로 수정) ---
	$: stats = storeState
		? ([
				{ label: '총 고객사', value: storeState.total, icon: Building2, color: 'text-blue-500' },
				{
					label: '활성 고객사',
					value: storeState.items.filter((c: GolfCourse) => c.status === 'active').length,
					icon: Activity,
					color: 'text-green-500'
				},
				{
					label: '납품 카트',
					value: storeState.items.reduce((sum: number, c: GolfCourse) => sum + c.totalCarts, 0),
					icon: Car,
					color: 'text-purple-500'
				},
				{
					label: '잠재 고객',
					value: storeState.items.filter((c: GolfCourse) => c.status === 'maintenance').length,
					icon: Target,
					color: 'text-yellow-500'
				}
			] as StatItem[])
		: [];

	const columns: ColumnDefinition<GolfCourse>[] = [
		{ key: 'select', label: 'Select', class: 'w-12' },
		{ key: 'courseName', label: '고객사명', sortable: true, class: 'min-w-[120px]' },
		{ key: 'courseCode', label: '고객사 코드', sortable: true, class: 'w-28' },
		{ key: 'address', label: '주소', class: 'min-w-[150px] max-w-[200px]' },
		{ key: 'totalCarts', label: '배치 카트 총 대수', sortable: true, class: 'w-32 text-center' },
		{ key: 'status', label: '계약 상태', sortable: true, class: 'w-28 text-center' },
		{ key: 'lastModified', label: '최근 업데이트', sortable: true, class: 'w-32' },
		{ key: 'actions', label: '관리', class: 'w-24 text-center' }
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
			case 'active':
				return {
					color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50',
					text: '활성 계약'
				};
			case 'inactive':
				return {
					color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700',
					text: '계약 종료'
				};
			case 'maintenance':
				return {
					color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50',
					text: '영업 진행'
				};
			default:
				return { color: 'text-gray-600 bg-gray-100', text: '알 수 없음' };
		}
	}

	function formatDate(dateString: string) {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// 고객사 상세 페이지로 이동 (카트/맵 관리)
	function navigateToClientDetail(clientId: string) {
		// 향후 구현: /dashboard/clients/{id} 페이지로 이동
		console.log('Navigate to client detail:', clientId);
	}
</script>

{#if storeState}
	<div class="p-4 md:p-6">
		<!-- Header -->
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">고객사 관리</h1>
			<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
				DY 골프카트를 사용하는 골프장 고객사들을 관리합니다.
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
					on:click={golfCourseStore.clearError}
					class="text-red-500 hover:text-red-700"
					aria-label="Close error message"
				>
					<X class="h-4 w-4" />
				</button>
			</div>
		{/if}

			<div class="space-y-6">
		<!-- Stats Cards -->
		<StatsCards {stats} />


		<!-- Filter Bar -->
		<FilterBar
			bind:searchValue={storeState.searchQuery}
			searchPlaceholder="고객사명, 코드, 주소 검색..."
			createLabel="고객사 추가"
			selectedCount={currentSelectedCount}
			{loading}
			on:search={(e) => golfCourseStore.search(e.detail)}
			on:refresh={() => golfCourseStore.loadGolfCourses()}
			on:create={handleCreate}
			on:export={handleExport}
			on:bulkDelete={() => (showBulkDeleteDialog = true)}
		>
			<svelte:fragment slot="filters">
				<select
					value={storeState.selectedStatus}
					on:change={(e) =>
						golfCourseStore.changeFilter(
							e.currentTarget.value as 'all' | 'active' | 'inactive' | 'maintenance'
						)}
					class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					<option value="all">전체 상태</option>
					<option value="active">활성 계약</option>
					<option value="maintenance">영업 진행</option>
					<option value="inactive">계약 종료</option>
				</select>
			</svelte:fragment>
		</FilterBar>

		<!-- Data Table -->
		<DataTable
			items={storeState.items}
			{columns}
			idKey="id"
			{loading}
			selectedItems={storeState.selectedItems}
			sortBy={storeState.sortBy}
			sortOrder={storeState.sortOrder}
			page={storeState.page}
			totalPages={storeState.totalPages}
			totalItems={storeState.total}
			on:sort={(e) => golfCourseStore.changeSort(e.detail)}
			on:select={(e) => golfCourseStore.toggleSelection(String(e.detail))}
			on:selectAll={golfCourseStore.toggleSelectAll}
			on:pageChange={(e) => golfCourseStore.changePage(e.detail)}
		>
			<div slot="empty-state" class="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
				<Building2 class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
				<p class="text-lg font-medium">등록된 고객사가 없습니다</p>
				<p class="mt-1 text-sm">새로운 고객사를 추가해주세요.</p>
			</div>

		<svelte:fragment slot="cell-address" let:item>
			{#if item.address && typeof item.address === 'object'}
				{@const fullAddress =
					`${item.address.address1 || ''} ${item.address.address2 || ''}`.trim()}
				<div class="group relative">
					<span class="block truncate text-gray-900 dark:text-gray-200">
						{fullAddress || '-'}
					</span>
					{#if fullAddress && fullAddress.length > 30}
						<div
							class="absolute top-full left-0 z-50 mt-1 hidden w-max max-w-xs rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg group-hover:block dark:bg-gray-700"
						>
							{fullAddress}
							<div
								class="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-700"
							></div>
						</div>
					{/if}
				</div>
			{:else if item.address}
				<div class="group relative">
					<span class="block truncate text-gray-900 dark:text-gray-200">
						{item.address}
					</span>
					{#if item.address.length > 30}
						<div
							class="absolute top-full left-0 z-50 mt-1 hidden w-max max-w-xs rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg group-hover:block dark:bg-gray-700"
						>
							{item.address}
							<div
								class="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-700"
							></div>
						</div>
					{/if}
				</div>
			{:else}
				<span class="text-gray-900 dark:text-gray-200">-</span>
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="cell-totalCarts" let:item>
			<span class="text-center font-medium dark:text-gray-200">{item.totalCarts || 0} 대</span>
		</svelte:fragment>

		<svelte:fragment slot="cell-status" let:item>
			{@const status = getStatusInfo(item.status)}
			<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {status.color}">
				{status.text}
			</span>
		</svelte:fragment>

		<svelte:fragment slot="cell-lastModified" let:item>
			<span class="text-gray-900 dark:text-gray-200">
				{formatDate(item.lastModified)}
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
		title="고객사 삭제"
		message={`정말로 "${courseToDelete?.courseName}" 고객사를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`}
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
		message={`선택한 ${currentSelectedCount}개의 고객사를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`}
		confirmText="모두 삭제"
		danger={true}
		on:confirm={confirmBulkDelete}
		on:cancel={() => (showBulkDeleteDialog = false)}
	/>
{/if}
