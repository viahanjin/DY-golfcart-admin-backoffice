<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GoogleMap from '$lib/components/map/GoogleMap.svelte';
	import {
		Radio,
		Car,
		Activity,
		AlertCircle,
		Battery,
		Wifi,
		Navigation,
		RefreshCw,
		MapPin,
		Gauge
	} from 'lucide-svelte';

	// 실시간 카트 데이터 (실제로는 WebSocket이나 API에서 받아옴)
	let carts = [
		{
			id: 'CART-001',
			position: { lat: 37.5665, lng: 126.978 },
			title: 'CART-001',
			status: 'active',
			speed: 15,
			battery: 85,
			driver: '홍길동',
			course: '서울 컨트리클럽',
			info: '정상 운행중'
		},
		{
			id: 'CART-002',
			position: { lat: 37.5705, lng: 126.982 },
			title: 'CART-002',
			status: 'idle',
			speed: 0,
			battery: 92,
			driver: '김철수',
			course: '서울 컨트리클럽',
			info: '대기중'
		},
		{
			id: 'CART-003',
			position: { lat: 37.5625, lng: 126.974 },
			title: 'CART-003',
			status: 'warning',
			speed: 5,
			battery: 25,
			driver: '이영희',
			course: '서울 컨트리클럽',
			info: '배터리 부족'
		},
		{
			id: 'CART-004',
			position: { lat: 37.5685, lng: 126.985 },
			title: 'CART-004',
			status: 'active',
			speed: 18,
			battery: 67,
			driver: '박민수',
			course: '부산 오션뷰',
			info: '정상 운행중'
		},
		{
			id: 'CART-005',
			position: { lat: 37.5645, lng: 126.971 },
			title: 'CART-005',
			status: 'maintenance',
			speed: 0,
			battery: 45,
			driver: '-',
			course: '서울 컨트리클럽',
			info: '정비중'
		}
	];

	// 선택된 카트
	let selectedCart: (typeof carts)[0] | null = null;

	// 지도 중심 및 줌 레벨
	let mapCenter = { lat: 37.5665, lng: 126.978 };
	let mapZoom = 14;

	// 자동 새로고침
	let autoRefresh = true;
	let refreshInterval: ReturnType<typeof setInterval>;

	// 통계 데이터
	$: stats = {
		total: carts.length,
		active: carts.filter((c) => c.status === 'active').length,
		idle: carts.filter((c) => c.status === 'idle').length,
		warning: carts.filter((c) => c.status === 'warning').length,
		maintenance: carts.filter((c) => c.status === 'maintenance').length
	};

	// 마커 데이터 변환
	$: mapMarkers = carts.map((cart) => ({
		id: cart.id,
		position: cart.position,
		title: cart.title,
		info: `${cart.info} | 배터리: ${cart.battery}% | 속도: ${cart.speed}km/h`,
		icon: getCartIcon(cart.status)
	}));

	function getCartIcon(status: string) {
		// 실제로는 SVG 아이콘 경로를 반환
		switch (status) {
			case 'active':
				return '/cart-active.svg';
			case 'idle':
				return '/cart-idle.svg';
			case 'warning':
				return '/cart-warning.svg';
			case 'maintenance':
				return '/cart-maintenance.svg';
			default:
				return '/cart-default.svg';
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'active':
				return 'text-green-600 bg-green-100';
			case 'idle':
				return 'text-blue-600 bg-blue-100';
			case 'warning':
				return 'text-yellow-600 bg-yellow-100';
			case 'maintenance':
				return 'text-red-600 bg-red-100';
			default:
				return 'text-gray-600 bg-gray-100';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'active':
				return '운행중';
			case 'idle':
				return '대기중';
			case 'warning':
				return '경고';
			case 'maintenance':
				return '정비중';
			default:
				return '알 수 없음';
		}
	}

	function selectCart(cart: (typeof carts)[0]) {
		selectedCart = cart;
		mapCenter = cart.position;
		mapZoom = 16;
	}

	function refreshData() {
		// 실제로는 API 호출하여 데이터 새로고침
		console.log('데이터 새로고침...');
		// 여기서 WebSocket 연결이나 API 호출
	}

	onMount(() => {
		if (autoRefresh) {
			refreshInterval = setInterval(refreshData, 5000); // 5초마다 새로고침
		}
	});

	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
	});
