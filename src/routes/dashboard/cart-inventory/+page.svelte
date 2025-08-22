<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { cartInventoryStore, cartInventoryStoreInstance, isLoading, errorMessage, selectedCount } from '$lib/stores/cart-inventory.store';
	import { cartModelStore, cartModelStoreInstance } from '$lib/stores/cart-model.store';
	import type { Cart } from '$lib/types/cart';
	import type { CartModel } from '$lib/types/cart-model';
	import type { StatItem } from '$lib/components/common/StatsCards.svelte';
	import type { ColumnDefinition } from '$lib/components/common/DataTable.svelte';

	// Component Imports
	import StatsCards from '$lib/components/common/StatsCards.svelte';
	import FilterBar from '$lib/components/common/FilterBar.svelte';
	import DataTable from '$lib/components/common/DataTable.svelte';
	import CartInventoryModal from '$lib/components/cart/CartInventoryModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import DeploymentModal from '$lib/components/cart/DeploymentModal.svelte';
	
	// Icon Imports
	import { Car, Package, MapPin, Wrench, AlertCircle, Eye, Edit, Trash2, X, Truck } from 'lucide-svelte';

	// --- Store and State ---
	let storeState: any;
	const unsubscribeStore = cartInventoryStore.subscribe(value => {
		storeState = value;
	});

	let cartModelState: any;
	const unsubscribeCartModel = cartModelStore.subscribe(value => {
		cartModelState = value;
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
	let showDeploymentModal = false;
	let cartToDeploy: Cart | null = null;

	// --- Lifecycle ---
	onMount(() => {
		console.log('🎬 Cart Inventory page mounted');
		cartInventoryStoreInstance.loadCarts();
		cartModelStoreInstance.loadCartModels(); // Load cart models for filters
	});

	onDestroy(() => {
		unsubscribeStore();
		unsubscribeCartModel();
		unsubscribeLoading();
		unsubscribeError();
		unsubscribeSelected();
	});

	// --- Component Props ---
	$: stats = storeState ? ([
		{ label: '전체 카트', value: storeState.total, icon: Car, color: 'text-blue-500' },
		{ label: '창고 보관', value: storeState.items.filter((c: Cart) => c.status === 'in_warehouse').length, icon: Package, color: 'text-green-500' },
		{ label: '현장 배치', value: storeState.items.filter((c: Cart) => c.status === 'deployed').length, icon: MapPin, color: 'text-purple-500' },
		{ label: '정비 중', value: storeState.items.filter((c: Cart) => c.status === 'maintenance').length, icon: Wrench, color: 'text-red-500' }
	] as StatItem[]) : [];

	const columns: ColumnDefinition<Cart>[] = [
		{ key: 'select', label: 'Select', class: 'w-12' },
		{ key: 'serialNumber', label: '일련번호', sortable: true, class: 'min-w-[120px]' },
		{ key: 'modelName', label: '모델명', sortable: true, class: 'min-w-[150px]' },
		{ key: 'status', label: '상태', sortable: true, class: 'w-28 text-center' },
		{ key: 'golfCourseName', label: '배치 현장', class: 'min-w-[150px]' },
		{ key: 'batteryLevel', label: '배터리', sortable: true, class: 'w-24 text-center' },
		{ key: 'maintenanceStatus', label: '점검상태', sortable: true, class: 'w-24 text-center' },
		{ key: 'createdAt', label: '등록일', sortable: true, class: 'w-32' },
		{ key: 'actions', label: '액션', class: 'w-32 text-center' }
	];

	// --- Event Handlers ---
	function handleCreate() {
		console.log('➕ Creating new cart');
		modalMode = 'create';
		selectedCart = null;
		showModal = true;
	}

	function handleView(cart: Cart) {
		console.log('👁️ Viewing cart:', cart.id);
		modalMode = 'view';
		selectedCart = cart;
		showModal = true;
	}

	function handleEdit(cart: Cart) {
		console.log('✏️ Editing cart:', cart.id);
		modalMode = 'edit';
		selectedCart = cart;
		showModal = true;
	}

	function handleDelete(cart: Cart) {
		console.log('🗑️ Preparing to delete cart:', cart.id);
		cartToDelete = cart;
		showDeleteDialog = true;
	}

	function handleDeploy(cart: Cart) {
		console.log('🚚 Preparing to deploy cart:', cart.id);
		cartToDeploy = cart;
		showDeploymentModal = true;
	}

	async function handleModalSave(event: CustomEvent) {
		const { mode, data } = event.detail;
		console.log('💾 Saving cart:', mode, data);
		
		let success = false;
		if (mode === 'create') {
			success = await cartInventoryStoreInstance.createCart(data);
		} else if (mode === 'edit' && selectedCart) {
			success = await cartInventoryStoreInstance.updateCart(selectedCart.id, data);
		}
		
		if (success) {
			showModal = false;
			selectedCart = null;
		}
	}

	async function handleDeploymentSave(event: CustomEvent) {
		const { golfCourseId, golfCourseName } = event.detail;
		console.log('🚚 Deploying cart:', cartToDeploy?.id, 'to:', golfCourseName);
		
		if (cartToDeploy) {
			const success = await cartInventoryStoreInstance.deployCart(cartToDeploy.id, golfCourseId, golfCourseName);
			if (success) {
				showDeploymentModal = false;
				cartToDeploy = null;
			}
		}
	}

	async function handleRecall(cart: Cart) {
		console.log('🔄 Recalling cart:', cart.id);
		await cartInventoryStoreInstance.recallCart(cart.id);
	}

	async function confirmDelete() {
		if (cartToDelete) {
			console.log('🗑️ Confirming delete for cart:', cartToDelete.id);
			await cartInventoryStoreInstance.deleteCart(cartToDelete.id);
		}
		cartToDelete = null;
		showDeleteDialog = false;
	}

	async function confirmBulkDelete() {
		console.log('🗑️ Confirming bulk delete for carts');
		await cartInventoryStoreInstance.bulkDelete();
		showBulkDeleteDialog = false;
	}

	// --- Helper Functions ---
	function getStatusInfo(status: string) {
		switch (status) {
			case 'in_warehouse': return { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50', text: '창고보관' };
			case 'deployed': return { color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50', text: '현장배치' };
			case 'maintenance': return { color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50', text: '정비중' };
			default: return { color: 'text-gray-600 bg-gray-100', text: '알 수 없음' };
		}
	}

	function getMaintenanceStatusInfo(status: string) {
		switch (status) {
			case 'good': return { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50', text: '양호' };
			case 'warning': return { color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50', text: '주의' };
			case 'critical': return { color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50', text: '위험' };
			default: return { color: 'text-gray-600 bg-gray-100', text: '알 수 없음' };
		}
	}

	function getBatteryColor(level: number) {
		if (level > 70) return 'text-green-600';
		if (level > 30) return 'text-yellow-600';
		return 'text-red-600';
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

<svelte:head>
	<title>카트 재고 관리 - 골프카트 관제 시스템</title>
	<meta name="description" content="카트 재고 및 배치 관리" />
</svelte:head>

{#if error}
	<div class="mb-4 rounded-lg border border-red-500/50 bg-red-50 p-4 dark:bg-red-900/50" role="alert">
		<div class="flex items-center gap-2">
			<AlertCircle class="h-5 w-5 text-red-500" />
			<span class="text-red-700 dark:text-red-200">{error}</span>
			<button 
				on:click={() => errorMessage.set(null)}
				class="ml-auto text-red-500 hover:text-red-700"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	</div>
{/if}

{#if storeState}
<div class="p-4 md:p-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">카트 재고 관리</h1>
		<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
			카트 재고 및 배치 관리를 위한 페이지입니다.
		</p>
	</div>

	<div class="space-y-6">
	<!-- Stats Cards -->
	<StatsCards {stats} />

	<!-- Filter Bar -->
	<FilterBar
		bind:searchValue={storeState.searchQuery}
		searchPlaceholder="일련번호, 모델명, 현장명 검색..."
		createLabel="카트 등록"
		selectedCount={currentSelectedCount}
		loading={loading}
		on:search={(e) => cartInventoryStoreInstance.search(e.detail)}
		on:refresh={() => cartInventoryStoreInstance.loadCarts()}
		on:create={handleCreate}
		on:bulkDelete={() => (showBulkDeleteDialog = true)}
	>
		<svelte:fragment slot="filters">
			<select
				value={storeState.selectedStatus}
				on:change={(e) => cartInventoryStoreInstance.changeStatusFilter(e.currentTarget.value as 'all' | 'in_warehouse' | 'deployed' | 'maintenance')}
				class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="all">전체 상태</option>
				<option value="in_warehouse">창고보관</option>
				<option value="deployed">현장배치</option>
				<option value="maintenance">정비중</option>
			</select>

			<select
				value={storeState.selectedModelId}
				on:change={(e) => cartInventoryStoreInstance.changeModelFilter(e.currentTarget.value)}
				class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="all">전체 모델</option>
				{#if cartModelState?.items}
					{#each cartModelState.items as model}
						<option value={model.id}>{model.modelName}</option>
					{/each}
				{/if}
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
		on:sort={(e) => cartInventoryStoreInstance.changeSort(e.detail)}
		on:select={(e) => cartInventoryStoreInstance.toggleSelection(String(e.detail))}
		on:selectAll={cartInventoryStoreInstance.toggleSelectAll}
		on:pageChange={(e) => cartInventoryStoreInstance.changePage(e.detail)}
	>
		<div slot="empty-state" class="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
			<Car class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
			<p class="text-lg font-medium">등록된 카트가 없습니다</p>
			<p class="mt-1 text-sm">새로운 카트를 등록해주세요.</p>
		</div>

		<svelte:fragment slot="cell-status" let:item>
			{@const status = getStatusInfo(item.status)}
			<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {status.color}">
				{status.text}
			</span>
		</svelte:fragment>

		<svelte:fragment slot="cell-golfCourseName" let:item>
			<span class="text-gray-900 dark:text-gray-200">
				{item.golfCourseName || '-'}
			</span>
		</svelte:fragment>

		<svelte:fragment slot="cell-batteryLevel" let:item>
			<span class="font-medium {getBatteryColor(item.batteryLevel)}">
				{item.batteryLevel}%
			</span>
		</svelte:fragment>

		<svelte:fragment slot="cell-maintenanceStatus" let:item>
			{@const status = getMaintenanceStatusInfo(item.maintenanceStatus)}
			<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {status.color}">
				{status.text}
			</span>
		</svelte:fragment>

		<svelte:fragment slot="cell-createdAt" let:item>
			<span class="text-gray-900 dark:text-gray-200">
				{formatDate(item.createdAt)}
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
				{#if item.status === 'in_warehouse'}
					<button 
						on:click={() => handleDeploy(item)} 
						class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-gray-700" 
						title="현장 배치"
					>
						<Truck class="h-4 w-4" />
					</button>
				{:else if item.status === 'deployed'}
					<button 
						on:click={() => handleRecall(item)} 
						class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-gray-700" 
						title="회수"
					>
						<Package class="h-4 w-4" />
					</button>
				{/if}
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
	<CartInventoryModal
		{modalMode}
		selectedCart={selectedCart}
		on:close={() => (showModal = false)}
		on:save={handleModalSave}
	/>
{/if}

{#if showDeploymentModal}
	<DeploymentModal
		cart={cartToDeploy}
		on:close={() => {
			showDeploymentModal = false;
			cartToDeploy = null;
		}}
		on:save={handleDeploymentSave}
	/>
{/if}

{#if showDeleteDialog}
	<ConfirmDialog
		title="카트 삭제"
		message={`정말로 "${cartToDelete?.serialNumber}" 카트를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`}
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
		message={`선택한 ${currentSelectedCount}개의 카트를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`}
		confirmText="모두 삭제"
		danger={true}
		on:confirm={confirmBulkDelete}
		on:cancel={() => (showBulkDeleteDialog = false)}
	/>
{/if}