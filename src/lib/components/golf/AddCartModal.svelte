<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import BaseModal from '$lib/components/common/BaseModal.svelte';
	import type { AddCartInput } from '$lib/types/golf-course-cart';
	import type { CartModel } from '$lib/types/cart-model';

	export let golfCourseId: string;
	export let availableModels: CartModel[] = [];

	const dispatch = createEventDispatcher();

	// 폼 데이터
	let formData: AddCartInput = {
		cartNumber: '',
		serialNumber: '',
		modelId: '',
		notes: ''
	};

	// 유효성 검사
	let validationErrors = {
		cartNumber: '',
		serialNumber: '',
		modelId: ''
	};

	let fieldTouched = {
		cartNumber: false,
		serialNumber: false,
		modelId: false
	};

	// 유효성 검사 함수들
	const validateCartNumber = (value: string): string => {
		if (!value.trim()) return '카트 번호를 입력해주세요';
		if (!/^[A-Z0-9-]+$/.test(value)) return '카트 번호는 영문 대문자, 숫자, 하이픈만 사용 가능합니다';
		return '';
	};

	const validateSerialNumber = (value: string): string => {
		if (!value.trim()) return '일련번호를 입력해주세요';
		if (!/^[A-Z0-9-]+$/.test(value)) return '일련번호는 영문 대문자, 숫자, 하이픈만 사용 가능합니다';
		return '';
	};

	const validateModelId = (value: string): string => {
		if (!value) return '카트 모델을 선택해주세요';
		return '';
	};

	// 실시간 유효성 검사
	$: if (fieldTouched.cartNumber) validationErrors.cartNumber = validateCartNumber(formData.cartNumber);
	$: if (fieldTouched.serialNumber) validationErrors.serialNumber = validateSerialNumber(formData.serialNumber);
	$: if (fieldTouched.modelId) validationErrors.modelId = validateModelId(formData.modelId);

	// 폼 유효성 확인
	$: isFormValid = 
		!!formData.cartNumber &&
		!!formData.serialNumber &&
		!!formData.modelId &&
		!validationErrors.cartNumber &&
		!validationErrors.serialNumber &&
		!validationErrors.modelId;

	// 필드 터치 핸들러
	const handleCartNumberBlur = () => {
		fieldTouched.cartNumber = true;
		validationErrors.cartNumber = validateCartNumber(formData.cartNumber);
	};

	const handleSerialNumberBlur = () => {
		fieldTouched.serialNumber = true;
		validationErrors.serialNumber = validateSerialNumber(formData.serialNumber);
	};

	const handleModelChange = () => {
		fieldTouched.modelId = true;
		validationErrors.modelId = validateModelId(formData.modelId);
	};

	// 저장 처리
	const handleSave = () => {
		// 모든 필드 터치 처리
		Object.keys(fieldTouched).forEach(key => {
			fieldTouched[key] = true;
		});

		// 유효성 검사 실행
		validationErrors.cartNumber = validateCartNumber(formData.cartNumber);
		validationErrors.serialNumber = validateSerialNumber(formData.serialNumber);
		validationErrors.modelId = validateModelId(formData.modelId);

		if (!isFormValid) return;

		dispatch('save', {
			golfCourseId,
			...formData
		});
	};

	// 모달 닫기
	const handleClose = () => {
		dispatch('close');
	};

	// 선택된 모델 정보
	$: selectedModel = availableModels.find(model => model.id === formData.modelId);
</script>

<BaseModal title="카트 추가" size="lg" on:close={handleClose}>
	<div class="space-y-6">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- 카트 번호 -->
			<div>
				<label for="cartNumber" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
					카트 번호 *
				</label>
				<input
					id="cartNumber"
					type="text"
					bind:value={formData.cartNumber}
					on:blur={handleCartNumberBlur}
					placeholder="예: CART-001"
					class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					class:border-red-500={validationErrors.cartNumber}
					class:focus:ring-red-500={validationErrors.cartNumber}
					class:focus:border-red-500={validationErrors.cartNumber}
					aria-describedby={validationErrors.cartNumber ? 'cartNumber-error' : undefined}
				/>
				{#if validationErrors.cartNumber}
					<p id="cartNumber-error" class="mt-1 text-sm text-red-400" role="alert">
						{validationErrors.cartNumber}
					</p>
				{/if}
			</div>

			<!-- 일련번호 -->
			<div>
				<label for="serialNumber" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
					일련번호 *
				</label>
				<input
					id="serialNumber"
					type="text"
					bind:value={formData.serialNumber}
					on:blur={handleSerialNumberBlur}
					placeholder="예: DY-2024-001"
					class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					class:border-red-500={validationErrors.serialNumber}
					class:focus:ring-red-500={validationErrors.serialNumber}
					class:focus:border-red-500={validationErrors.serialNumber}
					aria-describedby={validationErrors.serialNumber ? 'serialNumber-error' : undefined}
				/>
				{#if validationErrors.serialNumber}
					<p id="serialNumber-error" class="mt-1 text-sm text-red-400" role="alert">
						{validationErrors.serialNumber}
					</p>
				{/if}
			</div>
		</div>

		<!-- 카트 모델 선택 -->
		<div>
			<label for="modelId" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
				카트 모델 *
			</label>
			<select
				id="modelId"
				bind:value={formData.modelId}
				on:change={handleModelChange}
				class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				class:border-red-500={validationErrors.modelId}
				class:focus:ring-red-500={validationErrors.modelId}
				class:focus:border-red-500={validationErrors.modelId}
				aria-describedby={validationErrors.modelId ? 'modelId-error' : undefined}
			>
				<option value="">모델을 선택하세요</option>
				{#each availableModels as model}
					<option value={model.id}>{model.modelName} - {model.modelCode}</option>
				{/each}
			</select>
			{#if validationErrors.modelId}
				<p id="modelId-error" class="mt-1 text-sm text-red-400" role="alert">
					{validationErrors.modelId}
				</p>
			{/if}
		</div>

		<!-- 선택된 모델 정보 -->
		{#if selectedModel}
			<div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
				<h4 class="mb-2 font-medium text-gray-900 dark:text-white">선택된 모델 정보</h4>
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span class="text-gray-500 dark:text-gray-400">모델명:</span>
						<span class="ml-2 text-gray-900 dark:text-white">{selectedModel.modelName}</span>
					</div>
					<div>
						<span class="text-gray-500 dark:text-gray-400">모델코드:</span>
						<span class="ml-2 text-gray-900 dark:text-white">{selectedModel.modelCode}</span>
					</div>
					<div>
						<span class="text-gray-500 dark:text-gray-400">최대속도:</span>
						<span class="ml-2 text-gray-900 dark:text-white">{selectedModel.specs.maxSpeed} km/h</span>
					</div>
					<div>
						<span class="text-gray-500 dark:text-gray-400">배터리:</span>
						<span class="ml-2 text-gray-900 dark:text-white">{selectedModel.specs.batteryType}</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- 비고 -->
		<div>
			<label for="notes" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
				비고
			</label>
			<textarea
				id="notes"
				bind:value={formData.notes}
				rows={3}
				placeholder="추가 정보나 특이사항을 입력하세요"
				class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			></textarea>
		</div>
	</div>

	<div slot="footer">
		<button
			on:click={handleClose}
			class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
		>
			취소
		</button>
		<button
			on:click={handleSave}
			disabled={!isFormValid}
			class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
		>
			카트 추가
		</button>
	</div>
</BaseModal>