<script lang="ts">
	import {
		Upload,
		Download,
		Car,
		Search,
		Filter,
		Plus,
		Edit,
		Trash2,
		MapPin,
		Battery,
		Users,
		Calendar,
		Building2
	} from 'lucide-svelte';

	// 타입 정의
	interface GolfCourse {
		readonly id: string;
		readonly name: string;
		readonly holes: number;
		readonly zones: readonly GolfZone[];
	}

	interface GolfZone {
		readonly id: string;
		readonly name: string;
		readonly type: 'hole' | 'facility' | 'service';
		readonly capacity: number;
	}

	interface CartModel {
		readonly id: number;
		readonly name: string;
		readonly capacity: number;
		readonly batteryType: string;
		readonly maxSpeed: number;
	}

	interface Cart {
		readonly id: number;
		readonly serialNumber: string;
		readonly model: string;
		readonly courseId: string;
		readonly courseName: string;
		readonly zone: string;
		readonly status: CartStatus;
		readonly batteryLevel: number;
	}

	interface NewCartForm {
		courseId: string;
		modelId: string;
		serialNumber: string;
		zone: string;
	}

	interface RegistrationProgress {
		readonly total: number;
		readonly completed: number;
		readonly failed: number;
		readonly pending: number;
	}

	type CartStatus = '운영중' | '점검중' | '대기중' | '고장';
	type TabType = 'list' | 'register' | 'models';
	type StatusColorClass =
		| 'bg-green-900 text-green-300'
		| 'bg-yellow-900 text-yellow-300'
		| 'bg-gray-700 text-gray-300'
		| 'bg-red-900 text-red-300';
	type BatteryColorClass = 'text-green-400' | 'text-yellow-400' | 'text-red-400';

	// 반응형 상태
	let activeTab: TabType = 'list';
	let selectedCarts: number[] = [];
	let searchTerm: string = '';
	let selectedCourse: GolfCourse | null = null;
	let selectedCourseForList: GolfCourse | null = null; // 목록용 골프장 선택

	// 골프장 데이터
	const golfCourses: readonly GolfCourse[] = [
		{
			id: 'course-001',
			name: '레이크사이드 골프클럽',
			holes: 18,
			zones: [
				{ id: 'hole-1', name: '1번홀', type: 'hole', capacity: 4 },
				{ id: 'hole-2', name: '2번홀', type: 'hole', capacity: 4 },
				{ id: 'hole-3', name: '3번홀', type: 'hole', capacity: 4 },
				{ id: 'hole-4', name: '4번홀', type: 'hole', capacity: 4 },
				{ id: 'hole-5', name: '5번홀', type: 'hole', capacity: 4 },
				{ id: 'clubhouse', name: '클럽하우스', type: 'facility', capacity: 10 },
				{ id: 'vip-lounge', name: 'VIP라운지', type: 'facility', capacity: 8 },
				{ id: 'pro-shop', name: '프로샵', type: 'facility', capacity: 2 },
				{ id: 'maintenance', name: '정비소', type: 'service', capacity: 15 },
				{ id: 'charging', name: '충전소', type: 'service', capacity: 10 },
				{ id: 'driving-range', name: '드라이빙레인지', type: 'facility', capacity: 6 }
			]
		},
		{
			id: 'course-002',
			name: '마운틴뷰 컨트리클럽',
			holes: 36,
			zones: [
				{ id: 'east-1', name: 'East 1번홀', type: 'hole', capacity: 4 },
				{ id: 'east-2', name: 'East 2번홀', type: 'hole', capacity: 4 },
				{ id: 'west-1', name: 'West 1번홀', type: 'hole', capacity: 4 },
				{ id: 'west-2', name: 'West 2번홀', type: 'hole', capacity: 4 },
				{ id: 'main-clubhouse', name: '메인 클럽하우스', type: 'facility', capacity: 20 },
				{ id: 'resort-connect', name: '리조트 연결통로', type: 'facility', capacity: 8 },
				{ id: 'convention', name: '컨벤션센터', type: 'facility', capacity: 5 },
				{ id: 'main-maintenance', name: '중앙 정비소', type: 'service', capacity: 25 }
			]
		},
		{
			id: 'course-003',
			name: '오션뷰 골프리조트',
			holes: 27,
			zones: [
				{ id: 'ocean-1', name: 'Ocean 1번홀', type: 'hole', capacity: 4 },
				{ id: 'ocean-2', name: 'Ocean 2번홀', type: 'hole', capacity: 4 },
				{ id: 'mountain-1', name: 'Mountain 1번홀', type: 'hole', capacity: 4 },
				{ id: 'valley-1', name: 'Valley 1번홀', type: 'hole', capacity: 4 },
				{ id: 'resort-clubhouse', name: '리조트 클럽하우스', type: 'facility', capacity: 15 },
				{ id: 'spa-connect', name: '스파 연결로', type: 'facility', capacity: 3 },
				{ id: 'beach-maintenance', name: '해변 정비소', type: 'service', capacity: 12 }
			]
		}
	] as const;

	// 샘플 카트 모델 데이터
	const cartModels: readonly CartModel[] = [
		{ id: 1, name: 'Yamaha Drive2 AC', capacity: 2, batteryType: 'AGM 48V', maxSpeed: 25 },
		{ id: 2, name: 'Club Car Tempo', capacity: 4, batteryType: 'Lithium 48V', maxSpeed: 32 },
		{ id: 3, name: 'E-Z-GO RXV', capacity: 2, batteryType: 'AGM 48V', maxSpeed: 24 }
	] as const;

	// 샘플 카트 데이터 (여러 골프장)
	const carts: readonly Cart[] = [
		{
			id: 1,
			serialNumber: 'GC-2024-001',
			model: 'Yamaha Drive2 AC',
			courseId: 'course-001',
			courseName: '레이크사이드 골프클럽',
			zone: '1번홀',
			status: '운영중',
			batteryLevel: 85
		},
		{
			id: 2,
			serialNumber: 'GC-2024-002',
			model: 'Yamaha Drive2 AC',
			courseId: 'course-001',
			courseName: '레이크사이드 골프클럽',
			zone: '2번홀',
			status: '운영중',
			batteryLevel: 92
		},
		{
			id: 3,
			serialNumber: 'GC-2024-003',
			model: 'Club Car Tempo',
			courseId: 'course-001',
			courseName: '레이크사이드 골프클럽',
			zone: 'VIP라운지',
			status: '점검중',
			batteryLevel: 45
		},
		{
			id: 4,
			serialNumber: 'MC-2024-001',
			model: 'E-Z-GO RXV',
			courseId: 'course-002',
			courseName: '마운틴뷰 컨트리클럽',
			zone: '메인 클럽하우스',
			status: '대기중',
			batteryLevel: 100
		},
		{
			id: 5,
			serialNumber: 'OC-2024-001',
			model: 'Club Car Tempo',
			courseId: 'course-003',
			courseName: '오션뷰 골프리조트',
			zone: '리조트 클럽하우스',
			status: '운영중',
			batteryLevel: 78
		}
	] as const;

	// 등록 폼 데이터
	let newCart: NewCartForm = {
		courseId: '',
		modelId: '',
		serialNumber: '',
		zone: ''
	};

	// 등록 진행 상황
	const registrationProgress: RegistrationProgress = {
		total: 50,
		completed: 23,
		failed: 2,
		pending: 25
	} as const;

	// 반응형 계산
	$: availableZones = selectedCourse?.zones || [];
	$: zonesByType = availableZones.reduce(
		(acc, zone) => {
			if (!acc[zone.type]) acc[zone.type] = [];
			acc[zone.type].push(zone);
			return acc;
		},
		{} as Record<string, GolfZone[]>
	);

	// 골프장별 카트 필터링
	$: filteredCarts = selectedCourseForList
		? carts.filter((cart) => cart.courseId === selectedCourseForList?.id)
		: carts;

	// 구역별 카트 수 계산
	function getCartCountByZone(zoneId: string): number {
		return carts.filter((cart) => cart.zone === zoneId || cart.zone.includes(zoneId)).length;
	}

	// 골프장 선택 시 폼 리셋
	$: if (selectedCourse) {
		newCart.courseId = selectedCourse.id;
		newCart.zone = ''; // 구역 선택 초기화
	}

	function getStatusColor(status: CartStatus): StatusColorClass {
		switch (status) {
			case '운영중':
				return 'bg-green-900 text-green-300';
			case '점검중':
				return 'bg-yellow-900 text-yellow-300';
			case '대기중':
				return 'bg-gray-700 text-gray-300';
			case '고장':
				return 'bg-red-900 text-red-300';
			default:
				return 'bg-gray-700 text-gray-300';
		}
	}

	function getBatteryColor(level: number): BatteryColorClass {
		if (level >= 80) return 'text-green-400';
		if (level >= 50) return 'text-yellow-400';
		return 'text-red-400';
	}

	function toggleCartSelection(cartId: number): void {
		if (selectedCarts.includes(cartId)) {
			selectedCarts = selectedCarts.filter((id) => id !== cartId);
		} else {
			selectedCarts = [...selectedCarts, cartId];
		}
	}

	function selectAllCarts(): void {
		if (selectedCarts.length === filteredCarts.length) {
			selectedCarts = [];
		} else {
			selectedCarts = filteredCarts.map((cart) => cart.id);
		}
	}

	function handleIndividualRegister(): void {
		console.log('개별 등록:', newCart);
		// API 호출 로직
	}

	function handleFileUpload(event: Event): void {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			console.log('파일 업로드:', file.name);
			console.log('선택된 골프장:', selectedCourse?.name);
			// 파일 처리 로직
		}
	}

	function downloadTemplate(): void {
		if (!selectedCourse) {
			alert('먼저 골프장을 선택해주세요.');
			return;
		}
		console.log('템플릿 다운로드 - 골프장:', selectedCourse.name);
		// 골프장별 템플릿 다운로드 로직
	}

	function exportToExcel(): void {
		console.log('엑셀 내보내기');
		// 엑셀 내보내기 로직
	}

	$: progressPercentage = (registrationProgress.completed / registrationProgress.total) * 100;
