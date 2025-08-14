<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { X } from 'lucide-svelte';

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

	function handleClose() {
		dispatch('close');
	}
</script>

<!-- 모달 배경 -->
<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
	<!-- 모달 창 -->
	<div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white dark:bg-gray-800">
		<!-- 모달 헤더 -->
		<div
			class="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700"
		>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
				{modalMode === 'create'
					? '새 골프장 등록'
					: modalMode === 'edit'
						? '골프장 정보 수정'
						: '골프장 상세 정보'}
			</h2>
			<button
				on:click={handleClose}
				class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
			>
				<X class="h-5 w-5" />
			</button>
		</div>

		<!-- 모달 내용 -->
		<div class="space-y-6 p-6">
			<!-- 기본 정보 섹션 -->
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold text-gray-900 dark:text-white">기본 정보</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="courseName" class="mb-2 block text-sm font-medium">골프장명 (한글) *</label>
						<input id="courseName" type="text" bind:value={formData.courseName} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
					</div>
					<div>
						<label for="courseNameEn" class="mb-2 block text-sm font-medium">골프장명 (영문)</label>
						<input id="courseNameEn" type="text" bind:value={formData.courseNameEn} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
					</div>
				</div>
				<div>
					<label for="courseCode" class="mb-2 block text-sm font-medium">골프장 코드 *</label>
					<input id="courseCode" type="text" bind:value={formData.courseCode} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
				</div>
				<!-- 주소 -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					<input type="text" placeholder="우편번호" bind:value={formData.address.zipcode} disabled={isReadOnly} class="md:col-span-1 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
					<input type="text" placeholder="주소" bind:value={formData.address.address1} disabled={isReadOnly} class="md:col-span-2 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
					<input type="text" placeholder="상세주소" bind:value={formData.address.address2} disabled={isReadOnly} class="md:col-span-3 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
				</div>
				<!-- 연락처 -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<input type="tel" placeholder="대표 전화번호" bind:value={formData.contact.phone} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
					<input type="email" placeholder="대표 이메일" bind:value={formData.contact.email} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
				</div>
			</div>

			<!-- 위치 정보 섹션 -->
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold text-gray-900 dark:text-white">위치 정보</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					<input type="number" placeholder="위도 (Latitude)" bind:value={formData.location.latitude} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
					<input type="number" placeholder="경도 (Longitude)" bind:value={formData.location.longitude} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
					<input type="number" placeholder="고도 (Altitude)" bind:value={formData.location.altitude} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
				</div>
				<div>
					<label for="coordinateSystem" class="mb-2 block text-sm font-medium">좌표계</label>
					<select id="coordinateSystem" bind:value={formData.location.coordinateSystem} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700">
						<option value="WGS84">WGS84</option>
						<option value="UTM-K">UTM-K</option>
					</select>
				</div>
			</div>

			<!-- 운영 정보 섹션 -->
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold text-gray-900 dark:text-white">운영 정보</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="totalHoles" class="mb-2 block text-sm font-medium">홀 수</label>
						<select id="totalHoles" bind:value={formData.operation.totalHoles} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700">
							<option value={9}>9홀</option>
							<option value={18}>18홀</option>
							<option value={27}>27홀</option>
							<option value={36}>36홀</option>
						</select>
					</div>
					<div>
						<label for="closedDays" class="mb-2 block text-sm font-medium">휴무일 정보</label>
						<input id="closedDays" type="text" bind:value={formData.operation.closedDays} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
					</div>
				</div>
				<div class="flex items-center gap-4">
					<label for="fairwayAccess" class="text-sm font-medium">페어웨이 진입 허용</label>
					<input id="fairwayAccess" type="checkbox" bind:checked={formData.operation.cartPolicy.fairwayAccess} disabled={isReadOnly} class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
				</div>
			</div>

			<!-- 기타 정보 -->
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold text-gray-900 dark:text-white">기타 정보</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					<input type="number" placeholder="총 카트 수" bind:value={formData.totalCarts} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
					<input type="number" placeholder="운행중 카트" bind:value={formData.activeCarts} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
					<select bind:value={formData.status} disabled={isReadOnly} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700">
						<option value="active">운영중</option>
						<option value="inactive">비활성</option>
						<option value="maintenance">정비중</option>
					</select>
				</div>
				<div>
						<label for="specialNotes" class="mb-2 block text-sm font-medium">특이사항</label>
						<textarea id="specialNotes" bind:value={formData.environment.specialNotes} disabled={isReadOnly} rows={3} class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"></textarea>
				</div>
			</div>
		</div>

		<!-- 모달 푸터 -->
		{#if !isReadOnly}
			<div
				class="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700"
			>
				<button
					on:click={handleClose}
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
			</div>
		{:else}
			<div
				class="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700"
			>
				<button
					on:click={handleClose}
					class="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
				>
					닫기
				</button>
			</div>
		{/if}
	</div>
</div>
