<script lang="ts">
	import { Plus, Search, Filter, Edit, Trash2, Eye, Map, CheckCircle, XCircle, Clock } from 'lucide-svelte';
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
			case 'active': return { color: 'text-green-600 bg-green-100', text: '활성' };
			case 'testing': return { color: 'text-blue-600 bg-blue-100', text: '테스트 중' };
			case 'inactive': return { color: 'text-gray-600 bg-gray-100', text: '비활성' };
		}
	}

	function getValidationIcon(status: 'verified' | 'pending' | 'failed') {
		switch (status) {
			case 'verified': return CheckCircle;
			case 'pending': return Clock;
			case 'failed': return XCircle;
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
	<div class="flex items-center justify-between">
		<div>
			<h1 class="mb-1 text-2xl font-bold">맵 관리</h1>
			<p class="text-gray-600">골프장 맵 데이터를 관리하고 버전을 제어합니다.</p>
		</div>
		<button on:click={handleCreate} class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
			<Plus class="h-4 w-4" />
			새 맵 등록
		</button>
	</div>

	<!-- 검색 및 필터 -->
	<div class="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
		<div class="flex flex-col items-center gap-4 md:flex-row">
			<div class="relative flex-1">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<input type="text" placeholder="맵 이름, ID로 검색..." bind:value={searchQuery} class="w-full rounded-lg border-gray-300 pl-10 dark:border-gray-600 dark:bg-gray-700" />
			</div>
			<div class="flex items-center gap-2">
				<Filter class="h-4 w-4 text-gray-400" />
				<select bind:value={selectedStatus} class="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700">
					<option value="all">전체 상태</option>
					<option value="active">활성</option>
					<option value="testing">테스트 중</option>
					<option value="inactive">비활성</option>
				</select>
			</div>
		</div>
	</div>

	<!-- 맵 목록 테이블 -->
	<div class="overflow-hidden rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800">
		<table class="w-full">
			<thead class="bg-gray-50 dark:bg-gray-700">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">맵 이름/ID</th>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">버전</th>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">연결 골프장</th>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">상태</th>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">검증</th>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">최근 수정일</th>
					<th class="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">작업</th>
				</tr>
			</thead>
			<tbody class="divide-y dark:divide-gray-700">
				{#each filteredMaps as map (map.mapId)}
				<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
					<td class="px-6 py-4">
						<div class="font-medium">{map.mapName}</div>
						<div class="text-sm text-gray-500">{map.mapId}</div>
					</td>
					<td class="px-6 py-4 text-sm font-mono">v{map.version}</td>
					<td class="px-6 py-4 text-sm">{map.connectedGolfCourseId}</td>
					<td class="px-6 py-4">
						<span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 {getStatusInfo(map.mapStatus.status).color}">
							{getStatusInfo(map.mapStatus.status).text}
						</span>
					</td>
					<td class="px-6 py-4">
						<svelte:component this={getValidationIcon(map.mapStatus.validationStatus)} class="h-5 w-5"
							class:text-green-500={map.mapStatus.validationStatus === 'verified'}
							class:text-yellow-500={map.mapStatus.validationStatus === 'pending'}
							class:text-red-500={map.mapStatus.validationStatus === 'failed'}
						/>
					</td>
					<td class="px-6 py-4 text-sm text-gray-500">{new Date(map.updatedAt).toLocaleDateString()}</td>
					<td class="px-6 py-4 text-right">
						<div class="flex items-center justify-end gap-2">
							<button on:click={() => handleView(map)} title="상세보기" class="p-1.5 text-gray-400 hover:text-blue-600"><Eye class="h-4 w-4" /></button>
							<button on:click={() => handleEdit(map)} title="수정" class="p-1.5 text-gray-400 hover:text-green-600"><Edit class="h-4 w-4" /></button>
							<button on:click={() => handleDelete(map)} title="삭제" class="p-1.5 text-gray-400 hover:text-red-600"><Trash2 class="h-4 w-4" /></button>
						</div>
					</td>
				</tr>
				{/each}
			</tbody>
		</table>
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
