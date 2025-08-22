<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { cartModelStore } from '$lib/stores/cart-model.store';
	import BaseModal from '$lib/components/common/BaseModal.svelte';
	import type { Cart, CreateCartRequest } from '$lib/types/cart';
	import type { CartModel } from '$lib/types/cart-model';

	export let modalMode: 'create' | 'edit' | 'view';
	export let selectedCart: Cart | null = null;

	const dispatch = createEventDispatcher();

	// 폼 데이터 초기화 함수
	function getInitialFormData(): CreateCartRequest {
		return {
			serialNumber: '',
			modelId: '',
			modelName: '',
			modelCode: '',
			status: 'in_warehouse'
		};
	}

	let formData = getInitialFormData();

	// Store state
	let cartModelState: any;
	const unsubscribeCartModel = cartModelStore.subscribe(value => {
		cartModelState = value;
	});

	// 유효성 검사 에러 상태
	let validationErrors = {
		serialNumber: '',
		modelId: ''
	};

	// 필드 터치 상태
	let fieldTouched = {
		serialNumber: false,
		modelId: false
	};

	// onMount를 사용해 수정/상세보기 모드일 때 데이터 로드
	onMount(() => {
		console.log('🎬 CartInventoryModal mounted:', modalMode, selectedCart);
		if (selectedCart && (modalMode === 'edit' || modalMode === 'view')) {
			// 깊은 복사를 통해 원본 데이터 오염 방지
			formData = {
				serialNumber: selectedCart.serialNumber,
				modelId: selectedCart.modelId,
				modelName: selectedCart.modelName,
				modelCode: selectedCart.modelCode,
				status: selectedCart.status
			};
		}
	});

	// 읽기 전용 모드 체크
	$: isReadOnly = modalMode === 'view';

	// 유효성 검사 함수들
	const validateSerialNumber = (serialNumber: string): string => {
		if (!serialNumber?.trim()) return '일련번호를 입력해주세요';
		if (serialNumber.trim().length < 5) return '일련번호는 5자 이상이어야 합니다';
		if (serialNumber.trim().length > 20) return '일련번호는 20자 이하여야 합니다';
		if (!/^[A-Z0-9]+$/.test(serialNumber.trim())) return '일련번호는 영문 대문자와 숫자만 가능합니다';
		return '';
	};

	const validateModelId = (modelId: string): string => {
		if (!modelId?.trim()) return '카트 모델을 선택해주세요';
		return '';
	};

	// 실시간 유효성 검사
	$: if (fieldTouched.serialNumber) validationErrors.serialNumber = validateSerialNumber(formData.serialNumber);
	$: if (fieldTouched.modelId) validationErrors.modelId = validateModelId(formData.modelId);

	// 폼 전체 유효성 검사
	$: isFormValid = 
		!validationErrors.serialNumber &&
		!validationErrors.modelId &&
		formData.serialNumber?.trim() &&
		formData.modelId?.trim();

	// 필드 블러 핸들러들
	const handleSerialNumberBlur = () => {
		fieldTouched.serialNumber = true;
		validationErrors.serialNumber = validateSerialNumber(formData.serialNumber);
	};

	const handleModelIdBlur = () => {
		fieldTouched.modelId = true;
		validationErrors.modelId = validateModelId(formData.modelId);
	};

	// 모델 선택 핸들러
	function handleModelChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const selectedModelId = target.value;
		
		if (selectedModelId && cartModelState?.items) {
			const selectedModel = cartModelState.items.find((m: CartModel) => m.id === selectedModelId);
			if (selectedModel) {
				formData.modelId = selectedModel.id;
				formData.modelName = selectedModel.modelName;
				formData.modelCode = selectedModel.modelCode;
				
				// 일련번호 자동 생성 (모델 코드 + 순번)
				if (!formData.serialNumber && modalMode === 'create') {
					const timestamp = Date.now().toString().slice(-6);
					formData.serialNumber = `${selectedModel.modelCode}${timestamp}`;
				}
			}
		}
		
		handleModelIdBlur();
	}

	function handleSave() {
		console.log('💾 Saving cart:', formData);
		
		// 모든 필드 터치 상태로 만들어 에러 표시
		fieldTouched.serialNumber = true;
		fieldTouched.modelId = true;

		// 유효성 검사 실행
		validationErrors.serialNumber = validateSerialNumber(formData.serialNumber);
		validationErrors.modelId = validateModelId(formData.modelId);

		if (isFormValid) {
			// 부모 컴포넌트로 데이터 전달
			dispatch('save', {
				mode: modalMode,
				data: formData
			});
		}
	}
</script>

