<script lang="ts">
	import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-svelte';
	import mockCarts from '$lib/mock/carts.json';
	import CartModal from '$lib/components/cart/CartModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	// 카트 데이터 타입 정의
	interface Cart {
		id: string;
		cartName: string;
		modelYear: string;
		manufacturer: string;
		assignedGolfCourseId: string;
		hardware: { mcu: boolean; vcu: boolean; vpu: boolean; acu: boolean };
		sensors: string[];
		capabilities: {
			supportedModes: string[];
			maxSpeed: number;
			battery: { type: string; capacity: string; expectedHours: number };
		};
		network: { macAddress: string; ip: string; isStatic: boolean };
		mqtt: { clientId: string; qos: number };
		cartStatus: {
			currentState: 'available' | 'maintenance' | 'broken' | 'unavailable';
			lastInspection: string;
			nextInspection: string;
		};
	}

	let carts: Cart[] = mockCarts;

	// 상태 관리
	let searchQuery = '';
	let selectedStatus = 'all';
	let modalMode: 'create' | 'edit' | 'view' = 'create';
	let selectedCart: Cart | null = null;
	let showModal = false;
	let showDeleteDialog = false;
	let cartToDelete: Cart | null = null;

	// 필터링된 카트 목록
	$: filteredCarts = carts.filter((cart) => {
		const matchesSearch =
			cart.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			cart.cartName.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = selectedStatus === 'all' || cart.cartStatus.currentState === selectedStatus;
		return matchesSearch && matchesStatus;
	});

	// 상태별 정보
	function getStatusInfo(status: string) {
		switch (status) {
			case 'available':
				return { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50', text: '운행 가능' };
			case 'maintenance':
				return { color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50', text: '정비 중' };
			case 'broken':
				return { color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50', text: '고장' };
			default:
				return { color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700', text: '미사용' };
		}
	}

	// CRUD 액션
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
	function confirmDelete() {
		if (cartToDelete) {
			// TODO: API 연동
			carts = carts.filter((c) => c.id !== cartToDelete?.id);
		}
		showDeleteDialog = false;
	}
	function handleModalSave(event: CustomEvent) {
		const { mode, data } = event.detail;
		if (mode === 'create') {
			carts = [...carts, data];
		} else {
			carts = carts.map((c) => (c.id === data.id ? data : c));
		}
		showModal = false;
	}
</script>

<svelte:head>
	<title>카트 관리 - 골프카트 관제 시스템</title>
</svelte:head>

<div class="space-y-6 p-6">
	<!-- 헤더 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="mb-1 text-2xl font-bold">카트 관리</h1>
			<p class="text-gray-600">골프장에 등록된 카트의 정보를 관리합니다.</p>
		</div>
		<button on:click={handleCreate} class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
			<Plus class="h-4 w-4" />
			새 카트 등록
		</button>
	</div>

	<!-- 검색 및 필터 -->
	<div class="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
		<div class="flex flex-col items-center gap-4 md:flex-row">
			<div class="relative flex-1">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<input type="text" placeholder="카트 ID, 이름으로 검색..." bind:value={searchQuery} class="w-full rounded-lg border-gray-300 pl-10 dark:border-gray-600 dark:bg-gray-700" />
			</div>
			<div class="flex items-center gap-2">
				<Filter class="h-4 w-4 text-gray-400" />
				<select bind:value={selectedStatus} class="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700">
					<option value="all">전체 상태</option>
					<option value="available">운행 가능</option>
					<option value="maintenance">정비 중</option>
					<option value="broken">고장</option>
					<option value="unavailable">미사용</option>
				</select>
			</div>
		</div>
	</div>

	<!-- 카트 목록 테이블 -->
	<div class="overflow-hidden rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50 dark:bg-gray-700">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">카트 ID/이름</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">할당 골프장</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">모델/제조사</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">운행 모드</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">상태</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">작업</th>
					</tr>
				</thead>
				<tbody class="divide-y dark:divide-gray-700">
					{#each filteredCarts as cart (cart.id)}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
							<td class="px-6 py-4">
								<div class="font-medium">{cart.id}</div>
								<div class="text-sm text-gray-500">{cart.cartName}</div>
							</td>
							<td class="px-6 py-4 text-sm">{cart.assignedGolfCourseId}</td>
							<td class="px-6 py-4 text-sm">
								<div>{cart.modelYear}</div>
								<div class="text-xs text-gray-500">{cart.manufacturer}</div>
							</td>
							<td class="px-6 py-4 text-sm">{cart.capabilities.supportedModes.join(', ')}</td>
							<td class="px-6 py-4">
								<span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 {getStatusInfo(cart.cartStatus.currentState).color}">
									{getStatusInfo(cart.cartStatus.currentState).text}
								</span>
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<button on:click={() => handleView(cart)} title="상세보기" class="p-1.5 text-gray-400 hover:text-blue-600"><Eye class="h-4 w-4" /></button>
									<button on:click={() => handleEdit(cart)} title="수정" class="p-1.5 text-gray-400 hover:text-green-600"><Edit class="h-4 w-4" /></button>
									<button on:click={() => handleDelete(cart)} title="삭제" class="p-1.5 text-gray-400 hover:text-red-600"><Trash2 class="h-4 w-4" /></button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- 모달 -->
{#if showModal}
	<CartModal {modalMode} {selectedCart} on:save={handleModalSave} on:close={() => (showModal = false)} />
{/if}

<!-- 삭제 확인 다이얼로그 -->
{#if showDeleteDialog}
	<ConfirmDialog
		title="카트 삭제"
		message={`'${cartToDelete?.cartName}' 카트를 정말 삭제하시겠습니까?`}
		on:confirm={confirmDelete}
		on:cancel={() => (showDeleteDialog = false)}
	/>
{/if}
