<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		cartModelStore,
		cartModelStoreInstance,
		isLoading,
		errorMessage,
		selectedCount
	} from '$lib/stores/cart-model.store';
	import type { CartModel } from '$lib/types/cart-model';
	import type { StatItem } from '$lib/components/common/StatsCards.svelte';
	import type { ColumnDefinition } from '$lib/components/common/DataTable.svelte';

	// Component Imports
	import StatsCards from '$lib/components/common/StatsCards.svelte';
	import FilterBar from '$lib/components/common/FilterBar.svelte';
	import DataTable from '$lib/components/common/DataTable.svelte';
	import CartModelModal from '$lib/components/cart/CartModelModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	// Icon Imports
	import { Settings, Activity, Package, AlertCircle, Eye, Edit, Trash2, X } from 'lucide-svelte';

	// --- Store and State ---
	let storeState: any;
	const unsubscribeStore = cartModelStore.subscribe((value) => {
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
	let selectedModel: CartModel | null = null;
	let modelToDelete: CartModel | null = null;
	let showDeleteDialog = false;
	let showBulkDeleteDialog = false;

	// --- Lifecycle ---
	onMount(() => {
		console.log('🎬 Cart Models page mounted');
		cartModelStoreInstance.loadCartModels();
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
				{ label: '전체 모델', value: storeState.total, icon: Package, color: 'text-blue-500' },
				{
					label: '활성 모델',
					value: storeState.items.filter((m: CartModel) => m.status === 'active').length,
					icon: Activity,
					color: 'text-green-500'
				},
				{
					label: '단종 모델',
					value: storeState.items.filter((m: CartModel) => m.status === 'discontinued').length,
					icon: AlertCircle,
					color: 'text-red-500'
				},
				{
					label: '2024년 모델',
					value: storeState.items.filter((m: CartModel) => m.year === 2024).length,
					icon: Settings,
					color: 'text-purple-500'
				}
			] as StatItem[])
		: [];

	const columns: ColumnDefinition<CartModel>[] = [
		{ key: 'select', label: 'Select', class: 'w-12' },
		{ key: 'modelName', label: '모델명', sortable: true, class: 'min-w-[150px]' },
		{ key: 'modelCode', label: '모델 코드', sortable: true, class: 'w-28' },
		{ key: 'year', label: '연도', sortable: true, class: 'w-20 text-center' },
		{ key: 'specs' as any, label: '최대속도', class: 'w-24 text-center' },
		{ key: 'status', label: '상태', sortable: true, class: 'w-24 text-center' },
		{ key: 'createdAt', label: '등록일', sortable: true, class: 'w-32' },
		{ key: 'actions', label: '액션', class: 'w-24 text-center' }
	];

	// --- Event Handlers ---
	function handleCreate() {
		console.log('➕ Creating new cart model');
		modalMode = 'create';
		selectedModel = null;
		showModal = true;
	}

	function handleView(model: CartModel) {
		console.log('👁️ Viewing cart model:', model.id);
		modalMode = 'view';
		selectedModel = model;
		showModal = true;
	}

	function handleEdit(model: CartModel) {
		console.log('✏️ Editing cart model:', model.id);
		modalMode = 'edit';
		selectedModel = model;
		showModal = true;
	}

	function handleDelete(model: CartModel) {
		console.log('🗑️ Preparing to delete cart model:', model.id);
		modelToDelete = model;
		showDeleteDialog = true;
	}

	async function handleModalSave(event: CustomEvent) {
		const { mode, data } = event.detail;
		console.log('💾 Saving cart model:', mode, data);

		let success = false;
		if (mode === 'create') {
			success = await cartModelStoreInstance.createCartModel(data);
		} else if (mode === 'edit' && selectedModel) {
			success = await cartModelStoreInstance.updateCartModel(selectedModel.id, data);
		}

		if (success) {
			showModal = false;
			selectedModel = null;
		}
	}

	async function confirmDelete() {
		if (modelToDelete) {
			console.log('🗑️ Confirming delete for cart model:', modelToDelete.id);
			await cartModelStoreInstance.deleteCartModel(modelToDelete.id);
		}
		modelToDelete = null;
		showDeleteDialog = false;
	}

	async function confirmBulkDelete() {
		console.log('🗑️ Confirming bulk delete for cart models');
		await cartModelStoreInstance.bulkDelete();
		showBulkDeleteDialog = false;
	}

	// --- Helper Functions ---
	function getStatusInfo(status: string) {
		switch (status) {
			case 'active':
				return {
					color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50',
					text: '활성'
				};
			case 'discontinued':
				return {
					color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50',
					text: '단종'
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
			day: 'numeric'
		});
	}

	function formatSpecs(model: CartModel) {
		const { maxSpeed, batteryType, seats } = model.specs;
		return `${maxSpeed}km/h, ${batteryType}, ${seats}인승`;
	}
</script>

<svelte:head>
	<title>카트 모델 관리 - 골프카트 관제 시스템</title>
	<meta name="description" content="카트 모델 등록 및 관리" />
</svelte:head>

{#if storeState}
	<div class="p-4 md:p-6">
		<!-- Header -->
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">카트 모델 관리</h1>
			<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
				카트 모델 등록 및 관리를 위한 페이지입니다.
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
					on:click={() => errorMessage.set(null)}
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
				searchPlaceholder="모델명, 코드 검색..."
				createLabel="모델 등록"
				selectedCount={currentSelectedCount}
				{loading}
				on:search={(e) => cartModelStoreInstance.search(e.detail)}
				on:refresh={() => cartModelStoreInstance.loadCartModels()}
				on:create={handleCreate}
				on:bulkDelete={() => (showBulkDeleteDialog = true)}
			>
				<svelte:fragment slot="filters">
					<select
						value={storeState.selectedStatus}
						on:change={(e) =>
							cartModelStoreInstance.changeFilter(
								e.currentTarget.value as 'all' | 'active' | 'discontinued'
							)}
						class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="all">전체 상태</option>
						<option value="active">활성</option>
						<option value="discontinued">단종</option>
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
				on:sort={(e) => cartModelStoreInstance.changeSort(e.detail)}
				on:select={(e) => cartModelStoreInstance.toggleSelection(String(e.detail))}
				on:selectAll={cartModelStoreInstance.toggleSelectAll}
				on:pageChange={(e) => cartModelStoreInstance.changePage(e.detail)}
			>
				<div
					slot="empty-state"
					class="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400"
				>
					<Package class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
					<p class="text-lg font-medium">등록된 카트 모델이 없습니다</p>
					<p class="mt-1 text-sm">새로운 카트 모델을 등록해주세요.</p>
				</div>

				<svelte:fragment slot="cell-specs" let:item>
					<span class="text-gray-900 dark:text-gray-200">
						{item.specs.maxSpeed}km/h
					</span>
				</svelte:fragment>

				<svelte:fragment slot="cell-status" let:item>
					{@const status = getStatusInfo(item.status)}
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
	<CartModelModal
		{modalMode}
		{selectedModel}
		on:close={() => (showModal = false)}
		on:save={handleModalSave}
	/>
{/if}

{#if showDeleteDialog}
	<ConfirmDialog
		title="카트 모델 삭제"
		message={`정말로 "${modelToDelete?.modelName}" 모델을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`}
		confirmText="삭제"
		danger={true}
		on:confirm={confirmDelete}
		on:cancel={() => {
			showDeleteDialog = false;
			modelToDelete = null;
		}}
	/>
{/if}

{#if showBulkDeleteDialog}
	<ConfirmDialog
		title="선택 항목 삭제"
		message={`선택한 ${currentSelectedCount}개의 카트 모델을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`}
		confirmText="모두 삭제"
		danger={true}
		on:confirm={confirmBulkDelete}
		on:cancel={() => (showBulkDeleteDialog = false)}
	/>
{/if}
