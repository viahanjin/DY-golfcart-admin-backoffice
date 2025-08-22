<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { Upload, FileIcon } from 'lucide-svelte';
	import { mapService } from '$lib/services/mapService';
	import { golfCourseStore } from '$lib/stores/golf-course.store';
	import BaseModal from '$lib/components/common/BaseModal.svelte';
	import type { GolfCourse } from '$lib/types/golf-course';

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
			mapStatus: {
				status: 'testing',
				validationStatus: 'pending',
				appliedCarts: [],
				lastUpdate: ''
			}
		};
	}

	let formData = getInitialFormData();
	$: isReadOnly = modalMode === 'view';

	// 골프장 목록
	let golfCourseStoreState: any;
	const unsubscribeGolfCourseStore = golfCourseStore.subscribe((value) => {
		golfCourseStoreState = value;
	});

	// 컴포넌트 마운트 시 골프장 목록 로드
	onMount(() => {
		golfCourseStore.loadGolfCourses();
	});

	// 컴포넌트 해제 시 구독 해제
	onDestroy(() => {
		unsubscribeGolfCourseStore();
	});

	// 유효성 검사 에러 상태
	let validationErrors = {
		mapName: '',
		version: '',
		connectedGolfCourseId: '',
		imageFile: '',
		metadataFile: ''
	};

	// 필드 터치 상태
	let fieldTouched = {
		mapName: false,
		version: false,
		connectedGolfCourseId: false,
		imageFile: false,
		metadataFile: false
	};

	// 유효성 검사 함수들
	const validateMapName = (name: string): string => {
		if (!name?.trim()) return '맵 이름을 입력해주세요';
		if (name.trim().length < 2) return '맵 이름은 2자 이상이어야 합니다';
		if (name.trim().length > 50) return '맵 이름은 50자 이하여야 합니다';
		return '';
	};

	const validateVersion = (version: string): string => {
		if (!version?.trim()) return '맵 버전을 입력해주세요';
		if (!/^\d+\.\d+(\.\d+)?$/.test(version.trim()))
			return '버전은 X.Y 또는 X.Y.Z 형식이어야 합니다';
		return '';
	};

	const validateGolfCourse = (courseId: string): string => {
		if (!courseId?.trim()) return '연결 골프장을 선택해주세요';
		return '';
	};

	const validateImageFile = (): string => {
		if (!formData.mapFiles.imageFile?.trim()) return '맵 이미지 파일을 선택해주세요';
		return '';
	};

	const validateMetadataFile = (): string => {
		if (!formData.mapFiles.metadataFile?.trim()) return '메타데이터 폴더를 선택해주세요';
		return '';
	};

	// 실시간 유효성 검사
	$: if (fieldTouched.mapName) validationErrors.mapName = validateMapName(formData.mapName);
	$: if (fieldTouched.version) validationErrors.version = validateVersion(formData.version);
	$: if (fieldTouched.connectedGolfCourseId)
		validationErrors.connectedGolfCourseId = validateGolfCourse(formData.connectedGolfCourseId);
	$: if (fieldTouched.imageFile) validationErrors.imageFile = validateImageFile();
	$: if (fieldTouched.metadataFile) validationErrors.metadataFile = validateMetadataFile();

	// 폼 전체 유효성 검사
	$: isFormValid =
		!validationErrors.mapName &&
		!validationErrors.version &&
		!validationErrors.connectedGolfCourseId &&
		!validationErrors.imageFile &&
		!validationErrors.metadataFile &&
		formData.mapName?.trim() &&
		formData.version?.trim() &&
		formData.connectedGolfCourseId?.trim() &&
		formData.mapFiles.imageFile?.trim() &&
		formData.mapFiles.metadataFile?.trim();

	// 필드 블러 핸들러들
	const handleMapNameBlur = () => {
		fieldTouched.mapName = true;
		validationErrors.mapName = validateMapName(formData.mapName);
	};

	const handleVersionBlur = () => {
		fieldTouched.version = true;
		validationErrors.version = validateVersion(formData.version);
	};

	const handleGolfCourseBlur = () => {
		fieldTouched.connectedGolfCourseId = true;
		validationErrors.connectedGolfCourseId = validateGolfCourse(formData.connectedGolfCourseId);
	};

	// selectedMap이 변경될 때마다 formData 업데이트
	$: if (selectedMap && (modalMode === 'edit' || modalMode === 'view')) {
		formData = JSON.parse(JSON.stringify(selectedMap));
		// 필드 터치 상태 초기화
		fieldTouched = {
			mapName: false,
			version: false,
			connectedGolfCourseId: false,
			imageFile: false,
			metadataFile: false
		};
		// 에러 상태 초기화
		validationErrors = {
			mapName: '',
			version: '',
			connectedGolfCourseId: '',
			imageFile: '',
			metadataFile: ''
		};
	} else if (modalMode === 'create') {
		formData = getInitialFormData();
		formData.mapId = `MAP-${Date.now().toString().slice(-6)}`;
	}

	function handleSave() {
		// 모든 필드 터치 상태로 만들어 에러 표시
		fieldTouched.mapName = true;
		fieldTouched.version = true;
		fieldTouched.connectedGolfCourseId = true;
		fieldTouched.imageFile = true;
		fieldTouched.metadataFile = true;

		// 유효성 검사 실행
		validationErrors.mapName = validateMapName(formData.mapName);
		validationErrors.version = validateVersion(formData.version);
		validationErrors.connectedGolfCourseId = validateGolfCourse(formData.connectedGolfCourseId);
		validationErrors.imageFile = validateImageFile();
		validationErrors.metadataFile = validateMetadataFile();

		if (isFormValid) {
			dispatch('save', { mode: modalMode, data: formData });
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

				// 파일 선택 시 필드를 터치 상태로 만들고 에러 클리어
				fieldTouched.imageFile = true;
				validationErrors.imageFile = validateImageFile();

				// 실제 파일 업로드 API 호출
				mapService
					.uploadImageFile(file, formData.mapId)
					.then((result) => {
						console.log('이미지 파일 업로드 성공:', result);
						if (result.url) {
							formData.mapFiles.imageFile = result.url;
						}
					})
					.catch((error) => {
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
			const files = Array.from(target.files || []);
			if (files.length > 0) {
				// 선택된 폴더의 상위 폴더 경로 추출
				const firstFile = files[0];
				const folderPath = firstFile.webkitRelativePath.split('/')[0];

				// JSON 파일들 필터링
				const jsonFiles = files.filter(
					(file) => file.type === 'application/json' || file.name.endsWith('.json')
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

				// 폴더 선택 시 필드를 터치 상태로 만들고 에러 클리어
				fieldTouched.metadataFile = true;
				validationErrors.metadataFile = validateMetadataFile();

				// 실제 폴더 업로드 API 호출
				mapService
					.uploadMetadataFolder(files as File[], formData.mapId)
					.then((result) => {
						console.log('메타데이터 폴더 업로드 성공:', result);
						if (result.folderPath) {
							formData.mapFiles.metadataFile = result.folderPath;
						}
					})
					.catch((error) => {
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
				<div>
					<label
						for="mapName"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 이름 *</label
					>
					<input
						id="mapName"
						type="text"
						bind:value={formData.mapName}
						on:blur={handleMapNameBlur}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						class:border-red-500={validationErrors.mapName}
						class:focus:ring-red-500={validationErrors.mapName}
						class:focus:border-red-500={validationErrors.mapName}
						aria-describedby={validationErrors.mapName ? 'mapName-error' : undefined}
					/>
					{#if validationErrors.mapName}
						<p id="mapName-error" class="mt-1 text-sm text-red-400" role="alert">
							{validationErrors.mapName}
						</p>
					{/if}
				</div>
				<div>
					<label
						for="version"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 버전 *</label
					>
					<input
						id="version"
						type="text"
						placeholder="1.0 또는 1.0.0"
						bind:value={formData.version}
						on:blur={handleVersionBlur}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						class:border-red-500={validationErrors.version}
						class:focus:ring-red-500={validationErrors.version}
						class:focus:border-red-500={validationErrors.version}
						aria-describedby={validationErrors.version ? 'version-error' : undefined}
					/>
					{#if validationErrors.version}
						<p id="version-error" class="mt-1 text-sm text-red-400" role="alert">
							{validationErrors.version}
						</p>
					{/if}
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
					bind:value={formData.connectedGolfCourseId}
					on:blur={handleGolfCourseBlur}
					disabled={isReadOnly}
					class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					class:border-red-500={validationErrors.connectedGolfCourseId}
					class:focus:ring-red-500={validationErrors.connectedGolfCourseId}
					class:focus:border-red-500={validationErrors.connectedGolfCourseId}
					aria-describedby={validationErrors.connectedGolfCourseId ? 'golfCourse-error' : undefined}
				>
					<option value="">골프장을 선택하세요</option>
					{#if golfCourseStoreState?.items}
						{#each golfCourseStoreState.items as golfCourse}
							<option value={golfCourse.id}>{golfCourse.courseName}</option>
						{/each}
					{/if}
				</select>
				{#if validationErrors.connectedGolfCourseId}
					<p id="golfCourse-error" class="mt-1 text-sm text-red-400" role="alert">
						{validationErrors.connectedGolfCourseId}
					</p>
				{/if}
			</div>
		</div>

		<!-- 맵 데이터 정보 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold dark:text-white">맵 데이터 정보</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						for="resolution"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>해상도 (cm/pixel)</label
					><input
						id="resolution"
						type="text"
						bind:value={formData.mapData.resolution}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div>
					<label for="size" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>맵 크기 (m x m)</label
					><input
						id="size"
						type="text"
						bind:value={formData.mapData.size}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div>
					<label for="lat" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>맵 원점 위도</label
					><input
						id="lat"
						type="number"
						bind:value={formData.mapData.originGps.latitude}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div>
					<label for="lon" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>맵 원점 경도</label
					><input
						id="lon"
						type="number"
						bind:value={formData.mapData.originGps.longitude}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
						bind:value={formData.mapFiles.imageFile}
						disabled={isReadOnly}
						class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						class:border-red-500={validationErrors.imageFile}
						class:focus:ring-red-500={validationErrors.imageFile}
						class:focus:border-red-500={validationErrors.imageFile}
						aria-describedby={validationErrors.imageFile ? 'imageFile-error' : undefined}
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
				{#if validationErrors.imageFile}
					<p id="imageFile-error" class="mt-1 text-sm text-red-400" role="alert">
						{validationErrors.imageFile}
					</p>
				{:else}
					<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
						지원 형식: PNG, JPG, JPEG (최대 10MB)
					</p>
				{/if}
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
						bind:value={formData.mapFiles.metadataFile}
						disabled={isReadOnly}
						class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						class:border-red-500={validationErrors.metadataFile}
						class:focus:ring-red-500={validationErrors.metadataFile}
						class:focus:border-red-500={validationErrors.metadataFile}
						aria-describedby={validationErrors.metadataFile ? 'metadataFile-error' : undefined}
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
				{#if validationErrors.metadataFile}
					<p id="metadataFile-error" class="mt-1 text-sm text-red-400" role="alert">
						{validationErrors.metadataFile}
					</p>
				{:else}
					<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
						폴더 내 JSON 파일들 (최대 10MB)
					</p>
				{/if}
			</div>

			<!-- 파일 업로드 상태 (추후 구현) -->
			{#if formData.mapFiles.imageFile || formData.mapFiles.metadataFile}
				<div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
					<h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">선택된 파일</h4>
					<div class="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
						{#if formData.mapFiles.imageFile}
							<div class="flex items-center gap-2">
								<Upload class="h-4 w-4" />
								이미지: {formData.mapFiles.imageFile.split('/').pop() ||
									formData.mapFiles.imageFile}
							</div>
						{/if}
						{#if formData.mapFiles.metadataFile}
							<div class="flex items-center gap-2">
								<FileIcon class="h-4 w-4" />
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
				<div>
					<label
						for="status"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">맵 상태</label
					>
					<select
						id="status"
						bind:value={formData.mapStatus.status}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="active">활성</option>
						<option value="testing">테스트 중</option>
						<option value="inactive">비활성</option>
					</select>
				</div>
				<div>
					<label
						for="validationStatus"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">검증 상태</label
					>
					<select
						id="validationStatus"
						bind:value={formData.mapStatus.validationStatus}
						disabled={isReadOnly}
						class="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
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
			<button
				on:click={() => dispatch('close')}
				class="rounded-lg border bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				>취소</button
			>
			<button
				on:click={handleSave}
				disabled={!isFormValid}
				class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
			>
				{modalMode === 'create' ? '등록' : '수정'}
			</button>
		{:else}
			<button
				on:click={() => dispatch('close')}
				class="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">닫기</button
			>
		{/if}
	</div>
</BaseModal>
