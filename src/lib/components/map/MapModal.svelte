<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { X } from 'lucide-svelte';

	export let modalMode: 'create' | 'edit' | 'view';
	export let selectedMap: any = null;

	const dispatch = createEventDispatcher();

	function getInitialFormData() {
		return {
			mapId: '',
			mapName: '',
			connectedGolfCourseId: '',
			version: '1.0',
			mapData: {
				resolution: '',
				size: '',
				originGps: { latitude: 0, longitude: 0 },
				rotation: 0
			},
			mapFiles: { imageFile: '', metadataFile: '' },
			courseInfo: { totalCourses: 2, defaultMode: 'auto', defaultSpeedLimit: 15 },
			mapStatus: { status: 'testing', validationStatus: 'pending', appliedCarts: [], lastUpdate: '' }
		};
	}

	let formData = getInitialFormData();
	$: isReadOnly = modalMode === 'view';

	onMount(() => {
		if (selectedMap && (modalMode === 'edit' || modalMode === 'view')) {
			formData = JSON.parse(JSON.stringify(selectedMap));
		} else {
			formData.mapId = `MAP-${Date.now().toString().slice(-6)}`;
		}
	});

	function handleSave() {
		if (formData.mapName && formData.connectedGolfCourseId) {
			dispatch('save', { mode: modalMode, data: formData });
		} else {
			alert('맵 이름과 연결 골프장은 필수 항목입니다.');
		}
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
	<div class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white dark:bg-gray-800">
		<div class="flex items-center justify-between border-b p-6 dark:border-gray-700">
			<h2 class="text-xl font-semibold">
				{modalMode === 'create' ? '새 맵 등록' : modalMode === 'edit' ? '맵 정보 수정' : '맵 상세 정보'}
			</h2>
			<button on:click={() => dispatch('close')} class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X class="h-5 w-5" /></button>
		</div>

		<div class="space-y-6 p-6">
			<!-- 맵 기본 정보 -->
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold dark:text-white">맵 기본 정보</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div><label for="mapName" class="dark:text-gray-300">맵 이름 *</label><input id="mapName" type="text" bind:value={formData.mapName} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
					<div><label for="version" class="dark:text-gray-300">맵 버전 *</label><input id="version" type="text" bind:value={formData.version} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				</div>
				<div><label for="connectedGolfCourseId" class="dark:text-gray-300">연결 골프장 *</label>
					<select id="connectedGolfCourseId" bind:value={formData.connectedGolfCourseId} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
						<option value="">선택하세요</option>
						<option value="1">서울 컨트리클럽</option>
						<option value="2">부산 오션뷰 골프장</option>
					</select>
				</div>
			</div>

			<!-- 맵 데이터 정보 -->
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold dark:text-white">맵 데이터 정보</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div><label for="resolution" class="dark:text-gray-300">해상도 (cm/pixel)</label><input id="resolution" type="text" bind:value={formData.mapData.resolution} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
					<div><label for="size" class="dark:text-gray-300">맵 크기 (m x m)</label><input id="size" type="text" bind:value={formData.mapData.size} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
					<div><label for="lat" class="dark:text-gray-300">맵 원점 위도</label><input id="lat" type="number" bind:value={formData.mapData.originGps.latitude} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
					<div><label for="lon" class="dark:text-gray-300">맵 원점 경도</label><input id="lon" type="number" bind:value={formData.mapData.originGps.longitude} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				</div>
			</div>

			<!-- 맵 파일 정보 -->
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold dark:text-white">맵 파일 정보 (TODO: 파일 업로드 기능)</h3>
				<div><label for="imageFile" class="dark:text-gray-300">맵 이미지 파일 (PNG, JPG)</label><input id="imageFile" type="text" placeholder="파일 경로..." bind:value={formData.mapFiles.imageFile} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				<div><label for="metadataFile" class="dark:text-gray-300">메타데이터 파일 (JSON)</label><input id="metadataFile" type="text" placeholder="파일 경로..." bind:value={formData.mapFiles.metadataFile} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
			</div>

			<!-- 맵 상태 및 관리 -->
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold dark:text-white">맵 상태 및 관리</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div><label for="status" class="dark:text-gray-300">맵 상태</label>
						<select id="status" bind:value={formData.mapStatus.status} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
							<option value="active">활성</option>
							<option value="testing">테스트 중</option>
							<option value="inactive">비활성</option>
						</select>
					</div>
					<div><label for="validationStatus" class="dark:text-gray-300">검증 상태</label>
						<select id="validationStatus" bind:value={formData.mapStatus.validationStatus} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
							<option value="verified">검증 완료</option>
							<option value="pending">검증 대기</option>
							<option value="failed">검증 실패</option>
						</select>
					</div>
				</div>
			</div>
		</div>

		<div class="flex items-center justify-end gap-3 border-t px-6 py-4 dark:border-gray-700">
			{#if !isReadOnly}
				<button on:click={() => dispatch('close')} class="rounded-lg border bg-white px-4 py-2 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700">취소</button>
				<button on:click={handleSave} class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
					{modalMode === 'create' ? '등록' : '수정'}
				</button>
			{:else}
				<button on:click={() => dispatch('close')} class="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">닫기</button>
			{/if}
		</div>
	</div>
</div>