<BaseModal size="xl" on:close={() => dispatch('close')}>
	<span slot="title">
		{modalMode === 'create'
			? '새 카트 등록'
			: modalMode === 'edit'
				? '카트 정보 수정'
				: '카트 상세 정보'}
	</span>

	<div class="space-y-6">
		<!-- 기본 정보 섹션 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold text-gray-900 dark:text-white">기본 정보</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						for="serialNumber"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>일련번호 *</label
					>
					<input
						id="serialNumber"
						type="text"
						bind:value={formData.serialNumber}
						on:blur={handleSerialNumberBlur}
						disabled={isReadOnly}
						class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						class:border-red-500={validationErrors.serialNumber}
						class:focus:ring-red-500={validationErrors.serialNumber}
						class:focus:border-red-500={validationErrors.serialNumber}
						placeholder="예: DYC2024001"
						aria-describedby={validationErrors.serialNumber ? 'serialNumber-error' : undefined}
					/>
					{#if validationErrors.serialNumber}
						<p id="serialNumber-error" class="mt-1 text-sm text-red-400" role="alert">
							{validationErrors.serialNumber}
						</p>
					{/if}
				</div>
				
				<div>
					<label
						for="modelId"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>카트 모델 *</label
					>
					<select
						id="modelId"
						bind:value={formData.modelId}
						on:change={handleModelChange}
						disabled={isReadOnly}
						class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						class:border-red-500={validationErrors.modelId}
						class:focus:ring-red-500={validationErrors.modelId}
						class:focus:border-red-500={validationErrors.modelId}
						aria-describedby={validationErrors.modelId ? 'modelId-error' : undefined}
					>
						<option value="">모델을 선택하세요</option>
						{#if cartModelState?.items}
							{#each cartModelState.items as model}
								<option value={model.id}>{model.modelName} ({model.modelCode})</option>
							{/each}
						{/if}
					</select>
					{#if validationErrors.modelId}
						<p id="modelId-error" class="mt-1 text-sm text-red-400" role="alert">
							{validationErrors.modelId}
						</p>
					{/if}
				</div>
			</div>

			{#if formData.modelId && formData.modelName}
				<div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
					<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">선택된 모델 정보</h4>
					<div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
						<p><span class="font-medium">모델명:</span> {formData.modelName}</p>
						<p><span class="font-medium">모델 코드:</span> {formData.modelCode}</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- 상태 정보 섹션 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold text-gray-900 dark:text-white">상태 정보</h3>
			
			<div>
				<label for="status" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
					현재 상태
				</label>
				<select
					id="status"
					bind:value={formData.status}
					disabled={isReadOnly}
					class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					<option value="in_warehouse">창고 보관</option>
					<option value="deployed">현장 배치</option>
					<option value="maintenance">정비 중</option>
				</select>
			</div>

			{#if selectedCart && modalMode !== 'create'}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<div class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
							배터리 수준
						</div>
						<div class="flex items-center gap-2">
							<div class="flex-1 rounded bg-gray-200 dark:bg-gray-700">
								<div 
									class="h-2 rounded bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
									style="width: {selectedCart.batteryLevel}%"
								></div>
							</div>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
								{selectedCart.batteryLevel}%
							</span>
						</div>
					</div>

					<div>
						<div class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
							점검 상태
						</div>
						<div class="text-sm">
							{#if selectedCart.maintenanceStatus === 'good'}
								<span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-400">
									양호
								</span>
							{:else if selectedCart.maintenanceStatus === 'warning'}
								<span class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400">
									주의
								</span>
							{:else if selectedCart.maintenanceStatus === 'critical'}
								<span class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/50 dark:text-red-400">
									위험
								</span>
							{/if}
						</div>
					</div>
				</div>

				{#if selectedCart.golfCourseName}
					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
							배치 현장
						</label>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							{selectedCart.golfCourseName}
						</p>
						{#if selectedCart.deploymentDate}
							<p class="text-xs text-gray-500 dark:text-gray-500">
								배치일: {new Date(selectedCart.deploymentDate).toLocaleDateString('ko-KR')}
							</p>
						{/if}
					</div>
				{/if}

				{#if selectedCart.location}
					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
							마지막 위치
						</label>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							위도: {selectedCart.location.lat.toFixed(6)}, 경도: {selectedCart.location.lng.toFixed(6)}
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-500">
							최종 확인: {new Date(selectedCart.lastSeenAt).toLocaleString('ko-KR')}
						</p>
					</div>
				{/if}
			{/if}
		</div>
	</div>

	<div slot="footer">
		{#if !isReadOnly}
			<button
				on:click={() => dispatch('close')}
				class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			>
				취소
			</button>
			<button
				on:click={handleSave}
				disabled={!isFormValid}
				class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
			>
				{modalMode === 'create' ? '등록' : '수정'}
			</button>
		{:else}
			<button
				on:click={() => dispatch('close')}
				class="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
			>
				닫기
			</button>
		{/if}
	</div>
</BaseModal>