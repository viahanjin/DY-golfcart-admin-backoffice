<script lang="ts">
	import { Plus, Search, Filter, Edit, Trash2, Eye, Map, CheckCircle, XCircle, Clock, Download, Activity, AlertTriangle } from 'lucide-svelte';
	import mockMaps from '$lib/mock/maps.json';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import MapModal from '$lib/components/map/MapModal.svelte';

	interface MapData {
		mapId: string;
		mapName: string;
		connectedGolfCourseId: string;
		version: string;
		createdAt: string;
		updatedAt: string;
		mapStatus: {
			status: 'active' | 'testing' | 'inactive';
			validationStatus: 'verified' | 'pending' | 'failed';
		};
	}

	let maps: MapData[] = mockMaps;
	let searchQuery = '';
	let selectedStatus = 'all';

	let showModal = false;
	let modalMode: 'create' | 'edit' | 'view' = 'create';
	let selectedMap: MapData | null = null;
	let showDeleteDialog = false;
	let mapToDelete: MapData | null = null;

	$: filteredMaps = maps.filter(map => {
		const matchesSearch =
			map.mapName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			map.mapId.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = selectedStatus === 'all' || map.mapStatus.status === selectedStatus;
		return matchesSearch && matchesStatus;
	});

	function getStatusInfo(status: 'active' | 'testing' | 'inactive') {
		switch (status) {
			case 'active': return { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50', text: '활성' };
			case 'testing': return { color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50', text: '테스트 중' };
			case 'inactive': return { color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700', text: '비활성' };
		}
	}

	function getValidationIcon(status: 'verified' | 'pending' | 'failed') {
		switch (status) {
			case 'verified': return CheckCircle;
			case 'pending': return Clock;
			case 'failed': return XCircle;
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
	function confirmDelete() {
		if (mapToDelete) {
			maps = maps.filter(m => m.mapId !== mapToDelete?.mapId);
		}
		showDeleteDialog = false;
	}
	function handleModalSave(event: CustomEvent) {
		const { mode, data } = event.detail;
		if (mode === 'create') {
			maps = [...maps, data];
		} else {
			maps = maps.map((m) => (m.mapId === data.mapId ? data : m));
		}
		showModal = false;
	}

</script>

<svelte:head>
	<title>맵 관리 - 골프카트 관제 시스템</title>
</svelte:head>

<div class="space-y-6 p-6">
	<!-- 헤더 -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">맵 관리</h1>
		<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">골프장 맵 데이터를 관리하고 버전을 제어합니다.</p>
	</div>

	<!-- 통계 카드 -->
	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<Map class="h-8 w-8 text-blue-500" />
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">전체 맵</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{maps.length}</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<Activity class="h-8 w-8 text-green-500" />
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">활성 맵</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{maps.filter(m => m.mapStatus.status === 'active').length}
					</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="h-8 w-8 rounded bg-blue-100 p-2 dark:bg-blue-900/50">
					<div class="h-4 w-4 rounded-full bg-blue-500"></div>
				</div>
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">테스트 중</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{maps.filter(m => m.mapStatus.status === 'testing').length}
					</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<CheckCircle class="h-8 w-8 text-green-500" />
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">검증 완료</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{maps.filter(m => m.mapStatus.validationStatus === 'verified').length}
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
					placeholder="맵 이름, ID로 검색..."
					class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<!-- 상태 필터 -->
			<select
				bind:value={selectedStatus}
				class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="all">전체 상태</option>
				<option value="active">활성</option>
				<option value="testing">테스트 중</option>
				<option value="inactive">비활성</option>
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
				맵 추가
			</button>
		</div>
	</div>

	<!-- 테이블 -->
	<div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
		{#if filteredMaps.length === 0}
			<div class="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
				<Map class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
				<p class="text-lg font-medium">등록된 맵이 없습니다</p>
				<p class="mt-1 text-sm">새로운 맵을 추가해주세요.</p>
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
									맵 정보
								</button>
							</th>
							<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">버전</th>
							<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">연결 골프장</th>
							<th class="px-4 py-3 text-left">
								<button
									class="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
								>
									상태
								</button>
							</th>
							<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">검증 상태</th>
							<th class="px-4 py-3 text-left">
								<button
									class="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
								>
									최근 수정
								</button>
							</th>
							<th class="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-200">액션</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each filteredMaps as map (map.mapId)}
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
										<p class="font-medium text-gray-900 dark:text-white">{map.mapName}</p>
										<p class="text-sm text-gray-500 dark:text-gray-400">{map.mapId}</p>
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="text-sm font-mono text-gray-900 dark:text-white">v{map.version}</div>
									<div class="text-xs text-gray-500 dark:text-gray-400">
										{new Date(map.createdAt).toLocaleDateString()}
									</div>
								</td>
								<td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
									{#if map.connectedGolfCourseId === '1'}서울 컨트리클럽
									{:else if map.connectedGolfCourseId === '2'}부산 오션뷰 골프장
									{:else}미연결{/if}
								</td>
								<td class="px-4 py-3">
									<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusInfo(map.mapStatus.status).color}">
										{getStatusInfo(map.mapStatus.status).text}
									</span>
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										<svelte:component
											this={getValidationIcon(map.mapStatus.validationStatus)}
											class={getValidationClass(map.mapStatus.validationStatus)}
										/>
										<span class="text-sm text-gray-700 dark:text-gray-200">
											{#if map.mapStatus.validationStatus === 'verified'}검증 완료
											{:else if map.mapStatus.validationStatus === 'pending'}검증 대기
											{:else}검증 실패{/if}
										</span>
									</div>
								</td>
								<td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
									{new Date(map.updatedAt).toLocaleDateString('ko-KR', {
										year: 'numeric',
										month: 'short',
										day: 'numeric'
									})}
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center justify-center gap-1">
										<button
											on:click={() => handleView(map)}
											class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700"
											title="상세보기"
										>
											<Eye class="h-4 w-4" />
										</button>
										<button
											on:click={() => handleEdit(map)}
											class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-700"
											title="수정"
										>
											<Edit class="h-4 w-4" />
										</button>
										<button
											on:click={() => handleDelete(map)}
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

{#if showModal}
	<MapModal {modalMode} {selectedMap} on:save={handleModalSave} on:close={() => (showModal = false)} />
{/if}

{#if showDeleteDialog}
	<ConfirmDialog
		title="맵 삭제"
		message={`'${mapToDelete?.mapName}' (v${mapToDelete?.version}) 맵을 정말 삭제하시겠습니까?`}
		on:confirm={confirmDelete}
		on:cancel={() => (showDeleteDialog = false)}
	/>
{/if}
