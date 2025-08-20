<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Upload, AlertCircle, CheckCircle, FolderOpen } from 'lucide-svelte';
	import { File as FileIcon } from 'lucide-svelte';
	import { mapService } from '$lib/services/map.service';
	import { mapStore } from '$lib/stores/map.store';
	import BaseModal from '$lib/components/common/BaseModal.svelte';
	import FolderTree from '$lib/components/ui/FolderTree.svelte';
	import {
		buildFolderTree,
		validateNestedMetadataStructure,
		getTreeStats,
		type FileNode
	} from '$lib/utils/folder-tree';
	import { parseGeoJSONFiles, type GeoJSONPreviewData } from '$lib/utils/geojson-preview';
	import GeoJSONPreview from '$lib/components/ui/GeoJSONPreview.svelte';
	import type { MapData } from '$lib/types/map';

	export let modalMode: 'create' | 'edit' | 'view';
	export let selectedMap: MapData | null = null;

	const dispatch = createEventDispatcher();

	function getInitialFormData() {
		return {
			id: '',
			name: '',
			description: '',
			golfCourseId: '',
			golfCourseName: '',
			type: '2D' as '3D' | '2D' | 'SATELLITE',
			version: '1.0',
			imageUrl: '',
			thumbnailUrl: '',
			metadataUrl: '',
			bounds: {
				north: 0,
				south: 0,
				east: 0,
				west: 0
			},
			layers: [],
			fileSize: 0,
			resolution: '',
			createdAt: '',
			updatedAt: ''
		};
	}

	let formData = getInitialFormData();
	$: isReadOnly = modalMode === 'view';

	// 실제 파일 객체 저장
	let selectedImageFile: File | null = null;
	let selectedMetadataFiles: File[] = [];

	// 폴더 트리 상태
	let selectedFiles: File[] = [];
	let folderTree: FileNode[] = [];
	let validationResult: {
		isValid: boolean;
		errors: string[];
		warnings: string[];
		validSubfolders: Array<{
			folder: FileNode;
			metadataFiles: FileNode[];
			geoJsonFiles: FileNode[];
			otherJsonFiles: FileNode[];
		}>;
	} | null = null;
	let showFolderDetails = false;

	// GeoJSON 미리보기 상태
	let geoJsonPreviewData: GeoJSONPreviewData[] = [];

	// 업로드 상태
	let isUploading = false;

	onMount(() => {
		if (selectedMap && (modalMode === 'edit' || modalMode === 'view')) {
			formData = JSON.parse(JSON.stringify(selectedMap));
		} else {
			// 더 고유한 ID 생성 (타임스탬프 + 랜덤 값)
			const timestamp = Date.now().toString();
			const random = Math.floor(Math.random() * 1000)
				.toString()
				.padStart(3, '0');
			formData.id = `MAP-${timestamp.slice(-6)}${random}`;
		}
	});

	async function handleSave() {
		if (!formData.name || !formData.golfCourseId) {
			alert('맵 이름과 연결 골프장은 필수 항목입니다.');
			return;
		}

		isUploading = true;

		try {
			console.log('=== 맵 저장 시작 ===');
			console.log('모드:', modalMode);
			console.log('선택된 이미지 파일:', selectedImageFile?.name);
			console.log('선택된 메타데이터 파일 수:', selectedMetadataFiles.length);

			// 1. 이미지 파일 업로드 (있는 경우)
			if (selectedImageFile) {
				console.log('이미지 파일 업로드 중...');
				const imageResult = await mapService.uploadImageFile(selectedImageFile, formData.id);
				if (imageResult.success && imageResult.data?.url) {
					formData.imageUrl = imageResult.data.url;
					formData.thumbnailUrl = imageResult.data.thumbnailUrl || '';
					formData.fileSize = imageResult.data.size;
					formData.resolution = imageResult.data.resolution || formData.resolution || '';
					console.log('이미지 업로드 성공:', imageResult.data);
				} else {
					throw new Error('이미지 파일 업로드에 실패했습니다.');
				}
			}

			// 2. 메타데이터 파일들 업로드 (있는 경우)
			if (selectedMetadataFiles.length > 0) {
				console.log('메타데이터 파일 업로드 중...');
				const metadataResult = await mapService.uploadMetadataFolder(
					selectedMetadataFiles,
					formData.id
				);
				if (metadataResult.success && metadataResult.data?.folderPath) {
					formData.metadataUrl = metadataResult.data.folderPath;
					console.log('메타데이터 업로드 성공:', metadataResult.data);
				} else {
					throw new Error('메타데이터 폴더 업로드에 실패했습니다.');
				}
			}

			console.log('파일 업로드 완료, 맵 정보 저장 중...');
			console.log('최종 전송할 데이터:', formData);

			if (modalMode === 'create') {
				// mapStore의 createMap 함수 사용
				const result = await mapStore.createMap(formData);

				if (result.success) {
					alert('맵이 성공적으로 등록되었습니다!');
					dispatch('save', { mode: modalMode, data: result.data });
				} else {
					throw new Error(result.error?.message || '맵 등록에 실패했습니다.');
				}
			} else if (modalMode === 'edit') {
				// mapStore의 updateMap 함수 사용
				const result = await mapStore.updateMap(formData.id, formData);

				if (result.success) {
					alert('맵이 성공적으로 수정되었습니다!');
					dispatch('save', { mode: modalMode, data: result.data });
				} else {
					throw new Error(result.error?.message || '맵 수정에 실패했습니다.');
				}
			}
		} catch (error) {
			console.error('맵 저장 오류:', error);
			const errorMessage =
				error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
			alert(`오류가 발생했습니다: ${errorMessage}`);
		} finally {
			isUploading = false;
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

				// 실제 파일 객체를 저장 (나중에 업로드)
				selectedImageFile = file;
				// UI에 파일명 표시
				formData.imageUrl = file.name;

				console.log('이미지 파일 선택됨:', file.name, file.size, 'bytes');
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
				// 선택된 파일들 저장
				selectedFiles = files;

				// 폴더 트리 구성
				folderTree = buildFolderTree(files);
				console.log('생성된 폴더 트리:', folderTree);

				// 중첩 구조 검증
				validationResult = validateNestedMetadataStructure(folderTree);
				console.log('검증 결과:', validationResult);
				console.log('isValid:', validationResult.isValid);
				console.log('errors:', validationResult.errors);
				console.log('warnings:', validationResult.warnings);
				console.log('validSubfolders:', validationResult.validSubfolders);

				// GeoJSON 파일 파싱
				console.log(
					'선택된 파일들:',
					files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
				);
				const geoJsonFiles = files.filter((f) => f.name.toLowerCase().endsWith('.geojson'));
				console.log(
					'GeoJSON 파일들:',
					geoJsonFiles.map((f) => f.name)
				);

				if (geoJsonFiles.length > 0) {
					parseGeoJSONFiles(files)
						.then((previewData) => {
							geoJsonPreviewData = previewData;
							console.log('GeoJSON 미리보기 데이터:', previewData);

							// 유효한 GeoJSON 데이터가 있으면 경계 좌표를 폼에 자동 입력
							if (previewData.length > 0) {
								const firstValidGeoJson = previewData.find((data) => {
									const bounds = data.bounds;
									return (
										bounds.north > bounds.south &&
										bounds.east > bounds.west &&
										bounds.north >= -90 &&
										bounds.north <= 90 &&
										bounds.south >= -90 &&
										bounds.south <= 90 &&
										bounds.east >= -180 &&
										bounds.east <= 180 &&
										bounds.west >= -180 &&
										bounds.west <= 180
									);
								});

								if (firstValidGeoJson) {
									formData.bounds = {
										north: firstValidGeoJson.bounds.north,
										south: firstValidGeoJson.bounds.south,
										east: firstValidGeoJson.bounds.east,
										west: firstValidGeoJson.bounds.west
									};
									console.log('GeoJSON에서 경계 좌표 자동 설정:', formData.bounds);
								}
							}
						})
						.catch((error) => {
							console.error('GeoJSON 파싱 오류:', error);
							geoJsonPreviewData = [];
						});
				} else {
					console.log('GeoJSON 파일이 없습니다.');
					geoJsonPreviewData = [];
				}

				// 선택된 폴더의 상위 폴더 경로 추출
				const firstFile = files[0];
				const folderPath = firstFile.webkitRelativePath.split('/')[0];

				// 총 폴더 크기 검증 (10MB)
				const totalSize = files.reduce((sum, file) => sum + file.size, 0);
				if (totalSize > 10 * 1024 * 1024) {
					alert('폴더 총 크기는 10MB 이하여야 합니다.');
					return;
				}

				// 실제 파일들을 저장 (나중에 업로드)
				selectedMetadataFiles = files;

				// 폴더 경로를 입력 필드에 설정
				formData.metadataUrl = folderPath;
				showFolderDetails = true;

				console.log('메타데이터 파일들 선택됨:', files.length, '개', totalSize, 'bytes');
				console.log('검증 결과:', validationResult?.isValid ? '성공' : '실패');
			}
		};

		input.click();
	}

	function toggleFolderDetails() {
		showFolderDetails = !showFolderDetails;
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
				<div>
					<label
						for="mapName"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 이름 *</label
					><input
						id="mapName"
						type="text"
						bind:value={formData.name}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div>
					<label
						for="version"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 버전 *</label
					><input
						id="version"
						type="text"
						bind:value={formData.version}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
			</div>
			<div>
				<label
					for="connectedGolfCourseId"
					class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
					>연결 골프장 *</label
				>
				<select
					id="connectedGolfCourseId"
					bind:value={formData.golfCourseId}
					disabled={isReadOnly}
					class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					<option value="">선택하세요</option>
					<option value="1">서울 컨트리클럽</option>
					<option value="2">부산 오션뷰 골프장</option>
				</select>
			</div>
		</div>

		<!-- 맵 데이터 정보 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold dark:text-white">맵 데이터 정보</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div>
					<label
						for="resolution"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">해상도</label
					><input
						id="resolution"
						type="text"
						bind:value={formData.resolution}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div>
					<label
						for="description"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">설명</label
					><input
						id="description"
						type="text"
						bind:value={formData.description}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div>
					<label for="lat" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>북쪽 경계 (위도)</label
					><input
						id="lat"
						type="number"
						step="0.000001"
						bind:value={formData.bounds.north}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						placeholder="예: 37.566500"
					/>
				</div>
				<div>
					<label for="lon" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>남쪽 경계 (위도)</label
					><input
						id="lon"
						type="number"
						step="0.000001"
						bind:value={formData.bounds.south}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						placeholder="예: 37.565500"
					/>
				</div>
				<div>
					<label for="east" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>동쪽 경계 (경도)</label
					><input
						id="east"
						type="number"
						step="0.000001"
						bind:value={formData.bounds.east}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						placeholder="예: 126.979000"
					/>
				</div>
				<div>
					<label for="west" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>서쪽 경계 (경도)</label
					><input
						id="west"
						type="number"
						step="0.000001"
						bind:value={formData.bounds.west}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						placeholder="예: 126.977000"
					/>
				</div>
			</div>
		</div>

		<!-- 맵 파일 정보 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold dark:text-white">맵 파일 정보</h3>

			<!-- 이미지 파일 -->
			<div>
				<label
					for="imageFile"
					class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
					>맵 이미지 파일 (PNG, JPG) *</label
				>
				<div class="flex gap-2">
					<input
						id="imageFile"
						type="text"
						placeholder="파일을 선택해주세요..."
						bind:value={formData.imageUrl}
						disabled={isReadOnly}
						class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						readonly
					/>
					<button
						type="button"
						on:click={handleImageFileSelect}
						disabled={isReadOnly}
						class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 whitespace-nowrap text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
					>
						<Upload class="h-4 w-4" />
						파일 선택
					</button>
				</div>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					지원 형식: PNG, JPG, JPEG (최대 10MB)
				</p>
			</div>

			<!-- 메타데이터 폴더 -->
			<div>
				<label
					for="metadataFile"
					class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
					>메타데이터 폴더 *</label
				>
				<div class="flex gap-2">
					<input
						id="metadataFile"
						type="text"
						placeholder="폴더를 선택해주세요..."
						bind:value={formData.metadataUrl}
						disabled={isReadOnly}
						class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						readonly
					/>
					<button
						type="button"
						on:click={handleMetadataFolderSelect}
						disabled={isReadOnly}
						class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 whitespace-nowrap text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
					>
						<FileIcon class="h-4 w-4" />
						폴더 선택
					</button>
				</div>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">폴더 내 JSON 파일들 (최대 10MB)</p>
			</div>

			<!-- 메타데이터 폴더 상세 정보 -->
			{#if formData.metadataUrl && validationResult}
				<div class="space-y-4">
					<!-- 검증 상태 -->
					<div
						class="rounded-lg p-3 {validationResult.isValid
							? 'bg-green-50 dark:bg-green-900/20'
							: 'bg-red-50 dark:bg-red-900/20'}"
					>
						<div class="flex items-center gap-2">
							{#if validationResult.isValid}
								<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
								<h4 class="text-sm font-medium text-white dark:text-green-200">검증 성공</h4>
							{:else}
								<AlertCircle class="h-5 w-5 text-red-600 dark:text-red-400" />
								<h4 class="text-sm font-medium text-red-800 dark:text-red-200">검증 실패</h4>
							{/if}
							<button
								on:click={toggleFolderDetails}
								class="ml-auto text-sm underline {validationResult.isValid
									? 'text-white dark:text-green-300'
									: 'text-red-700 dark:text-red-300'}"
							>
								{showFolderDetails ? '숨기기' : '상세보기'}
							</button>
						</div>

						<!-- 오류 메시지 -->
						{#if validationResult.errors.length > 0}
							<div class="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
								{#each validationResult.errors as error}
									<div>• {error}</div>
								{/each}
							</div>
						{/if}

						<!-- 경고 메시지 -->
						{#if validationResult.warnings.length > 0}
							<div class="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
								{#each validationResult.warnings as warning}
									<div>⚠ {warning}</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- 상세 폴더 구조 -->
					{#if showFolderDetails}
						<div class="rounded-lg border p-4 dark:border-gray-700">
							<!-- 폴더 트리 표시 -->
							<div
								class="max-h-64 overflow-y-auto rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700/50"
							>
								<FolderTree tree={folderTree} selectedFiles={[]} depth={0} />
							</div>

							<!-- GeoJSON 미리보기 -->
							{#if geoJsonPreviewData.length > 0}
								<div class="mt-4 border-t pt-4 dark:border-gray-600">
									<GeoJSONPreview previewData={geoJsonPreviewData} />
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{:else if formData.imageUrl || formData.metadataUrl}
				<div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
					<h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">선택된 파일</h4>
					<div class="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
						{#if formData.imageUrl}
							<div class="flex items-center gap-2">
								<Upload class="h-4 w-4" />
								이미지: {formData.imageUrl.split('/').pop() || formData.imageUrl}
							</div>
						{/if}
						{#if formData.metadataUrl}
							<div class="flex items-center gap-2">
								<FileIcon class="h-4 w-4" />
								메타데이터 폴더: {formData.metadataUrl}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
		<!-- 맵 타입 및 관리 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold dark:text-white">맵 타입 및 관리</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						for="mapType"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 타입</label
					>
					<select
						id="mapType"
						bind:value={formData.type}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="2D">2D 맵</option>
						<option value="3D">3D 맵</option>
						<option value="SATELLITE">위성 맵</option>
					</select>
				</div>
				<div>
					<label
						for="fileSize"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>파일 크기 (bytes)</label
					>
					<input
						id="fileSize"
						type="number"
						bind:value={formData.fileSize}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
			</div>
		</div>
	</div>

	<div slot="footer">
		{#if !isReadOnly}
			<button
				on:click={() => dispatch('close')}
				class="rounded-lg border bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				>취소</button
			>
			<button
				on:click={handleSave}
				disabled={isUploading}
				class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
			>
				{isUploading ? '업로드 중...' : modalMode === 'create' ? '등록' : '수정'}
			</button>
		{:else}
			<button
				on:click={() => dispatch('close')}
				class="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">닫기</button
			>
		{/if}
	</div>
</BaseModal>
