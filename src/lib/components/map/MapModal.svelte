<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Upload, File } from 'lucide-svelte';
	import { mapService } from '$lib/services/mapService';
	import BaseModal from '$lib/components/common/BaseModal.svelte';

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

	// 파일 선택 기능 구현
	function handleImageFileSelect() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/png,image/jpg,image/jpeg';
		input.multiple = false;
		
		input.onchange = (e) => {
			const target = e.target as HTMLInputElement;
			const file = target.files?.[0];
			if (file) {
				// 파일 크기 검증 (10MB)
				if (file.size > 10 * 1024 * 1024) {
					alert('파일 크기는 10MB 이하여야 합니다.');
					return;
				}
				
				// 파일 형식 검증
				const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
				if (!allowedTypes.includes(file.type)) {
					alert('PNG, JPG, JPEG 파일만 업로드 가능합니다.');
					return;
				}
				
				// 파일 경로를 입력 필드에 설정 (실제로는 파일 이름)
				formData.mapFiles.imageFile = file.name;
				
				// 실제 파일 업로드 API 호출
				mapService.uploadImageFile(file, formData.mapId)
					.then(result => {
						console.log('이미지 파일 업로드 성공:', result);
						if (result.url) {
							formData.mapFiles.imageFile = result.url;
						}
					})
					.catch(error => {
						console.error('이미지 파일 업로드 실패:', error);
						alert('파일 업로드 중 오류가 발생했습니다.');
					});
			}
		};
		
		input.click();
	}

	function handleMetadataFolderSelect() {
		const input = document.createElement('input');
		input.type = 'file';
		input.webkitdirectory = true;
		input.multiple = true;
		
		input.onchange = (e) => {
			const target = e.target as HTMLInputElement;
			const files = Array.from(target.files || []) as File[];
			if (files.length > 0) {
				// 선택된 폴더의 상위 폴더 경로 추출
				const firstFile = files[0];
				const folderPath = firstFile.webkitRelativePath.split('/')[0];
				
				// JSON 파일들 필터링
				const jsonFiles = files.filter(file => 
					file.type === 'application/json' || file.name.endsWith('.json')
				);
				
				if (jsonFiles.length === 0) {
					alert('선택한 폴더에 JSON 파일이 없습니다.');
					return;
				}
				
				// 총 폴더 크기 검증 (10MB)
				const totalSize = files.reduce((sum, file) => sum + file.size, 0);
				if (totalSize > 10 * 1024 * 1024) {
					alert('폴더 총 크기는 10MB 이하여야 합니다.');
					return;
				}
				
				// 폴더 경로를 입력 필드에 설정
				formData.mapFiles.metadataFile = folderPath;
				
				// 실제 폴더 업로드 API 호출
				mapService.uploadMetadataFolder(files, formData.mapId)
					.then(result => {
						console.log('메타데이터 폴더 업로드 성공:', result);
						if (result.folderPath) {
							formData.mapFiles.metadataFile = result.folderPath;
						}
					})
					.catch(error => {
						console.error('메타데이터 폴더 업로드 실패:', error);
						alert('폴더 업로드 중 오류가 발생했습니다.');
					});
			}
		};
		
		input.click();
	}
</script>

<BaseModal size="3xl" on:close={() => dispatch('close')}>
	<span slot="title">
		{modalMode === 'create' ? '새 맵 등록' : modalMode === 'edit' ? '맵 정보 수정' : '맵 상세 정보'}
	</span>

	<div class="space-y-6">
		<!-- 맵 기본 정보 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold dark:text-white">맵 기본 정보</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div><label for="mapName" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 이름 *</label><input id="mapName" type="text" bind:value={formData.mapName} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				<div><label for="version" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 버전 *</label><input id="version" type="text" bind:value={formData.version} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
			</div>
			<div><label for="connectedGolfCourseId" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">연결 골프장 *</label>
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
				<div><label for="resolution" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">해상도 (cm/pixel)</label><input id="resolution" type="text" bind:value={formData.mapData.resolution} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				<div><label for="size" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 크기 (m x m)</label><input id="size" type="text" bind:value={formData.mapData.size} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				<div><label for="lat" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 원점 위도</label><input id="lat" type="number" bind:value={formData.mapData.originGps.latitude} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				<div><label for="lon" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 원점 경도</label><input id="lon" type="number" bind:value={formData.mapData.originGps.longitude} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
			</div>
		</div>

		<!-- 맵 파일 정보 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold dark:text-white">맵 파일 정보</h3>

			<!-- 이미지 파일 -->
			<div>
				<label for="imageFile" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 이미지 파일 (PNG, JPG) *</label>
				<div class="flex gap-2">
					<input
						id="imageFile"
						type="text"
						placeholder="파일을 선택해주세요..."
						bind:value={formData.mapFiles.imageFile}
						disabled={isReadOnly}
						class="flex-1 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						readonly
					/>
					<button
						type="button"
						on:click={handleImageFileSelect}
						disabled={isReadOnly}
						class="flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Upload class="h-4 w-4" />
						파일 선택
					</button>
				</div>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">지원 형식: PNG, JPG, JPEG (최대 10MB)</p>
			</div>

			<!-- 메타데이터 폴더 -->
			<div>
				<label for="metadataFile" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">메타데이터 폴더 *</label>
				<div class="flex gap-2">
					<input
						id="metadataFile"
						type="text"
						placeholder="폴더를 선택해주세요..."
						bind:value={formData.mapFiles.metadataFile}
						disabled={isReadOnly}
						class="flex-1 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						readonly
					/>
					<button
						type="button"
						on:click={handleMetadataFolderSelect}
						disabled={isReadOnly}
						class="flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<File class="h-4 w-4" />
						폴더 선택
					</button>
				</div>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">폴더 내 JSON 파일들 (최대 10MB)</p>
			</div>

			<!-- 파일 업로드 상태 (추후 구현) -->
			{#if formData.mapFiles.imageFile || formData.mapFiles.metadataFile}
				<div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
					<h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">선택된 파일</h4>
					<div class="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
						{#if formData.mapFiles.imageFile}
							<div class="flex items-center gap-2">
								<Upload class="h-4 w-4" />
								이미지: {formData.mapFiles.imageFile.split('/').pop() || formData.mapFiles.imageFile}
							</div>
						{/if}
						{#if formData.mapFiles.metadataFile}
							<div class="flex items-center gap-2">
								<File class="h-4 w-4" />
								메타데이터 폴더: {formData.mapFiles.metadataFile}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
		<!-- 맵 상태 및 관리 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold dark:text-white">맵 상태 및 관리</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div><label for="status" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 상태</label>
					<select id="status" bind:value={formData.mapStatus.status} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
						<option value="active">활성</option>
						<option value="testing">테스트 중</option>
						<option value="inactive">비활성</option>
					</select>
				</div>
				<div><label for="validationStatus" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">검증 상태</label>
					<select id="validationStatus" bind:value={formData.mapStatus.validationStatus} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
						<option value="verified">검증 완료</option>
						<option value="pending">검증 대기</option>
						<option value="failed">검증 실패</option>
					</select>
				</div>
			</div>
		</div>
	</div>

	<div slot="footer">
		{#if !isReadOnly}
			<button on:click={() => dispatch('close')} class="rounded-lg border bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">취소</button>
			<button on:click={handleSave} class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
				{modalMode === 'create' ? '등록' : '수정'}
			</button>
		{:else}
			<button on:click={() => dispatch('close')} class="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">닫기</button>
		{/if}
	</div>
</BaseModal>
