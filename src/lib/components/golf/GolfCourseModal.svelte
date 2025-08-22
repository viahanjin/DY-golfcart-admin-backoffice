<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import BaseModal from '$lib/components/common/BaseModal.svelte';
	import KakaoAddressSearch from '$lib/components/address/KakaoAddressSearch.svelte';
	import AddCartModal from './AddCartModal.svelte';
	import { golfCourseCartService } from '$lib/services/golf-course-cart.service';
	import type { GolfCourseCart, CART_STATUS_MAP } from '$lib/types/golf-course-cart';
	import type { CartModel } from '$lib/types/cart-model';

	export let modalMode: 'create' | 'edit' | 'view';
	export let selectedCourse: any = null; // In a real app, this would be a proper type import

	const dispatch = createEventDispatcher();

	// 폼 데이터 초기화 함수
	function getInitialFormData() {
		return {
			id: '',
			courseName: '',
			courseNameEn: '',
			courseCode: '',
			address: {
				zipcode: '',
				postcode: '',
				address1: '',
				address2: ''
			},
			contact: {
				phone: '',
				fax: '',
				email: ''
			},
			location: {
				latitude: 0,
				longitude: 0,
				altitude: 0,
				coordinateSystem: 'WGS84',
				rtk: {
					baseLatitude: 0,
					baseLongitude: 0,
					provider: ''
				}
			},
			operation: {
				totalHoles: 18,
				operatingHours: {
					summer: '06:00 - 19:00',
					winter: '07:00 - 17:00'
				},
				closedDays: '매주 월요일',
				cartPolicy: {
					fairwayAccess: false,
					rainPolicy: '상황에 따라 결정',
					maxSpeed: 15
				}
			},
			environment: {
				terrain: [],
				gpsShadedAreas: {
					count: 0,
					locations: ''
				},
				specialNotes: ''
			},
			totalCarts: 0,
			activeCarts: 0,
			status: 'active',
			lastModified: '',
			createdAt: ''
		};
	}

	let formData = getInitialFormData();

	// 유효성 검사 에러 상태
	let validationErrors = {
		courseName: '',
		courseCode: '',
		phone: '',
		email: '',
		address: ''
	};

	// 탭 상태 관리
	let activeTab: 'basic' | 'carts' | 'courses' = 'basic';

	// 카트 관리 상태
	let showAddCartModal = false;
	let golfCourseCarts: GolfCourseCart[] = [];
	let availableCartModels: CartModel[] = [];
	let cartLoading = false;
	let cartError = '';

	// 카트 데이터 로드
	async function loadCartData() {
		if (!selectedCourse?.id) return;

		cartLoading = true;
		cartError = '';

		try {
			// 카트 목록과 모델 정보를 동시에 로드
			const [cartsResponse, modelsResponse] = await Promise.all([
				golfCourseCartService.getGolfCourseCarts(selectedCourse.id),
				golfCourseCartService.getAvailableCartModels()
			]);

			golfCourseCarts = cartsResponse.items;
			availableCartModels = modelsResponse;
		} catch (error) {
			console.error('카트 데이터 로드 실패:', error);
			cartError = error instanceof Error ? error.message : '카트 데이터를 불러오는데 실패했습니다.';
		} finally {
			cartLoading = false;
		}
	}

	// 선택된 골프장이 변경될 때 카트 데이터 로드
	$: if (selectedCourse?.id && activeTab === 'carts') {
		loadCartData();
	}

	// 필드 터치 상태 (사용자가 입력하거나 포커스 아웃했는지)
	let fieldTouched = {
		courseName: false,
		courseCode: false,
		phone: false,
		email: false,
		address: false
	};

	// onMount를 사용해 수정/상세보기 모드일 때 데이터 로드
	onMount(() => {
		if (selectedCourse && (modalMode === 'edit' || modalMode === 'view')) {
			// 깊은 복사를 통해 원본 데이터 오염 방지
			formData = JSON.parse(JSON.stringify(selectedCourse));
		}
	});

	// 읽기 전용 모드 체크
	$: isReadOnly = modalMode === 'view';

	// 유효성 검사 함수들
	const validateCourseName = (name: string): string => {
		if (!name?.trim()) return '골프장명을 입력해주세요';
		if (name.trim().length < 2) return '골프장명은 2자 이상이어야 합니다';
		if (name.trim().length > 50) return '골프장명은 50자 이하여야 합니다';
		return '';
	};

	const validateCourseCode = (code: string): string => {
		if (!code?.trim()) return '골프장 코드를 입력해주세요';
		if (!/^[A-Z0-9]{3,10}$/.test(code.trim()))
			return '코드는 3-10자의 영문 대문자와 숫자만 가능합니다';
		return '';
	};

	const validatePhone = (phone: string): string => {
		if (!phone?.trim()) return '전화번호를 입력해주세요';
		const phoneRegex = /^(\d{2,3}-\d{3,4}-\d{4}|\d{10,11})$/;
		if (!phoneRegex.test(phone.replace(/\s/g, '')))
			return '올바른 전화번호 형식이 아닙니다 (예: 02-1234-5678)';
		return '';
	};

	const validateEmail = (email: string): string => {
		if (!email?.trim()) return '이메일을 입력해주세요';
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) return '올바른 이메일 형식이 아닙니다';
		return '';
	};

	const validateAddress = (): string => {
		if (!formData.address.address1?.trim()) return '주소를 입력해주세요';
		return '';
	};

	// 실시간 유효성 검사 (터치된 필드만)
	$: if (fieldTouched.courseName)
		validationErrors.courseName = validateCourseName(formData.courseName);
	$: if (fieldTouched.courseCode)
		validationErrors.courseCode = validateCourseCode(formData.courseCode);
	$: if (fieldTouched.phone) validationErrors.phone = validatePhone(formData.contact.phone);
	$: if (fieldTouched.email) validationErrors.email = validateEmail(formData.contact.email);
	$: if (fieldTouched.address) validationErrors.address = validateAddress();

	// 폼 전체 유효성 검사
	$: isFormValid =
		!validationErrors.courseName &&
		!validationErrors.courseCode &&
		!validationErrors.phone &&
		!validationErrors.email &&
		!validationErrors.address &&
		formData.courseName?.trim() &&
		formData.courseCode?.trim() &&
		formData.contact.phone?.trim() &&
		formData.contact.email?.trim() &&
		formData.address.address1?.trim();

	// 필드 블러 핸들러들
	const handleCourseNameBlur = () => {
		fieldTouched.courseName = true;
		validationErrors.courseName = validateCourseName(formData.courseName);
	};

	const handleCourseCodeBlur = () => {
		fieldTouched.courseCode = true;
		validationErrors.courseCode = validateCourseCode(formData.courseCode);
	};

	const handlePhoneBlur = () => {
		fieldTouched.phone = true;
		validationErrors.phone = validatePhone(formData.contact.phone);
	};

	const handleEmailBlur = () => {
		fieldTouched.email = true;
		validationErrors.email = validateEmail(formData.contact.email);
	};

	function handleSave() {
		// 모든 필드 터치 상태로 만들어 에러 표시
		fieldTouched.courseName = true;
		fieldTouched.courseCode = true;
		fieldTouched.phone = true;
		fieldTouched.email = true;
		fieldTouched.address = true;

		// 유효성 검사 실행
		validationErrors.courseName = validateCourseName(formData.courseName);
		validationErrors.courseCode = validateCourseCode(formData.courseCode);
		validationErrors.phone = validatePhone(formData.contact.phone);
		validationErrors.email = validateEmail(formData.contact.email);
		validationErrors.address = validateAddress();

		if (isFormValid) {
			// 부모 컴포넌트로 데이터 전달 시에도 복사본 전달
			dispatch('save', {
				mode: modalMode,
				data: JSON.parse(JSON.stringify(formData))
			});
		}
	}

	// TODO: 골프장명 중복 검사 API 호출
	function handleDuplicateCheck() {
		if (!formData.courseName.trim()) {
			alert('골프장명을 입력해주세요.');
			return;
		}
		// TODO: API 호출하여 중복 검사
		console.log('TODO: 골프장명 중복 검사 -', formData.courseName);
		alert('중복 검사 기능은 추후 구현 예정입니다.');
	}

	// TODO: 골프장 코드 자동 생성
	function handleAutoGenerateCode() {
		// TODO: 골프장명을 기반으로 코드 자동 생성 로직
		const timestamp = Date.now().toString().slice(-4);
		const nameCode = formData.courseName.slice(0, 2);
		formData.courseCode = `${nameCode}${timestamp}`;
		console.log('TODO: 골프장 코드 자동 생성 -', formData.courseCode);
	}

	// 카카오 주소 검색 결과 처리
	function handleAddressSelect(event: CustomEvent) {
		const addressData = event.detail;
		console.log('골프장 모달에서 받은 데이터:', addressData);

		// 주소 정보 업데이트
		formData.address.postcode = addressData.zonecode;
		formData.address.zipcode = addressData.zonecode;
		formData.address.address1 = addressData.roadAddress || addressData.address;

		// GPS 좌표가 있으면 업데이트
		if (addressData.latitude && addressData.longitude) {
			formData.location.latitude = addressData.latitude;
			formData.location.longitude = addressData.longitude;
			console.log('좌표 설정 완료:', {
				latitude: formData.location.latitude,
				longitude: formData.location.longitude
			});
		} else {
			console.warn('좌표 정보가 없습니다:', addressData);
		}

		// 주소 선택 시 필드를 터치 상태로 만들고 에러 클리어
		fieldTouched.address = true;
		validationErrors.address = validateAddress();

		// 반응성 트리거 (Svelte에서 객체 변경 감지를 위해)
		formData = { ...formData };
	}

	// TODO: 지도에서 위치 선택 기능
	function handleMapLocationSelect() {
		// TODO: 지도 컴포넌트 모달 열기 및 위치 선택
		console.log('TODO: 지도에서 위치 선택 기능');
		alert('지도 위치 선택 기능은 추후 구현 예정입니다.');
	}

	// 카트 관리 이벤트 핸들러들
	function handleAddCart() {
		showAddCartModal = true;
	}

	async function handleCartAdded(event: CustomEvent) {
		const cartData = event.detail;

		try {
			// API를 통해 카트 추가
			const newCart = await golfCourseCartService.addCartToGolfCourse(cartData.golfCourseId, {
				cartNumber: cartData.cartNumber,
				serialNumber: cartData.serialNumber,
				modelId: cartData.modelId,
				notes: cartData.notes
			});

			// 카트 목록에 추가
			golfCourseCarts = [...golfCourseCarts, newCart];

			// 모달 닫기
			showAddCartModal = false;

			console.log('새 카트 추가됨:', newCart);
		} catch (error) {
			console.error('카트 추가 실패:', error);
			cartError = error instanceof Error ? error.message : '카트 추가에 실패했습니다.';
		}
	}

	async function handleUpdateCartStatus(cartId: string, status: string) {
		if (!selectedCourse?.id) return;

		try {
			// API를 통해 카트 상태 업데이트
			const updatedCart = await golfCourseCartService.updateCartStatus(
				selectedCourse.id,
				cartId,
				status
			);

			// 로컬 상태 업데이트
			golfCourseCarts = golfCourseCarts.map((cart) => (cart.id === cartId ? updatedCart : cart));

			console.log('카트 상태 업데이트됨:', cartId, status);
		} catch (error) {
			console.error('카트 상태 업데이트 실패:', error);
			cartError = error instanceof Error ? error.message : '카트 상태 업데이트에 실패했습니다.';
		}
	}

	async function handleRemoveCart(cartId: string) {
		if (!selectedCourse?.id) return;

		if (confirm('정말로 이 카트를 제거하시겠습니까?')) {
			try {
				// API를 통해 카트 제거
				await golfCourseCartService.removeCartFromGolfCourse(selectedCourse.id, cartId);

				// 로컬 상태에서 제거
				golfCourseCarts = golfCourseCarts.filter((cart) => cart.id !== cartId);

				console.log('카트 제거됨:', cartId);
			} catch (error) {
				console.error('카트 제거 실패:', error);
				cartError = error instanceof Error ? error.message : '카트 제거에 실패했습니다.';
			}
		}
	}
