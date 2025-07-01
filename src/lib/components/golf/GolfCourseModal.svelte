<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X, MapPin, Car, Hash } from 'lucide-svelte';

	export let modalMode: 'create' | 'edit' | 'view';
	export let selectedCourse: any = null;

	const dispatch = createEventDispatcher();

	// 폼 데이터
	let formData = {
		courseName: '',
		courseCode: '',
		address: {
			region: '',
			city: '',
			country: 'KR'
		},
		totalHoles: 18,
		totalCarts: 0,
		activeCarts: 0,
		status: 'active'
	};

	// 수정 모드일 때 기존 데이터 로드
	$: if (selectedCourse && (modalMode === 'edit' || modalMode === 'view')) {
		formData = { ...selectedCourse };
	}

	// 읽기 전용 모드 체크
	$: isReadOnly = modalMode === 'view';

	function handleSave() {
		if (formData.courseName && formData.courseCode) {
			dispatch('save', {
				mode: modalMode,
				data: formData
			});
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
			<!-- 기본 정보 -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						for="courseName"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						골프장명 *
					</label>
					<input
						id="courseName"
						type="text"
						bind:value={formData.courseName}
						disabled={isReadOnly}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						placeholder="예: 서울 컨트리클럽"
					/>
				</div>

				<div>
					<label
						for="courseCode"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						골프장 코드 *
					</label>
					<input
						id="courseCode"
						type="text"
						bind:value={formData.courseCode}
						disabled={isReadOnly}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						placeholder="예: SCC001"
					/>
				</div>
			</div>

			<!-- 주소 정보 -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label
						for="region"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						지역/도
					</label>
					<input
						id="region"
						type="text"
						bind:value={formData.address.region}
						disabled={isReadOnly}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						placeholder="예: 서울"
					/>
				</div>

				<div>
					<label for="city" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
						시/군/구
					</label>
					<input
						id="city"
						type="text"
						bind:value={formData.address.city}
						disabled={isReadOnly}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						placeholder="예: 강남구"
					/>
				</div>

				<div>
					<label
						for="country"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						국가
					</label>
					<select
						id="country"
						bind:value={formData.address.country}
						disabled={isReadOnly}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="KR">한국</option>
						<option value="JP">일본</option>
						<option value="US">미국</option>
					</select>
				</div>
			</div>

			<!-- 코스 및 카트 정보 -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
				<div>
					<label
						for="totalHoles"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						총 홀 수
					</label>
					<select
						id="totalHoles"
						bind:value={formData.totalHoles}
						disabled={isReadOnly}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value={9}>9홀</option>
						<option value={18}>18홀</option>
						<option value={27}>27홀</option>
						<option value={36}>36홀</option>
					</select>
				</div>

				<div>
					<label
						for="totalCarts"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						총 카트 수
					</label>
					<input
						id="totalCarts"
						type="number"
						bind:value={formData.totalCarts}
						disabled={isReadOnly}
						min="0"
						max="100"
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						placeholder="0"
					/>
				</div>

				<div>
					<label
						for="activeCarts"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						운행 중 카트
					</label>
					<input
						id="activeCarts"
						type="number"
						bind:value={formData.activeCarts}
						disabled={isReadOnly}
						min="0"
						max={formData.totalCarts}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						placeholder="0"
					/>
				</div>

				<div>
					<label
						for="status"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						운영 상태
					</label>
					<select
						id="status"
						bind:value={formData.status}
						disabled={isReadOnly}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="active">운영중</option>
						<option value="inactive">비활성</option>
						<option value="maintenance">정비중</option>
					</select>
				</div>
			</div>

			<!-- 안내 메시지 -->
			{#if modalMode === 'create'}
				<div
					class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
				>
					<div class="flex items-start gap-3">
						<MapPin class="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
						<div class="text-sm text-blue-800 dark:text-blue-200">
							<p class="mb-1 font-medium">골프장 등록 안내</p>
							<p>
								기본 정보만 입력하고 등록 후, 상세 설정(코스 레이아웃, GPS 좌표 등)은 별도 메뉴에서
								설정할 수 있습니다.
							</p>
						</div>
					</div>
				</div>
			{/if}
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