</script>

<svelte:head>
	<title>실시간 모니터링 - 골프카트 관제 시스템</title>
</svelte:head>

<div class="flex h-full flex-col p-6">
	<!-- 헤더 -->
	<div class="mb-4 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">실시간 카트 모니터링</h1>
			<p class="text-sm text-gray-600 dark:text-gray-400">
				납품된 카트의 실시간 위치 및 상태를 모니터링합니다
			</p>
		</div>
		<div class="flex items-center gap-2">
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={autoRefresh} class="rounded border-gray-300" />
				<span class="text-sm text-gray-700 dark:text-gray-300">자동 새로고침</span>
			</label>
			<button
				on:click={refreshData}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				<RefreshCw class="h-4 w-4" />
				새로고침
			</button>
		</div>
	</div>

	<!-- 통계 카드 -->
	<div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-600 dark:text-gray-400">전체 카트</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
				</div>
				<Car class="h-8 w-8 text-gray-400" />
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-600 dark:text-gray-400">운행중</p>
					<p class="text-2xl font-bold text-green-600">{stats.active}</p>
				</div>
				<Navigation class="h-8 w-8 text-green-600" />
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-600 dark:text-gray-400">대기중</p>
					<p class="text-2xl font-bold text-blue-600">{stats.idle}</p>
				</div>
				<Radio class="h-8 w-8 text-blue-600" />
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-600 dark:text-gray-400">경고</p>
					<p class="text-2xl font-bold text-yellow-600">{stats.warning}</p>
				</div>
				<AlertCircle class="h-8 w-8 text-yellow-600" />
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-600 dark:text-gray-400">정비중</p>
					<p class="text-2xl font-bold text-red-600">{stats.maintenance}</p>
				</div>
				<Activity class="h-8 w-8 text-red-600" />
			</div>
		</div>
	</div>

	<!-- 메인 콘텐츠 -->
	<div class="flex flex-1 gap-4 overflow-hidden">
		<!-- 지도 영역 -->
		<div class="flex-1 rounded-lg bg-white shadow dark:bg-gray-800">
			<GoogleMap
				center={mapCenter}
				zoom={mapZoom}
				height="100%"
				markers={mapMarkers}
				showTraffic={true}
			/>
		</div>

		<!-- 카트 목록 -->
		<div class="w-96 overflow-y-auto rounded-lg bg-white shadow dark:bg-gray-800">
			<div class="border-b border-gray-200 p-4 dark:border-gray-700">
				<h2 class="font-semibold text-gray-900 dark:text-white">카트 목록</h2>
			</div>
			<div class="divide-y divide-gray-200 dark:divide-gray-700">
				{#each carts as cart}
					<button
						on:click={() => selectCart(cart)}
						class="w-full p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 {selectedCart?.id ===
						cart.id
							? 'bg-blue-50 dark:bg-blue-900/20'
							: ''}"
					>
						<div class="flex items-start justify-between">
							<div>
								<div class="flex items-center gap-2">
									<h3 class="font-medium text-gray-900 dark:text-white">{cart.id}</h3>
									<span class="rounded-full px-2 py-1 text-xs {getStatusColor(cart.status)}">
										{getStatusText(cart.status)}
									</span>
								</div>
								<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
									{cart.course} | {cart.driver}
								</p>
							</div>
							<div class="text-right">
								<div class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
									<Battery class="h-4 w-4" />
									<span class={cart.battery < 30 ? 'text-red-600' : ''}>{cart.battery}%</span>
								</div>
								<div class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
									<Gauge class="h-4 w-4" />
									<span>{cart.speed} km/h</span>
								</div>
							</div>
						</div>
						{#if selectedCart?.id === cart.id}
							<div class="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
								<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
									<MapPin class="h-4 w-4" />
									<span
										>위도: {cart.position.lat.toFixed(4)}, 경도: {cart.position.lng.toFixed(
											4
										)}</span
									>
								</div>
								<div class="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
									<Wifi class="h-4 w-4" />
									<span>네트워크: 양호</span>
								</div>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