</script>

<div class="min-h-screen bg-gray-900 p-6">
	<div class="mx-auto max-w-7xl">
		<!-- 헤더 -->
		<div class="mb-8">
			<h1 class="mb-2 text-3xl font-bold text-white">골프카트 관제 시스템</h1>
			<p class="text-gray-400">카트 등록 및 관리</p>
		</div>

		<!-- 탭 네비게이션 -->
		<div class="mb-6 rounded-lg bg-gray-800 shadow-sm">
			<div class="border-b border-gray-700">
				<nav class="flex space-x-8 px-6">
					<button
						on:click={() => (activeTab = 'list')}
						class="border-b-2 py-4 text-sm font-medium {activeTab === 'list'
							? 'border-blue-400 text-blue-400'
							: 'border-transparent text-gray-400 hover:text-gray-300'}"
					>
						카트 목록 관리
					</button>
					<button
						on:click={() => (activeTab = 'register')}
						class="border-b-2 py-4 text-sm font-medium {activeTab === 'register'
							? 'border-blue-400 text-blue-400'
							: 'border-transparent text-gray-400 hover:text-gray-300'}"
					>
						카트 등록
					</button>
					<button
						on:click={() => (activeTab = 'models')}
						class="border-b-2 py-4 text-sm font-medium {activeTab === 'models'
							? 'border-blue-400 text-blue-400'
							: 'border-transparent text-gray-400 hover:text-gray-300'}"
					>
						모델 관리
					</button>
				</nav>
			</div>
		</div>

		<!-- 카트 목록 탭 -->
		{#if activeTab === 'list'}
			<div class="space-y-6">
				<!-- 골프장 선택 -->
				<div class="rounded-lg bg-gray-800 p-6 shadow-sm">
					<div class="mb-4 flex items-center">
						<Building2 class="mr-2 h-6 w-6 text-blue-400" />
						<h3 class="text-lg font-semibold text-white">골프장 선택</h3>
					</div>
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
						<!-- 전체 보기 옵션 -->
						<button
							on:click={() => (selectedCourseForList = null)}
							class="rounded-lg border-2 p-3 text-left transition-all {selectedCourseForList ===
							null
								? 'border-blue-500 bg-blue-900'
								: 'border-gray-600 bg-gray-700 hover:bg-gray-600'}"
						>
							<h4 class="font-semibold text-white">전체 골프장</h4>
							<p class="text-sm text-gray-400">모든 카트 보기 ({carts.length}대)</p>
						</button>

						<!-- 골프장별 옵션 -->
						{#each golfCourses as course}
							{@const courseCartCount = carts.filter((c) => c.courseId === course.id).length}
							<button
								on:click={() => (selectedCourseForList = course)}
								class="rounded-lg border-2 p-3 text-left transition-all {selectedCourseForList?.id ===
								course.id
									? 'border-blue-500 bg-blue-900'
									: 'border-gray-600 bg-gray-700 hover:bg-gray-600'}"
							>
								<h4 class="font-semibold text-white">{course.name}</h4>
								<p class="text-sm text-gray-400">{courseCartCount}대 운영중</p>
							</button>
						{/each}
					</div>
				</div>

				<!-- 액션 바 -->
				<div class="rounded-lg bg-gray-800 p-6 shadow-sm">
					<div class="mb-4 flex items-center justify-between">
						<div class="flex items-center space-x-4">
							<div class="relative">
								<Search
									class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
								/>
								<input
									type="text"
									bind:value={searchTerm}
									placeholder="카트 번호, 모델명으로 검색..."
									class="w-80 rounded-lg border border-gray-600 bg-gray-700 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<button
								class="flex items-center space-x-2 rounded-lg border border-gray-600 px-4 py-2 text-gray-300 hover:bg-gray-700"
							>
								<Filter class="h-4 w-4" />
								<span>필터</span>
							</button>
						</div>
						<div class="flex items-center space-x-3">
							<span class="text-sm text-gray-400">
								{#if selectedCourseForList}
									{selectedCourseForList.name}: {filteredCarts.length}대
								{:else}
									전체: {filteredCarts.length}대
								{/if}
							</span>
							<button
								on:click={exportToExcel}
								class="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
							>
								<Download class="h-4 w-4" />
								<span>엑셀 다운로드</span>
							</button>
							<button
								on:click={() => (activeTab = 'register')}
								class="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							>
								<Plus class="h-4 w-4" />
								<span>카트 추가</span>
							</button>
						</div>
					</div>

					<!-- 선택된 항목 액션 -->
					{#if selectedCarts.length > 0}
						<div class="mb-4 flex items-center justify-between rounded-lg bg-blue-900 p-3">
							<span class="text-sm text-blue-300">
								{selectedCarts.length}개 카트가 선택됨
							</span>
							<div class="flex space-x-2">
								<button class="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
									일괄 수정
								</button>
								<button
									class="rounded border border-red-500 px-3 py-1 text-sm text-red-400 hover:bg-red-900"
								>
									일괄 삭제
								</button>
							</div>
						</div>
					{/if}
				</div>

				<!-- 카트 목록 테이블 -->
				<div class="overflow-hidden rounded-lg bg-gray-800 shadow-sm">
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-gray-700">
								<tr>
									<th class="px-6 py-3 text-left">
										<input
											type="checkbox"
											class="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
											checked={selectedCarts.length === filteredCarts.length &&
												filteredCarts.length > 0}
											on:change={selectAllCarts}
										/>
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
									>
										카트 정보
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
									>
										골프장
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
									>
										모델
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
									>
										배치 구역
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
									>
										상태
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
									>
										배터리
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
									>
										액션
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-700 bg-gray-800">
								{#each filteredCarts as cart (cart.id)}
									<tr class="hover:bg-gray-700">
										<td class="px-6 py-4">
											<input
												type="checkbox"
												class="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
												checked={selectedCarts.includes(cart.id)}
												on:change={() => toggleCartSelection(cart.id)}
											/>
										</td>
										<td class="px-6 py-4">
											<div class="flex items-center">
												<Car class="mr-3 h-8 w-8 text-blue-400" />
												<div>
													<div class="text-sm font-medium text-white">
														{cart.serialNumber}
													</div>
													<div class="text-sm text-gray-400">
														ID: {cart.id}
													</div>
												</div>
											</div>
										</td>
										<td class="px-6 py-4">
											<div class="flex items-center text-sm text-gray-300">
												<Building2 class="mr-1 h-4 w-4 text-gray-500" />
												{cart.courseName}
												{#if !selectedCourseForList}
													<span class="ml-1 text-xs text-gray-500">({cart.courseId})</span>
												{/if}
											</div>
										</td>
										<td class="px-6 py-4 text-sm text-gray-300">
											{cart.model}
										</td>
										<td class="px-6 py-4">
											<div class="flex items-center text-sm text-gray-300">
												<MapPin class="mr-1 h-4 w-4 text-gray-500" />
												{cart.zone}
											</div>
										</td>
										<td class="px-6 py-4">
											<span
												class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {getStatusColor(
													cart.status
												)}"
											>
												{cart.status}
											</span>
										</td>
										<td class="px-6 py-4">
											<div class="flex items-center">
												<Battery class="mr-1 h-4 w-4 {getBatteryColor(cart.batteryLevel)}" />
												<span class="text-sm font-medium {getBatteryColor(cart.batteryLevel)}">
													{cart.batteryLevel}%
												</span>
											</div>
										</td>
										<td class="px-6 py-4">
											<div class="flex space-x-2">
												<button class="rounded p-1 text-blue-400 hover:bg-blue-900">
													<Edit class="h-4 w-4" />
												</button>
												<button class="rounded p-1 text-red-400 hover:bg-red-900">
													<Trash2 class="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}

		<!-- 카트 등록 탭 -->
		{#if activeTab === 'register'}
			<div class="space-y-6">
				<!-- 골프장 선택 -->
				<div class="rounded-lg bg-gray-800 p-6 shadow-sm">
					<div class="mb-4 flex items-center">
						<Building2 class="mr-2 h-6 w-6 text-blue-400" />
						<h3 class="text-lg font-semibold text-white">골프장 선택</h3>
					</div>
					<p class="mb-6 text-gray-400">카트를 등록할 골프장을 먼저 선택해주세요</p>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each golfCourses as course}
							<button
								on:click={() => (selectedCourse = course)}
								class="rounded-lg border-2 p-4 text-left transition-all {selectedCourse?.id ===
								course.id
									? 'border-blue-500 bg-blue-900'
									: 'border-gray-600 bg-gray-700 hover:bg-gray-600'}"
							>
								<h4 class="font-semibold text-white">{course.name}</h4>
								<p class="text-sm text-gray-400">{course.holes}홀 / {course.zones.length}개 구역</p>
								<div class="mt-2 text-xs text-gray-500">
									홀: {course.zones.filter((z) => z.type === 'hole').length}개 | 시설: {course.zones.filter(
										(z) => z.type === 'facility'
									).length}개 | 서비스: {course.zones.filter((z) => z.type === 'service').length}개
								</div>
							</button>
						{/each}
					</div>

					<!-- 선택된 골프장 정보 -->
					{#if selectedCourse}
						<div class="mt-6 rounded-lg bg-blue-900 p-4">
							<h4 class="font-semibold text-blue-300">선택됨: {selectedCourse.name}</h4>
							<p class="text-sm text-blue-400">
								{selectedCourse.holes}홀 코스 / 총 {selectedCourse.zones.length}개 배치 구역
							</p>
						</div>
					{/if}
				</div>

				<!-- 등록 방식 선택 (골프장 선택 후에만 표시) -->
				{#if selectedCourse}
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<!-- 개별 등록 -->
						<div class="rounded-lg bg-gray-800 p-6 shadow-sm">
							<div class="mb-4 flex items-center">
								<Plus class="mr-2 h-6 w-6 text-blue-400" />
								<h3 class="text-lg font-semibold text-white">개별 등록</h3>
							</div>
							<p class="mb-4 text-gray-400">카트를 하나씩 직접 등록합니다</p>

							<form on:submit|preventDefault={handleIndividualRegister} class="space-y-4">
								<div>
									<label
										for="cart-model-select"
										class="mb-1 block text-sm font-medium text-gray-300">카트 모델</label
									>
									<select
										id="cart-model-select"
										bind:value={newCart.modelId}
										class="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
									>
										<option value="">모델 선택</option>
										{#each cartModels as model}
											<option value={model.id}>{model.name}</option>
										{/each}
									</select>
								</div>

								<div>
									<label
										for="cart-serial-number"
										class="mb-1 block text-sm font-medium text-gray-300">식별번호</label
									>
									<input
										id="cart-serial-number"
										type="text"
										bind:value={newCart.serialNumber}
										placeholder="GC-2024-001"
										class="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								<div>
									<label for="cart-zone-select" class="mb-1 block text-sm font-medium text-gray-300"
										>배치 구역</label
									>
									<select
										id="cart-zone-select"
										bind:value={newCart.zone}
										class="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
									>
										<option value="">구역 선택</option>

										{#if zonesByType.hole}
											<optgroup label="홀 구역">
												{#each zonesByType.hole as zone}
													<option value={zone.id}>{zone.name} (최대 {zone.capacity}대)</option>
												{/each}
											</optgroup>
										{/if}

										{#if zonesByType.facility}
											<optgroup label="시설 구역">
												{#each zonesByType.facility as zone}
													<option value={zone.id}>{zone.name} (최대 {zone.capacity}대)</option>
												{/each}
											</optgroup>
										{/if}

										{#if zonesByType.service}
											<optgroup label="서비스 구역">
												{#each zonesByType.service as zone}
													<option value={zone.id}>{zone.name} (최대 {zone.capacity}대)</option>
												{/each}
											</optgroup>
										{/if}
									</select>
								</div>

								<button
									type="submit"
									class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
								>
									카트 등록
								</button>
							</form>
						</div>

						<!-- 일괄 등록 -->
						<div class="rounded-lg bg-gray-800 p-6 shadow-sm">
							<div class="mb-4 flex items-center">
								<Upload class="mr-2 h-6 w-6 text-green-400" />
								<h3 class="text-lg font-semibold text-white">일괄 등록</h3>
							</div>
							<p class="mb-4 text-gray-400">엑셀 파일로 여러 카트를 한번에 등록합니다</p>

							<div class="rounded-lg border-2 border-dashed border-gray-600 p-8 text-center">
								<Upload class="mx-auto mb-4 h-12 w-12 text-gray-500" />
								<p class="mb-2 text-gray-300">엑셀 파일을 드래그하거나 클릭하여 업로드</p>
								<p class="mb-4 text-sm text-gray-500">최대 100MB (xlsx, xls 파일만 지원)</p>
								<input
									type="file"
									accept=".xlsx,.xls"
									on:change={handleFileUpload}
									class="hidden"
									id="file-upload"
								/>
								<label
									for="file-upload"
									class="inline-block cursor-pointer rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
								>
									파일 선택
								</label>
							</div>

							<div class="mt-4">
								<button
									on:click={downloadTemplate}
									class="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
								>
									<Download class="h-4 w-4" />
									<span>{selectedCourse.name} 템플릿 다운로드</span>
								</button>
							</div>
						</div>
					</div>

					<!-- 구역별 배치 현황 -->
					<div class="rounded-lg bg-gray-800 p-6 shadow-sm">
						<h3 class="mb-4 text-lg font-semibold text-white">
							구역별 배치 현황 - {selectedCourse.name}
						</h3>
						<div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
							{#each availableZones as zone}
								<div class="text-center">
									<div class="text-2xl font-bold text-blue-400">
										{getCartCountByZone(zone.id)}/{zone.capacity}
									</div>
									<div class="text-sm text-gray-400">{zone.name}</div>
									<div class="text-xs text-gray-500 capitalize">{zone.type}</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- 등록 진행 상황 -->
					<div class="rounded-lg bg-gray-800 p-6 shadow-sm">
						<h3 class="mb-4 text-lg font-semibold text-white">등록 진행 상황</h3>
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<span class="text-sm text-gray-400">전체 진행률</span>
								<span class="text-sm font-medium text-white"
									>{registrationProgress.completed}/{registrationProgress.total} 완료</span
								>
							</div>
							<div class="h-2 w-full rounded-full bg-gray-700">
								<div
									class="h-2 rounded-full bg-blue-600 transition-all duration-300"
									style="width: {progressPercentage}%"
								></div>
							</div>
							<div class="grid grid-cols-3 gap-4 text-center">
								<div>
									<div class="text-2xl font-bold text-green-400">
										{registrationProgress.completed}
									</div>
									<div class="text-sm text-gray-400">성공</div>
								</div>
								<div>
									<div class="text-2xl font-bold text-red-400">{registrationProgress.failed}</div>
									<div class="text-sm text-gray-400">실패</div>
								</div>
								<div>
									<div class="text-2xl font-bold text-gray-400">{registrationProgress.pending}</div>
									<div class="text-sm text-gray-400">대기</div>
								</div>
							</div>
						</div>
					</div>
				{:else}
					<!-- 골프장 미선택 시 안내 -->
					<div
						class="rounded-lg border-2 border-dashed border-yellow-600 bg-yellow-900 p-8 text-center"
					>
						<Building2 class="mx-auto mb-4 h-12 w-12 text-yellow-400" />
						<h3 class="mb-2 text-lg font-semibold text-yellow-300">골프장을 먼저 선택해주세요</h3>
						<p class="text-yellow-400">카트 등록을 위해서는 먼저 골프장을 선택해야 합니다.</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- 모델 관리 탭 -->
		{#if activeTab === 'models'}
			<div class="space-y-6">
				<div class="rounded-lg bg-gray-800 p-6 shadow-sm">
					<div class="mb-6 flex items-center justify-between">
						<h3 class="text-lg font-semibold text-white">카트 모델 관리</h3>
						<button
							class="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
						>
							<Plus class="h-4 w-4" />
							<span>모델 추가</span>
						</button>
					</div>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each cartModels as model (model.id)}
							<div
								class="bg-gray-750 rounded-lg border border-gray-700 p-4 transition-all hover:bg-gray-700 hover:shadow-lg"
							>
								<div class="mb-3 flex items-center justify-between">
									<h4 class="font-semibold text-white">{model.name}</h4>
									<div class="flex space-x-1">
										<button class="rounded p-1 text-blue-400 hover:bg-blue-900">
											<Edit class="h-4 w-4" />
										</button>
										<button class="rounded p-1 text-red-400 hover:bg-red-900">
											<Trash2 class="h-4 w-4" />
										</button>
									</div>
								</div>

								<div class="space-y-2 text-sm">
									<div class="flex items-center">
										<Users class="mr-2 h-4 w-4 text-gray-500" />
										<span class="text-gray-300">정원: {model.capacity}명</span>
									</div>
									<div class="flex items-center">
										<Battery class="mr-2 h-4 w-4 text-gray-500" />
										<span class="text-gray-300">{model.batteryType}</span>
									</div>
									<div class="flex items-center">
										<span class="mr-2 text-gray-500">⚡</span>
										<span class="text-gray-300">최고속도: {model.maxSpeed}km/h</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
