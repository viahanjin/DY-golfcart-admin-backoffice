<script lang="ts">
	import { Plus, Search, Filter, Edit, Trash2, Eye, Car, Download } from 'lucide-svelte';
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
			<h1 class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">카트 관리</h1>
			<p class="text-gray-600 dark:text-gray-400">골프장에 등록된 카트의 정보를 관리합니다.</p>
		</div>
	</div>

	<!-- 통계 카드 -->
	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<Car class="h-8 w-8 text-blue-500" />
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">전체 카트</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{carts.length}</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="h-8 w-8 rounded bg-green-100 p-2 dark:bg-green-900/50">
					<div class="h-4 w-4 rounded-full bg-green-500"></div>
				</div>
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">운행 가능</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{carts.filter(c => c.cartStatus.currentState === 'available').length}
					</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="h-8 w-8 rounded bg-yellow-100 p-2 dark:bg-yellow-900/50">
					<div class="h-4 w-4 rounded-full bg-yellow-500"></div>
				</div>
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">정비 중</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{carts.filter(c => c.cartStatus.currentState === 'maintenance').length}
					</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="h-8 w-8 rounded bg-red-100 p-2 dark:bg-red-900/50">
					<div class="h-4 w-4 rounded-full bg-red-500"></div>
				</div>
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">고장</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{carts.filter(c => c.cartStatus.currentState === 'broken').length}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- 필터 및 액션 바 -->
	<div class="mb-4 flex flex-col gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-1 gap-2">
			<!-- 검색 -->
			<div class="relative flex-1 sm:max-w-xs">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="카트 ID, 이름으로 검색..."
					class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<!-- 골프장 필터 -->
			<select
				class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="all">전체 골프장</option>
				<option value="1">서울 컨트리클럽</option>
				<option value="2">부산 오션뷰 골프장</option>
			</select>

			<!-- 상태 필터 -->
			<select
				bind:value={selectedStatus}
				class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="all">전체 상태</option>
				<option value="available">운행 가능</option>
				<option value="maintenance">정비 중</option>
				<option value="broken">고장</option>
				<option value="unavailable">미사용</option>
			</select>
		</div>

		<div class="flex gap-2">
			<button
				class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			>
				<Download class="h-4 w-4" />
				엑셀
			</button>
			
			<button
				on:click={handleCreate}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				<Plus class="h-4 w-4" />
				카트 추가
			</button>
		</div>
	</div>

	<!-- 테이블 -->
	<div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
		{#if filteredCarts.length === 0}
			<div class="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
				<Car class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
				<p class="text-lg font-medium">등록된 카트가 없습니다</p>
				<p class="mt-1 text-sm">새로운 카트를 추가해주세요.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
						<tr>
							<th class="px-4 py-3 text-left">
								<button
									class="flex items-center gap-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
								>
									<input type="checkbox" class="h-4 w-4 rounded" />
								</button>
							</th>
							<th class="px-4 py-3 text-left">
								<button
									class="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
								>
									카트 정보
								</button>
							</th>
							<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">할당 골프장</th>
							<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">하드웨어</th>
							<th class="px-4 py-3 text-left">
								<button
									class="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
								>
									상태
								</button>
							</th>
							<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">배터리</th>
							<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">최근 점검</th>
							<th class="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-200">액션</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each filteredCarts as cart (cart.id)}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
								<td class="px-4 py-3">
									<button
										class="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
									>
										<input type="checkbox" class="h-4 w-4 rounded" />
									</button>
								</td>
								<td class="px-4 py-3">
									<div>
										<p class="font-medium text-gray-900 dark:text-white">{cart.id}</p>
										<p class="text-sm text-gray-500 dark:text-gray-400">{cart.cartName || '이름 없음'}</p>
									</div>
								</td>
								<td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
									{#if cart.assignedGolfCourseId === '1'}서울 컨트리클럽
									{:else if cart.assignedGolfCourseId === '2'}부산 오션뷰 골프장
									{:else}미할당{/if}
								</td>
								<td class="px-4 py-3">
									<div class="text-sm text-gray-900 dark:text-white">
										{#if cart.hardware.acu}ACU
										{:else if cart.hardware.vcu}VCU
										{:else if cart.hardware.vpu}VPU
										{:else}MCU{/if}
									</div>
									<div class="text-xs text-gray-500 dark:text-gray-400">
										{cart.manufacturer} {cart.modelYear}
									</div>
								</td>
								<td class="px-4 py-3">
									<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusInfo(cart.cartStatus.currentState).color}">
										{getStatusInfo(cart.cartStatus.currentState).text}
									</span>
								</td>
								<td class="px-4 py-3">
									<div class="text-sm text-gray-900 dark:text-white">{cart.capabilities.battery.capacity}</div>
									<div class="text-xs text-gray-500 dark:text-gray-400">{cart.capabilities.battery.type}</div>
								</td>
								<td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
									{cart.cartStatus.lastInspection || '점검 기록 없음'}
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center justify-center gap-1">
										<button
											on:click={() => handleView(cart)}
											class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700"
											title="상세보기"
										>
											<Eye class="h-4 w-4" />
										</button>
										<button
											on:click={() => handleEdit(cart)}
											class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-700"
											title="수정"
										>
											<Edit class="h-4 w-4" />
										</button>
										<button
											on:click={() => handleDelete(cart)}
											class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700"
											title="삭제"
										>
											<Trash2 class="h-4 w-4" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
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
