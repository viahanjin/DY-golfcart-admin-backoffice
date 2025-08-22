<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import BaseModal from '$lib/components/common/BaseModal.svelte';
	import type { CartModel, CreateCartModelRequest } from '$lib/types/cart-model';

	export let modalMode: 'create' | 'edit' | 'view';
	export let selectedModel: CartModel | null = null;

	const dispatch = createEventDispatcher();

	// 폼 데이터 초기화 함수
	function getInitialFormData(): CreateCartModelRequest {
		return {
			modelName: '',
			modelCode: '',
			year: new Date().getFullYear(),
			specs: {
				maxSpeed: 25,
				batteryType: '72V 리튬',
				seats: 4
			},
			features: [],
			status: 'active'
		};
	}

	let formData = getInitialFormData();

	// 유효성 검사 에러 상태
	let validationErrors = {
		modelName: '',
		modelCode: '',
		year: '',
		maxSpeed: '',
		batteryType: ''
	};

	// 필드 터치 상태
	let fieldTouched = {
		modelName: false,
		modelCode: false,
		year: false,
		maxSpeed: false,
		batteryType: false
	};

	// onMount를 사용해 수정/상세보기 모드일 때 데이터 로드
	onMount(() => {
		console.log('🎬 CartModelModal mounted:', modalMode, selectedModel);
		if (selectedModel && (modalMode === 'edit' || modalMode === 'view')) {
			// 깊은 복사를 통해 원본 데이터 오염 방지
			formData = {
				modelName: selectedModel.modelName,
				modelCode: selectedModel.modelCode,
				year: selectedModel.year,
				specs: { ...selectedModel.specs },
				features: [...selectedModel.features],
				status: selectedModel.status
			};
		}
	});

	// 읽기 전용 모드 체크
	$: isReadOnly = modalMode === 'view';

	// 유효성 검사 함수들
	const validateModelName = (name: string): string => {
		if (!name?.trim()) return '모델명을 입력해주세요';
		if (name.trim().length < 2) return '모델명은 2자 이상이어야 합니다';
		if (name.trim().length > 50) return '모델명은 50자 이하여야 합니다';
		return '';
	};

	const validateModelCode = (code: string): string => {
		if (!code?.trim()) return '모델 코드를 입력해주세요';
		if (!/^[A-Z0-9]{3,10}$/.test(code.trim()))
			return '코드는 3-10자의 영문 대문자와 숫자만 가능합니다';
		return '';
	};

	const validateYear = (year: number): string => {
		const currentYear = new Date().getFullYear();
		if (!year) return '연도를 입력해주세요';
		if (year < 2020 || year > currentYear + 5)
			return `연도는 2020년부터 ${currentYear + 5}년까지 가능합니다`;
		return '';
	};

	const validateMaxSpeed = (speed: number): string => {
		if (!speed || speed < 5) return '최대 속도는 5km/h 이상이어야 합니다';
		if (speed > 50) return '최대 속도는 50km/h 이하여야 합니다';
		return '';
	};

	const validateBatteryType = (batteryType: string): string => {
		if (!batteryType?.trim()) return '배터리 타입을 입력해주세요';
		return '';
	};

	// 실시간 유효성 검사
	$: if (fieldTouched.modelName) validationErrors.modelName = validateModelName(formData.modelName);
	$: if (fieldTouched.modelCode) validationErrors.modelCode = validateModelCode(formData.modelCode);
	$: if (fieldTouched.year) validationErrors.year = validateYear(formData.year);
	$: if (fieldTouched.maxSpeed)
		validationErrors.maxSpeed = validateMaxSpeed(formData.specs.maxSpeed);
	$: if (fieldTouched.batteryType)
		validationErrors.batteryType = validateBatteryType(formData.specs.batteryType);

	// 폼 전체 유효성 검사
	$: isFormValid =
		!validationErrors.modelName &&
		!validationErrors.modelCode &&
		!validationErrors.year &&
		!validationErrors.maxSpeed &&
		!validationErrors.batteryType &&
		formData.modelName?.trim() &&
		formData.modelCode?.trim() &&
		formData.year &&
		formData.specs.maxSpeed &&
		formData.specs.batteryType?.trim();

	// 필드 블러 핸들러들
	const handleModelNameBlur = () => {
		fieldTouched.modelName = true;
		validationErrors.modelName = validateModelName(formData.modelName);
	};

	const handleModelCodeBlur = () => {
		fieldTouched.modelCode = true;
		validationErrors.modelCode = validateModelCode(formData.modelCode);
	};

	const handleYearBlur = () => {
		fieldTouched.year = true;
		validationErrors.year = validateYear(formData.year);
	};

	const handleMaxSpeedBlur = () => {
		fieldTouched.maxSpeed = true;
		validationErrors.maxSpeed = validateMaxSpeed(formData.specs.maxSpeed);
	};

	const handleBatteryTypeBlur = () => {
		fieldTouched.batteryType = true;
		validationErrors.batteryType = validateBatteryType(formData.specs.batteryType);
	};

	function handleSave() {
		console.log('💾 Saving cart model:', formData);

		// 모든 필드 터치 상태로 만들어 에러 표시
		fieldTouched.modelName = true;
		fieldTouched.modelCode = true;
		fieldTouched.year = true;
		fieldTouched.maxSpeed = true;
		fieldTouched.batteryType = true;

		// 유효성 검사 실행
		validationErrors.modelName = validateModelName(formData.modelName);
		validationErrors.modelCode = validateModelCode(formData.modelCode);
		validationErrors.year = validateYear(formData.year);
		validationErrors.maxSpeed = validateMaxSpeed(formData.specs.maxSpeed);
		validationErrors.batteryType = validateBatteryType(formData.specs.batteryType);

		if (isFormValid) {
			// 부모 컴포넌트로 데이터 전달
			dispatch('save', {
				mode: modalMode,
				data: formData
			});
		}
	}

	// 기능 추가/제거
	function addFeature() {
		if (newFeature.trim()) {
			formData.features = [...formData.features, newFeature.trim()];
			newFeature = '';
		}
	}

	function removeFeature(index: number) {
		formData.features = formData.features.filter((_, i) => i !== index);
	}

	let newFeature = '';

	// 모델 코드 자동 생성
	function generateModelCode() {
		if (formData.modelName) {
			const nameCode = formData.modelName
				.toUpperCase()
				.replace(/[^A-Z0-9]/g, '')
				.substring(0, 3);
			const yearCode = formData.year.toString().slice(-2);
			formData.modelCode = `${nameCode}${yearCode}`;
		}
	}
