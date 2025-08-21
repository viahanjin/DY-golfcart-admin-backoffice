<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { cartStore, isLoading, errorMessage, selectedCount } from '$lib/stores/cart.store';
	import type { Cart } from '$lib/types/cart';
	import type { StatItem, ColumnDefinition } from '$lib/types/common';

	// Component Imports
	import StatsCards from '$lib/components/common/StatsCards.svelte';
	import FilterBar from '$lib/components/common/FilterBar.svelte';
	import DataTable from '$lib/components/common/DataTable.svelte';
	import CartModal from '$lib/components/cart/CartModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	// Icon Imports
	import { Car, CheckCircle, AlertTriangle, Eye, Edit, Trash2, AlertCircle, X } from 'lucide-svelte';

	// --- Store and State ---
	let storeState: any;
	const unsubscribeStore = cartStore.subscribe(value => {
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
	let selectedCart: Cart | null = null;
	let cartToDelete: Cart | null = null;
	let showDeleteDialog = false;
	let showBulkDeleteDialog = false;

	// --- Lifecycle ---
	onMount(() => {
		cartStore.loadCarts();
	});

	onDestroy(() => {
		unsubscribeStore();
		unsubscribeLoading();
		unsubscribeError();
		unsubscribeSelected();
	});

	// --- Component Props ---
	$: stats = storeState ? ([
		{ label: '전체 카트', value: storeState.total, icon: Car, color: 'text-blue-500' },
		{ label: '운행 가능', value: storeState.items.filter((c:Cart) => c.status === 'AVAILABLE').length, icon: CheckCircle, color: 'text-green-500' },
		{ label: '정비 중', value: storeState.items.filter((c:Cart) => c.status === 'MAINTENANCE').length, icon: AlertTriangle, color: 'text-yellow-500' },
		{ label: '사용 중', value: storeState.items.filter((c:Cart) => c.status === 'IN_USE').length, icon: Car, color: 'text-blue-500' }
	] as StatItem[]) : [];

	const columns: ColumnDefinition<Cart>[] = [
		{ key: 'select', label: 'Select', class: 'w-12' },
		{ key: 'id', label: '카트 ID', sortable: true },
		{ key: 'cartNumber', label: '카트 번호', sortable: true },
		{ key: 'golfCourseName', label: '할당 골프장' },
		{ key: 'status', label: '상태', sortable: true, class: 'text-center' },
		{ key: 'batteryLevel', label: '배터리 (%)', class: 'text-center' },
		{ key: 'lastMaintenance', label: '최근 점검' },
		{ key: 'actions', label: '액션', class: 'w-24 text-center' }
	];

	// --- Event Handlers ---
	function handleCreate() {
		modalMode = 'create';
		selectedCart = null;
		showModal = true;
	}

	function handleView(cart: Cart) {
		modalMode = 'view';
		selectedCart = cart;
		showModal = true;
	}

	function handleEdit(cart: Cart) {
		modalMode = 'edit';
		selectedCart = cart;
		showModal = true;
	}

	function handleDelete(cart: Cart) {
		cartToDelete = cart;
		showDeleteDialog = true;
	}

	async function handleModalSave(event: CustomEvent) {
		const { mode, data } = event.detail;
		let success = false;
		if (mode === 'create') {
			const response = await cartStore.createCart(data);
			success = response.success;
		} else if (mode === 'edit' && selectedCart) {
			const response = await cartStore.updateCart(selectedCart.id, data);
			success = response.success;
		}
		if (success) {
			showModal = false;
		}
	}

	async function confirmDelete() {
		if (cartToDelete) {
			await cartStore.deleteCart(cartToDelete.id);
		}
		cartToDelete = null;
		showDeleteDialog = false;
	}

	async function confirmBulkDelete() {
		await cartStore.bulkDelete();
		showBulkDeleteDialog = false;
	}

	// --- Helper Functions ---
	function getStatusInfo(status: string) {
		switch (status) {
			case 'AVAILABLE': return { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50', text: '운행 가능' };
			case 'IN_USE': return { color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50', text: '사용 중' };
			case 'CHARGING': return { color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/50', text: '충전 중' };
			case 'MAINTENANCE': return { color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50', text: '정비 중' };
			default: return { color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700', text: '알 수 없음' };
		}
	}
</script>

{#if storeState}
<div class="p-4 md:p-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">카트 관리</h1>
		<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
			골프장에 등록된 카트의 정보를 관리합니다.
		</p>
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
			<div class="flex items-center">
				<AlertCircle class="h-5 w-5 text-red-400" />
				<p class="ml-3 text-sm text-red-800 dark:text-red-300">{error}</p>
			</div>
			<button on:click={cartStore.clearError} class="text-red-500 hover:text-red-700" aria-label="Close error message">
				<X class="h-4 w-4" />
			</button>
		</div>
	{/if}

	<!-- Stats Cards -->
	<StatsCards {stats} />

	<!-- Filter Bar -->
	<FilterBar
		bind:searchValue={storeState.searchQuery}
		searchPlaceholder="카트 ID, 이름 검색..."
		createLabel="카트 추가"
		selectedCount={currentSelectedCount}
		loading={loading}
		on:search={(e) => cartStore.search(e.detail)}
		on:refresh={() => cartStore.loadCarts()}
		on:create={handleCreate}
		on:export={() => alert('엑셀 내보내기 기능은 준비중입니다.')}
		on:bulkDelete={() => (showBulkDeleteDialog = true)}
	>
		<svelte:fragment slot="filters">
			<select
				value={storeState.selectedStatus}
				on:change={(e) => cartStore.changeFilter(e.currentTarget.value as any)}
				class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="all">전체 상태</option>
				<option value="AVAILABLE">운행 가능</option>
				<option value="IN_USE">사용 중</option>
				<option value="CHARGING">충전 중</option>
				<option value="MAINTENANCE">정비 중</option>
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
			cartStore.changeSort({ sortBy: e.detail, sortOrder: newOrder } as any);
		}}
		on:select={(e) => cartStore.toggleSelection(String(e.detail))}
		on:selectAll={cartStore.toggleSelectAll}
		on:pageChange={(e) => cartStore.changePage(e.detail)}
	>
		<div slot="empty-state" class="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
			<Car class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
			<p class="text-lg font-medium">등록된 카트가 없습니다</p>
			<p class="mt-1 text-sm">새로운 카트를 추가해주세요.</p>
		</div>

		<svelte:fragment slot="cell-status" let:item>
			{@const status = getStatusInfo(item.status)}
			<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {status.color}">
				{status.text}
			</span>
		</svelte:fragment>

		<svelte:fragment slot="cell-actions" let:item>
			<div class="flex items-center justify-center gap-1">
				<button on:click={() => handleView(item)} class="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20" title="상세보기">
					<Eye class="h-4 w-4" />
				</button>
				<button on:click={() => handleEdit(item)} class="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20" title="수정">
					<Edit class="h-4 w-4" />
				</button>
				<button on:click={() => handleDelete(item)} class="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" title="삭제">
					<Trash2 class="h-4 w-4" />
				</button>
			</div>
		</svelte:fragment>
	</DataTable>
</div>
{/if}

<!-- Modals and Dialogs -->
{#if showModal}
	<CartModal
		{modalMode}
		{selectedCart}
		on:close={() => (showModal = false)}
		on:save={handleModalSave}
	/>
{/if}

{#if showDeleteDialog}
	<ConfirmDialog
		title="카트 삭제"
		message={`정말로 카트 '${cartToDelete?.id}'를 삭제하시겠습니까?`}
		confirmText="삭제"
		danger={true}
		on:confirm={confirmDelete}
		on:cancel={() => {
			showDeleteDialog = false;
			cartToDelete = null;
		}}
	/>
{/if}

{#if showBulkDeleteDialog}
	<ConfirmDialog
		title="선택 항목 삭제"
		message={`선택한 ${currentSelectedCount}개의 카트를 삭제하시겠습니까?`}
		confirmText="모두 삭제"
		danger={true}
		on:confirm={confirmBulkDelete}
		on:cancel={() => (showBulkDeleteDialog = false)}
	/>
{/if}
