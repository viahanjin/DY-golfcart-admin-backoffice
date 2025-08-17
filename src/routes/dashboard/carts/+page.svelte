<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { cartStore, isLoading, errorMessage, selectedCount } from '$lib/stores/cart.store';
	import type { Cart } from '$lib/types/cart';
	import type { StatItem } from '$lib/components/common/StatsCards.svelte';
	import type { ColumnDefinition } from '$lib/components/common/DataTable.svelte';

	// Component Imports
	import StatsCards from '$lib/components/common/StatsCards.svelte';
	import FilterBar from '$lib/components/common/FilterBar.svelte';
	import DataTable from '$lib/components/common/DataTable.svelte';
	import CartModal from '$lib/components/cart/CartModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	// Icon Imports
	import { Car, CheckCircle, AlertTriangle, XCircle, Eye, Edit, Trash2, AlertCircle, X } from 'lucide-svelte';

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
		{ label: '운행 가능', value: storeState.items.filter((c:Cart) => c.cartStatus.currentState === 'available').length, icon: CheckCircle, color: 'text-green-500' },
		{ label: '정비 중', value: storeState.items.filter((c:Cart) => c.cartStatus.currentState === 'maintenance').length, icon: AlertTriangle, color: 'text-yellow-500' },
		{ label: '고장', value: storeState.items.filter((c:Cart) => c.cartStatus.currentState === 'broken').length, icon: XCircle, color: 'text-red-500' }
	] as StatItem[]) : [];

	const columns: ColumnDefinition<Cart>[] = [
		{ key: 'select', label: 'Select', class: 'w-12' },
		{ key: 'id', label: '카트 ID', sortable: true },
		{ key: 'cartName', label: '카트명', sortable: true },
		{ key: 'assignedGolfCourseId', label: '할당 골프장' },
		{ key: 'cartStatus.currentState', label: '상태', sortable: true, class: 'text-center' },
		{ key: 'capabilities.battery.capacity', label: '배터리', class: 'text-center' },
		{ key: 'cartStatus.lastInspection', label: '최근 점검' },
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
			success = await cartStore.createCart(data);
		} else if (mode === 'edit' && selectedCart) {
			success = await cartStore.updateCart(selectedCart.id, data);
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
			case 'available': return { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50', text: '운행 가능' };
			case 'maintenance': return { color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50', text: '정비 중' };
			case 'broken': return { color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50', text: '고장' };
			default: return { color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700', text: '미사용' };
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
				on:change={(e) => cartStore.changeFilter(e.currentTarget.value)}
				class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="all">전체 상태</option>
				<option value="available">운행 가능</option>
				<option value="maintenance">정비 중</option>
				<option value="broken">고장</option>
				<option value="unavailable">미사용</option>
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
		on:sort={(e) => cartStore.changeSort(e.detail)}
		on:select={(e) => cartStore.toggleSelection(e.detail)}
		on:selectAll={cartStore.toggleSelectAll}
		on:pageChange={(e) => cartStore.changePage(e.detail)}
	>
		<div slot="empty-state" class="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
			<Car class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
			<p class="text-lg font-medium">등록된 카트가 없습니다</p>
			<p class="mt-1 text-sm">새로운 카트를 추가해주세요.</p>
		</div>

		<svelte:fragment slot="cell-cartStatus.currentState" let:item>
			{@const status = getStatusInfo(item.cartStatus.currentState)}
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