</script>

<BaseModal size="2xl" on:close={() => dispatch('close')}>
	<span slot="title">
		{modalMode === 'create'
			? '새 카트 모델 등록'
			: modalMode === 'edit'
				? '카트 모델 수정'
				: '카트 모델 상세 정보'}
	</span>

	<div class="space-y-6">
		<!-- 기본 정보 섹션 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold text-gray-900 dark:text-white">기본 정보</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="col-span-2">
					<label
						for="modelName"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">모델명 *</label
					>
					<input
						id="modelName"
						type="text"
						bind:value={formData.modelName}
						on:blur={handleModelNameBlur}
						on:input={generateModelCode}
						disabled={isReadOnly}
						class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						class:border-red-500={validationErrors.modelName}
						class:focus:ring-red-500={validationErrors.modelName}
						class:focus:border-red-500={validationErrors.modelName}
						placeholder="예: DY-CART-2024"
						aria-describedby={validationErrors.modelName ? 'modelName-error' : undefined}
					/>
					{#if validationErrors.modelName}
						<p id="modelName-error" class="mt-1 text-sm text-red-400" role="alert">
							{validationErrors.modelName}
						</p>
					{/if}
				</div>

				<div>
					<label
						for="modelCode"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>모델 코드 *</label
					>
					<input
						id="modelCode"
						type="text"
						bind:value={formData.modelCode}
						on:blur={handleModelCodeBlur}
						disabled={isReadOnly}
						class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						class:border-red-500={validationErrors.modelCode}
						class:focus:ring-red-500={validationErrors.modelCode}
						class:focus:border-red-500={validationErrors.modelCode}
						placeholder="예: DYC24"
						aria-describedby={validationErrors.modelCode ? 'modelCode-error' : undefined}
					/>
					{#if validationErrors.modelCode}
						<p id="modelCode-error" class="mt-1 text-sm text-red-400" role="alert">
							{validationErrors.modelCode}
						</p>
					{/if}
				</div>

				<div>
					<label for="year" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>연도 *</label
					>
					<input
						id="year"
						type="number"
						bind:value={formData.year}
						on:blur={handleYearBlur}
						disabled={isReadOnly}
						min="2020"
						max={new Date().getFullYear() + 5}
						class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						class:border-red-500={validationErrors.year}
						class:focus:ring-red-500={validationErrors.year}
						class:focus:border-red-500={validationErrors.year}
						aria-describedby={validationErrors.year ? 'year-error' : undefined}
					/>
					{#if validationErrors.year}
						<p id="year-error" class="mt-1 text-sm text-red-400" role="alert">
							{validationErrors.year}
						</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- 사양 정보 섹션 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold text-gray-900 dark:text-white">사양 정보</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label
						for="maxSpeed"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>최대 속도 (km/h) *</label
					>
					<input
						id="maxSpeed"
						type="number"
						bind:value={formData.specs.maxSpeed}
						on:blur={handleMaxSpeedBlur}
						disabled={isReadOnly}
						min="5"
						max="50"
						class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						class:border-red-500={validationErrors.maxSpeed}
						class:focus:ring-red-500={validationErrors.maxSpeed}
						class:focus:border-red-500={validationErrors.maxSpeed}
						aria-describedby={validationErrors.maxSpeed ? 'maxSpeed-error' : undefined}
					/>
					{#if validationErrors.maxSpeed}
						<p id="maxSpeed-error" class="mt-1 text-sm text-red-400" role="alert">
							{validationErrors.maxSpeed}
						</p>
					{/if}
				</div>

				<div>
					<label
						for="batteryType"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>배터리 타입 *</label
					>
					<select
						id="batteryType"
						bind:value={formData.specs.batteryType}
						on:blur={handleBatteryTypeBlur}
						disabled={isReadOnly}
						class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						class:border-red-500={validationErrors.batteryType}
						class:focus:ring-red-500={validationErrors.batteryType}
						class:focus:border-red-500={validationErrors.batteryType}
						aria-describedby={validationErrors.batteryType ? 'batteryType-error' : undefined}
					>
						<option value="">선택하세요</option>
						<option value="72V 리튬">72V 리튬</option>
						<option value="72V 납산">72V 납산</option>
						<option value="48V 리튬">48V 리튬</option>
						<option value="48V 납산">48V 납산</option>
					</select>
					{#if validationErrors.batteryType}
						<p id="batteryType-error" class="mt-1 text-sm text-red-400" role="alert">
							{validationErrors.batteryType}
						</p>
					{/if}
				</div>

				<div>
					<label for="seats" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
						>인승</label
					>
					<select
						id="seats"
						bind:value={formData.specs.seats}
						disabled={isReadOnly}
						class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value={2}>2인승</option>
						<option value={4}>4인승</option>
						<option value={6}>6인승</option>
						<option value={8}>8인승</option>
					</select>
				</div>
			</div>
		</div>

		<!-- 기능 및 상태 섹션 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold text-gray-900 dark:text-white">기능 및 상태</h3>

			<div>
				<label
					for="features"
					class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
				>
					주요 기능
				</label>
				<div class="space-y-2">
					{#each formData.features as feature, index}
						<div class="flex items-center gap-2">
							<span
								class="flex-1 rounded bg-gray-100
								 px-3 py-2 text-sm text-gray-100 dark:bg-gray-800"
							>
								{feature}
							</span>
							{#if !isReadOnly}
								<button
									type="button"
									on:click={() => removeFeature(index)}
									class="text-red-500 hover:text-red-700"
								>
									제거
								</button>
							{/if}
						</div>
					{/each}

					{#if !isReadOnly}
						<div class="flex gap-2">
							<input
								type="text"
								bind:value={newFeature}
								placeholder="새 기능 입력"
								class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								on:keydown={(e) => e.key === 'Enter' && addFeature()}
							/>
							<button
								type="button"
								on:click={addFeature}
								class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							>
								추가
							</button>
						</div>
					{/if}
				</div>
			</div>

			<div>
				<label for="status" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
					상태
				</label>
				<select
					id="status"
					bind:value={formData.status}
					disabled={isReadOnly}
					class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					<option value="active">활성</option>
					<option value="discontinued">단종</option>
				</select>
			</div>
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
