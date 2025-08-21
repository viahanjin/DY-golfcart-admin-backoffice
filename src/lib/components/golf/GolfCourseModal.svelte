<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import BaseModal from '$lib/components/common/BaseModal.svelte';
	import KakaoAddressSearch from '$lib/components/address/KakaoAddressSearch.svelte';

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

	// onMount를 사용해 수정/상세보기 모드일 때 데이터 로드
	onMount(() => {
		if (selectedCourse && (modalMode === 'edit' || modalMode === 'view')) {
			// 깊은 복사를 통해 원본 데이터 오염 방지
			formData = JSON.parse(JSON.stringify(selectedCourse));
		}
	});

	// 읽기 전용 모드 체크
	$: isReadOnly = modalMode === 'view';

	function handleSave() {
		if (formData.courseName && formData.courseCode) {
			// 부모 컴포넌트로 데이터 전달 시에도 복사본 전달
			dispatch('save', {
				mode: modalMode,
				data: JSON.parse(JSON.stringify(formData))
			});
		} else {
			alert('골프장명과 코드는 필수 항목입니다.');
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

		// 반응성 트리거 (Svelte에서 객체 변경 감지를 위해)
		formData = { ...formData };
	}

	// TODO: 지도에서 위치 선택 기능
	function handleMapLocationSelect() {
		// TODO: 지도 컴포넌트 모달 열기 및 위치 선택
		console.log('TODO: 지도에서 위치 선택 기능');
		alert('지도 위치 선택 기능은 추후 구현 예정입니다.');
	}
</script>

<BaseModal size="2xl" on:close={() => dispatch('close')}>
	<span slot="title">
		{modalMode === 'create'
			? '새 골프장 등록'
			: modalMode === 'edit'
				? '골프장 정보 수정'
				: '골프장 상세 정보'}
	</span>

	<div class="space-y-6">
		{#if modalMode === 'view'}
			<div class="border-b border-gray-200 dark:border-gray-600">
				<nav class="-mb-px flex space-x-8" aria-label="Tabs">
					<button
						class="border-b-2 border-blue-500 px-1 py-4 text-sm font-medium whitespace-nowrap text-blue-600 dark:text-blue-400"
						>기본정보</button
					>
					<button
						class="border-b-2 border-transparent px-1 py-4 text-sm font-medium whitespace-nowrap text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200"
						>카트현황</button
					>
					<button
						class="border-b-2 border-transparent px-1 py-4 text-sm font-medium whitespace-nowrap text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200"
						>코스정보</button
					>
				</nav>
			</div>
		{/if}
		<div class="space-y-6 pt-2">
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
								disabled={isReadOnly}
								class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/><button
								on:click={handleDuplicateCheck}
								disabled={isReadOnly}
								class="btn-secondary whitespace-nowrap text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200"
								>중복 검사</button
							>
						</div>
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
								disabled={isReadOnly}
								class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/><button
								on:click={handleAutoGenerateCode}
								disabled={isReadOnly}
								class="btn-secondary whitespace-nowrap text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200"
								>자동 생성</button
							>
						</div>
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
							disabled={isReadOnly}
							class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
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
							disabled={isReadOnly}
							class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>
				</div>
			</div>

			<!-- 주소 및 위치 섹션 -->
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold text-gray-900 dark:text-white">주소 및 위치</h3>
				<!-- 카카오 주소 검색 -->
				<KakaoAddressSearch
					placeholder="주소를 검색하세요"
					disabled={isReadOnly}
					on:select={handleAddressSelect}
				/>

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
				disabled={!formData.courseName || !formData.courseCode}
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