</script>

<BaseModal size="2xl" on:close={() => dispatch('close')}>
	<span slot="title">
		{modalMode === 'create'
			? '새 골프장 등록'
			: modalMode === 'edit'
				? '골프장 정보 저장'
				: '골프장 상세 정보'}
	</span>

	<div class="space-y-6">
		{#if modalMode === 'view'}
			<div class="border-b border-gray-200 dark:border-gray-600">
				<nav class="-mb-px flex space-x-8" aria-label="Tabs">
					<button
						on:click={() => (activeTab = 'basic')}
						class="border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap"
						class:border-blue-500={activeTab === 'basic'}
						class:text-blue-600={activeTab === 'basic'}
						class:dark:text-blue-400={activeTab === 'basic'}
						class:border-transparent={activeTab !== 'basic'}
						class:text-gray-500={activeTab !== 'basic'}
						class:hover:border-gray-300={activeTab !== 'basic'}
						class:hover:text-gray-700={activeTab !== 'basic'}
						class:dark:text-gray-400={activeTab !== 'basic'}
						class:dark:hover:border-gray-500={activeTab !== 'basic'}
						class:dark:hover:text-gray-200={activeTab !== 'basic'}>기본정보</button
					>
					<button
						on:click={() => (activeTab = 'carts')}
						class="border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap"
						class:border-blue-500={activeTab === 'carts'}
						class:text-blue-600={activeTab === 'carts'}
						class:dark:text-blue-400={activeTab === 'carts'}
						class:border-transparent={activeTab !== 'carts'}
						class:text-gray-500={activeTab !== 'carts'}
						class:hover:border-gray-300={activeTab !== 'carts'}
						class:hover:text-gray-700={activeTab !== 'carts'}
						class:dark:text-gray-400={activeTab !== 'carts'}
						class:dark:hover:border-gray-500={activeTab !== 'carts'}
						class:dark:hover:text-gray-200={activeTab !== 'carts'}>카트현황</button
					>
					<button
						on:click={() => (activeTab = 'courses')}
						class="border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap"
						class:border-blue-500={activeTab === 'courses'}
						class:text-blue-600={activeTab === 'courses'}
						class:dark:text-blue-400={activeTab === 'courses'}
						class:border-transparent={activeTab !== 'courses'}
						class:text-gray-500={activeTab !== 'courses'}
						class:hover:border-gray-300={activeTab !== 'courses'}
						class:hover:text-gray-700={activeTab !== 'courses'}
						class:dark:text-gray-400={activeTab !== 'courses'}
						class:dark:hover:border-gray-500={activeTab !== 'courses'}
						class:dark:hover:text-gray-200={activeTab !== 'courses'}>코스정보</button
					>
				</nav>
			</div>
		{/if}
		<div class="space-y-6 pt-2">
			{#if activeTab === 'basic'}
				<!-- 기본 정보 섹션 -->
				<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
					<h3 class="font-semibold text-gray-900 dark:text-white">기본 정보</h3>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="col-span-2">
							<label
								for="courseName"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
								>골프장명 (한글) *</label
							>
							<div class="flex gap-2">
								<input
									id="courseName"
									type="text"
									bind:value={formData.courseName}
									on:blur={handleCourseNameBlur}
									disabled={isReadOnly}
									class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
									class:border-red-500={validationErrors.courseName}
									class:focus:ring-red-500={validationErrors.courseName}
									class:focus:border-red-500={validationErrors.courseName}
									aria-describedby={validationErrors.courseName ? 'courseName-error' : undefined}
								/><button
									on:click={handleDuplicateCheck}
									disabled={isReadOnly}
									class="btn-secondary whitespace-nowrap text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200"
									>중복 검사</button
								>
							</div>
							{#if validationErrors.courseName}
								<p id="courseName-error" class="mt-1 text-sm text-red-400" role="alert">
									{validationErrors.courseName}
								</p>
							{/if}
						</div>
						<div class="col-span-2">
							<label
								for="courseNameEn"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
								>골프장명 (영문)</label
							><input
								id="courseNameEn"
								type="text"
								bind:value={formData.courseNameEn}
								disabled={isReadOnly}
								class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
						</div>
						<div class="col-span-2">
							<label
								for="courseCode"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
								>골프장 코드 *</label
							>
							<div class="flex gap-2">
								<input
									id="courseCode"
									type="text"
									bind:value={formData.courseCode}
									on:blur={handleCourseCodeBlur}
									disabled={isReadOnly}
									class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
									class:border-red-500={validationErrors.courseCode}
									class:focus:ring-red-500={validationErrors.courseCode}
									class:focus:border-red-500={validationErrors.courseCode}
									aria-describedby={validationErrors.courseCode ? 'courseCode-error' : undefined}
								/><button
									on:click={handleAutoGenerateCode}
									disabled={isReadOnly}
									class="btn-secondary whitespace-nowrap text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200"
									>자동 생성</button
								>
							</div>
							{#if validationErrors.courseCode}
								<p id="courseCode-error" class="mt-1 text-sm text-red-400" role="alert">
									{validationErrors.courseCode}
								</p>
							{/if}
						</div>
						<div>
							<label
								for="phone"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
								>대표 전화번호 *</label
							><input
								id="phone"
								type="tel"
								bind:value={formData.contact.phone}
								on:blur={handlePhoneBlur}
								disabled={isReadOnly}
								class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								class:border-red-500={validationErrors.phone}
								class:focus:ring-red-500={validationErrors.phone}
								class:focus:border-red-500={validationErrors.phone}
								aria-describedby={validationErrors.phone ? 'phone-error' : undefined}
							/>
							{#if validationErrors.phone}
								<p id="phone-error" class="mt-1 text-sm text-red-400" role="alert">
									{validationErrors.phone}
								</p>
							{/if}
						</div>
						<div>
							<label
								for="email"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
								>이메일 *</label
							><input
								id="email"
								type="email"
								bind:value={formData.contact.email}
								on:blur={handleEmailBlur}
								disabled={isReadOnly}
								class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								class:border-red-500={validationErrors.email}
								class:focus:ring-red-500={validationErrors.email}
								class:focus:border-red-500={validationErrors.email}
								aria-describedby={validationErrors.email ? 'email-error' : undefined}
							/>
							{#if validationErrors.email}
								<p id="email-error" class="mt-1 text-sm text-red-400" role="alert">
									{validationErrors.email}
								</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- 주소 및 위치 섹션 -->
				<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
					<h3 class="font-semibold text-gray-900 dark:text-white">주소 및 위치</h3>

					<div>
						<label
							for="address"
							class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">주소 *</label
						>
						<!-- 카카오 주소 검색 -->
						<KakaoAddressSearch
							placeholder="주소를 검색하세요"
							disabled={isReadOnly}
							on:select={handleAddressSelect}
						/>
						{#if validationErrors.address}
							<p class="mt-1 text-sm text-red-400" role="alert">
								{validationErrors.address}
							</p>
						{/if}
					</div>

					<!-- 우편번호 표시 -->
					{#if formData.address.postcode}
						<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
							<span>우편번호: {formData.address.postcode}</span>
						</div>
					{/if}

					<!-- 상세주소 입력 -->
					<input
						type="text"
						placeholder="상세주소"
						bind:value={formData.address.address2}
						disabled={isReadOnly}
						class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<!-- 운영 정보 섹션 -->
				<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
					<h3 class="font-semibold text-gray-900 dark:text-white">운영 정보</h3>
					<div>
						<label
							for="totalHoles"
							class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">홀 수</label
						>
						<select
							id="totalHoles"
							bind:value={formData.operation.totalHoles}
							disabled={isReadOnly}
							class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						>
							<option value={9}>9홀</option><option value={18}>18홀</option><option value={27}
								>27홀</option
							><option value={36}>36홀</option>
						</select>
					</div>
					<div>
						<label
							for="maxSpeed"
							class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
							>최대 운행 속도: {formData.operation.cartPolicy.maxSpeed} km/h</label
						>
						<input
							type="range"
							id="maxSpeed"
							bind:value={formData.operation.cartPolicy.maxSpeed}
							min="5"
							max="25"
							disabled={isReadOnly}
							class="w-full"
						/>
					</div>
				</div>

				<!-- 특이사항 및 환경 정보 -->
				<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
					<h3 class="font-semibold text-gray-900 dark:text-white">특이사항 및 환경</h3>
					<div>
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
							>지형 특성</label
						>
						<div class="flex gap-4">
							<label class="flex items-center gap-2 text-gray-700 dark:text-gray-200"
								><input
									type="checkbox"
									value="flat"
									bind:group={formData.environment.terrain}
									class="rounded"
								/> 평지형</label
							>
							<label class="flex items-center gap-2 text-gray-700 dark:text-gray-200"
								><input
									type="checkbox"
									value="hilly"
									bind:group={formData.environment.terrain}
									class="rounded"
								/> 구릉형</label
							>
							<label class="flex items-center gap-2 text-gray-700 dark:text-gray-200"
								><input
									type="checkbox"
									value="mountainous"
									bind:group={formData.environment.terrain}
									class="rounded"
								/> 산악형</label
							>
						</div>
					</div>
					<div>
						<label
							for="specialNotes"
							class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
							>특이사항 메모</label
						>
						<textarea
							id="specialNotes"
							bind:value={formData.environment.specialNotes}
							disabled={isReadOnly}
							rows={3}
							class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						></textarea>
					</div>
				</div>
			{/if}

			{#if activeTab === 'carts'}
				<!-- 카트현황 섹션 -->
				<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
					<div class="flex items-center justify-between">
						<h3 class="font-semibold text-gray-900 dark:text-white">카트 현황</h3>
						<button
							class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
							on:click={handleAddCart}
							disabled={cartLoading}
						>
							카트 추가
						</button>
					</div>

					<!-- 에러 메시지 -->
					{#if cartError}
						<div class="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
							<div class="flex">
								<div class="ml-3">
									<p class="text-sm font-medium text-red-800 dark:text-red-200">
										{cartError}
									</p>
								</div>
							</div>
						</div>
					{/if}

					<!-- 카트 통계 -->
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
							<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
								{golfCourseCarts.length}
							</div>
							<div class="text-sm text-blue-600 dark:text-blue-400">총 카트 수</div>
						</div>
						<div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
							<div class="text-2xl font-bold text-green-600 dark:text-green-400">
								{golfCourseCarts.filter((c) => c.status === 'active').length}
							</div>
							<div class="text-sm text-green-600 dark:text-green-400">운영 중</div>
						</div>
						<div class="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
							<div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
								{golfCourseCarts.filter((c) => c.status !== 'active').length}
							</div>
							<div class="text-sm text-yellow-600 dark:text-yellow-400">점검/고장</div>
						</div>
					</div>

					<!-- 로딩 상태 -->
					{#if cartLoading}
						<div class="flex justify-center py-8">
							<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
							<span class="ml-2 text-gray-600 dark:text-gray-400">카트 데이터를 불러오는 중...</span
							>
						</div>
					{:else}
						<!-- 카트 목록 테이블 -->
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
								<thead class="bg-gray-50 dark:bg-gray-800">
									<tr>
										<th
											class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
										>
											카트 번호
										</th>
										<th
											class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
										>
											모델명
										</th>
										<th
											class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
										>
											상태
										</th>
										<th
											class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
										>
											배치일
										</th>
										<th
											class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
										>
											작업
										</th>
									</tr>
								</thead>
								<tbody
									class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900"
								>
									{#each golfCourseCarts as cart}
										<tr>
											<td
												class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white"
											>
												{cart.cartNumber}
											</td>
											<td
												class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
											>
												{cart.modelName}
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<select
													bind:value={cart.status}
													on:change={() => handleUpdateCartStatus(cart.id, cart.status)}
													class="inline-flex rounded-full border-none bg-transparent px-2 py-1 text-xs font-semibold"
													class:bg-green-100={cart.status === 'active'}
													class:text-green-800={cart.status === 'active'}
													class:dark:bg-green-900={cart.status === 'active'}
													class:dark:text-green-200={cart.status === 'active'}
													class:bg-yellow-100={cart.status === 'maintenance'}
													class:text-yellow-800={cart.status === 'maintenance'}
													class:dark:bg-yellow-900={cart.status === 'maintenance'}
													class:dark:text-yellow-200={cart.status === 'maintenance'}
													class:bg-red-100={cart.status === 'broken'}
													class:text-red-800={cart.status === 'broken'}
													class:dark:bg-red-900={cart.status === 'broken'}
													class:dark:text-red-200={cart.status === 'broken'}
												>
													<option value="active">운영중</option>
													<option value="maintenance">점검중</option>
													<option value="broken">고장</option>
													<option value="inactive">비활성</option>
												</select>
											</td>
											<td
												class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
											>
												{cart.deployedAt}
											</td>
											<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
												<button
													class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
													on:click={() => handleRemoveCart(cart.id)}
												>
													제거
												</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<!-- 카트 데이터가 없는 경우 -->
						{#if golfCourseCarts.length === 0}
							<div class="py-8 text-center">
								<div class="text-gray-500 dark:text-gray-400">
									<svg
										class="mx-auto h-12 w-12 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										/>
									</svg>
									<h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
										카트가 배치되지 않았습니다
									</h3>
									<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
										카트를 추가하여 골프장에 배치하세요.
									</p>
								</div>
							</div>
						{/if}
					{/if}
				</div>
			{/if}

			{#if activeTab === 'courses'}
				<!-- 코스정보 섹션 (나중에 구현) -->
				<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
					<h3 class="font-semibold text-gray-900 dark:text-white">코스 정보</h3>
					<div class="py-8 text-center">
						<div class="text-gray-500 dark:text-gray-400">
							<svg
								class="mx-auto h-12 w-12 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
								곧 제공될 예정입니다
							</h3>
							<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
								코스 정보 관리 기능을 준비 중입니다.
							</p>
						</div>
					</div>
				</div>
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

<!-- 카트 추가 모달 -->
{#if showAddCartModal}
	<AddCartModal
		golfCourseId={selectedCourse?.id || ''}
		availableModels={availableCartModels}
		on:save={handleCartAdded}
		on:close={() => (showAddCartModal = false)}
	/>
{/if}
