<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Building2,
		Car,
		DollarSign,
		AlertTriangle,
		TrendingUp,
		Clock,
		Wrench,
		MapPin,
		Activity,
		Radio,
		Eye
	} from 'lucide-svelte';
	
	// Component Imports
	import GolfCourseModal from '$lib/components/golf/GolfCourseModal.svelte';
	
	// Store Imports
	import { golfCourseStore } from '$lib/stores/golf-course.store';

	// 제조사 관점의 비즈니스 데이터
	let businessStats = {
		totalClients: 23,
		activeClients: 21,
		totalCarts: 1247,
		activeCarts: 1205,
		monthlyRevenue: 185000000, // 18.5억
		pendingMaintenanceRequests: 5,
		newLeads: 3,
		systemUptime: 96.8
	};

	// 최근 고객사 현황 (실제 데이터에서 가져옴)
	$: recentClients = golfCourseData && golfCourseData.items ? 
		golfCourseData.items.slice(0, 4).map((client: any) => ({
			name: client.courseName,
			carts: client.totalCarts || 0,
			holes: client.operation?.totalHoles || 18,
			status: client.status,
			statusText: client.status === 'active' ? '정상 운영' : 
						client.status === 'maintenance' ? '정비 중' : '영업 진행'
		})) : [
			{ name: '서울 컨트리클럽', carts: 85, holes: 36, status: 'active', statusText: '정상 운영' },
			{ name: '부산 레이크사이드CC', carts: 63, holes: 18, status: 'maintenance', statusText: '정비 중' },
			{ name: '제주 오션뷰 골프장', carts: 42, holes: 18, status: 'active', statusText: '정상 운영' },
			{ name: '경기 파인밸리CC', carts: 0, holes: 36, status: 'pending', statusText: '영업 진행' }
		];

	// A/S 요청 현황
	let maintenanceRequests = [
		{ type: '배터리 교체 요청', client: '서울CC', count: 3, priority: 'high', status: '대기 중' },
		{ type: 'GPS 모듈 점검', client: '부산CC', count: 1, priority: 'medium', status: '처리 중' },
		{ type: '정기 점검', client: '제주CC', count: 42, priority: 'low', status: '예약됨' }
	];

	// 실시간 시간 표시
	let currentTime = new Date().toLocaleString('ko-KR');

	// 퍼센티지 계산 (필요시 사용)
	// $: clientActiveRate = Math.round((businessStats.activeClients / businessStats.totalClients) * 100);
	// $: cartActiveRate = Math.round((businessStats.activeCarts / businessStats.totalCarts) * 100);

	// 매출 포맷팅
	function formatRevenue(amount: number) {
		if (amount >= 100000000) {
			return `₩${(amount / 100000000).toFixed(1)}억`;
		}
		return `₩${(amount / 10000).toFixed(0)}만`;
	}

	// Store state
	let golfCourseData: any = null;
	
	// Store subscriptions  
	const unsubscribeGolfCourse = golfCourseStore.subscribe(value => {
		golfCourseData = value;
		
		// 실제 데이터로 비즈니스 통계 업데이트
		if (value && value.items) {
			businessStats.totalClients = value.total || value.items.length;
			businessStats.activeClients = value.items.filter((c: any) => c.status === 'active').length;
			businessStats.totalCarts = value.items.reduce((sum: number, c: any) => sum + (c.totalCarts || 0), 0);
		}
	});

	// 1초마다 시간 업데이트
	onMount(() => {
		// 실제 데이터 로드
		golfCourseStore.loadGolfCourses();
		
		const interval = setInterval(() => {
			currentTime = new Date().toLocaleString('ko-KR');
		}, 1000);

		return () => {
			clearInterval(interval);
			unsubscribeGolfCourse();
		};
	});

	// Modal state
	let showClientModal = false;
	let modalMode: 'create' | 'edit' | 'view' = 'create';

	// 빠른 액션 함수들
	function navigateToClients() {
		window.location.href = '/dashboard/clients';
	}

	function navigateToCarts() {
		window.location.href = '/dashboard/carts';
	}

	function navigateToMaintenance() {
		window.location.href = '/dashboard/maintenance';
	}

	function handleCreateClient() {
		modalMode = 'create';
		showClientModal = true;
	}

	async function handleClientModalSave(event: CustomEvent) {
		const { data } = event.detail;
		
		try {
			// 실제 고객사(골프장) 생성 API 호출
			const success = await golfCourseStore.createGolfCourse(data);
			
			if (success) {
				// 성공 시 모달 닫기
				showClientModal = false;
				
				// 성공 메시지 표시
				alert('새 고객사가 성공적으로 등록되었습니다!');
				
				// 통계 업데이트 (실제로는 store에서 자동으로 업데이트)
				businessStats.totalClients += 1;
				businessStats.activeClients += 1;
			} else {
				alert('고객사 등록 중 오류가 발생했습니다.');
			}
		} catch (error) {
			console.error('고객사 등록 실패:', error);
			alert('고객사 등록 중 오류가 발생했습니다.');
		}
	}

	function getStatusClass(status: string) {
		switch (status) {
			case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
			case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
			case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
		}
	}

	function getPriorityClass(priority: string) {
		switch (priority) {
			case 'high': return 'text-red-600 dark:text-red-400';
			case 'medium': return 'text-yellow-600 dark:text-yellow-400'; 
			case 'low': return 'text-green-600 dark:text-green-400';
			default: return 'text-gray-600 dark:text-gray-400';
		}
	}
</script>

<svelte:head>
	<title>비즈니스 대시보드 - DY Golf Systems</title>
</svelte:head>

<!-- 대시보드 메인 -->
<div class="space-y-6 p-6">
	<!-- 알림 -->
	{#if businessStats.pendingMaintenanceRequests > 0}
		<div class="rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
			<div class="flex items-center">
				<AlertTriangle class="h-5 w-5 text-amber-600 dark:text-amber-400" />
				<div class="ml-3">
					<p class="text-sm text-amber-800 dark:text-amber-300">
						<strong>A/S 요청 대기 중:</strong> 서울CC에서 카트 3대 배터리 교체 요청이 있습니다.
					</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- 헤더 섹션 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">DY Golf Systems 비즈니스 대시보드</h1>
			<p class="text-gray-600 dark:text-gray-400">고객사 현황, 납품 카트 모니터링 및 매출 분석</p>
		</div>

		<div class="flex items-center gap-4">
			<!-- 새 고객사 등록 버튼 -->
			<button 
				on:click={handleCreateClient}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
			>
				<Building2 class="h-4 w-4" />
				새 고객사 등록
			</button>
			
			<!-- 실시간 시간 표시 -->
			<div class="text-right">
				<div class="mb-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
					<Clock class="h-4 w-4" />
					마지막 업데이트
				</div>
				<div class="font-mono text-lg text-gray-900 dark:text-white">
					{currentTime}
				</div>
			</div>
		</div>
	</div>

	<!-- 주요 비즈니스 지표 -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<!-- 총 고객사 -->
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow">
			<div class="mb-4 flex items-center justify-between">
				<div class="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/50">
					<Building2 class="h-6 w-6 text-blue-600 dark:text-blue-400" />
				</div>
				<div class="text-right">
					<div class="text-2xl font-bold text-gray-900 dark:text-white">
						{businessStats.totalClients}
					</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">개사</div>
				</div>
			</div>
			<div>
				<h3 class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">활성 고객사</h3>
				<div class="flex items-center gap-2">
					<Activity class="h-4 w-4 text-green-500" />
					<span class="text-xs text-green-600 dark:text-green-400">+2 이번 달</span>
				</div>
			</div>
		</div>

		<!-- 총 납품 카트 -->
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow">
			<div class="mb-4 flex items-center justify-between">
				<div class="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/50">
					<Car class="h-6 w-6 text-purple-600 dark:text-purple-400" />
				</div>
				<div class="text-right">
					<div class="text-2xl font-bold text-gray-900 dark:text-white">
						{businessStats.totalCarts.toLocaleString()}
					</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">대</div>
				</div>
			</div>
			<div>
				<h3 class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">총 납품 카트</h3>
				<div class="flex items-center gap-2">
					<TrendingUp class="h-4 w-4 text-purple-500" />
					<span class="text-xs text-purple-600 dark:text-purple-400">+45 이번 달</span>
				</div>
			</div>
		</div>

		<!-- 시스템 가동률 -->
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow">
			<div class="mb-4 flex items-center justify-between">
				<div class="rounded-lg bg-green-100 p-3 dark:bg-green-900/50">
					<Radio class="h-6 w-6 text-green-600 dark:text-green-400" />
				</div>
				<div class="text-right">
					<div class="text-2xl font-bold text-green-600 dark:text-green-400">
						{businessStats.systemUptime}%
					</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">가동률</div>
				</div>
			</div>
			<div>
				<h3 class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">시스템 가동률</h3>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Activity class="h-4 w-4 text-green-500" />
						<span class="text-xs text-green-600 dark:text-green-400">+0.3% 지난주 대비</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 이번 분기 매출 -->
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow">
			<div class="mb-4 flex items-center justify-between">
				<div class="rounded-lg bg-green-100 p-3 dark:bg-green-900/50">
					<DollarSign class="h-6 w-6 text-green-600 dark:text-green-400" />
				</div>
				<div class="text-right">
					<div class="text-2xl font-bold text-gray-900 dark:text-white">
						{formatRevenue(businessStats.monthlyRevenue)}
					</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">분기 매출</div>
				</div>
			</div>
			<div>
				<h3 class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">이번 분기 매출</h3>
				<div class="flex items-center gap-2">
					<TrendingUp class="h-4 w-4 text-green-500" />
					<span class="text-xs text-green-600 dark:text-green-400">+12% 전분기 대비</span>
				</div>
			</div>
		</div>
	</div>

	<!-- 고객사 및 A/S 현황 -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- 주요 고객사 현황 -->
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">주요 고객사 현황</h2>
				<button on:click={navigateToClients} class="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
					<Eye class="h-4 w-4" />
					전체보기
				</button>
			</div>
			
			<div class="space-y-3">
				{#each recentClients as client}
					<button type="button" class="w-full flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors text-left dark:border-gray-700 dark:hover:bg-gray-700/50" on:click={() => navigateToClients()}>
						<div>
							<div class="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">{client.name}</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">
								카트 {client.carts}대 • {client.holes}홀
							</div>
						</div>
						<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusClass(client.status)}">
							{client.statusText}
						</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- A/S 요청 현황 -->
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">A/S 요청 현황</h2>
				<button on:click={navigateToMaintenance} class="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
					<Wrench class="h-4 w-4" />
					관리하기
				</button>
			</div>
			
			<div class="space-y-3">
				{#each maintenanceRequests as request}
					<button type="button" class="w-full flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors text-left dark:border-gray-700 dark:hover:bg-gray-700/50" on:click={() => navigateToMaintenance()}>
						<div>
							<div class="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">{request.type}</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">
								{request.client} • {request.count}대 • 
								<span class={getPriorityClass(request.priority)}>
									{request.priority === 'high' ? '긴급' : request.priority === 'medium' ? '일반' : '예정'}
								</span>
							</div>
						</div>
						<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusClass(request.status === '대기 중' ? 'maintenance' : request.status === '처리 중' ? 'pending' : 'active')}">
							{request.status}
						</span>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- 빠른 액션 -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
		<button on:click={handleCreateClient} class="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-900/20">
			<div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
				<Building2 class="h-6 w-6 text-blue-600 dark:text-blue-400" />
			</div>
			<p class="text-sm font-medium text-gray-900 dark:text-white">신규 고객사<br>등록</p>
		</button>
		
		<button on:click={navigateToCarts} class="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-green-400 hover:bg-green-50 cursor-pointer transition-colors dark:border-gray-600 dark:hover:border-green-500 dark:hover:bg-green-900/20">
			<div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
				<Car class="h-6 w-6 text-green-600 dark:text-green-400" />
			</div>
			<p class="text-sm font-medium text-gray-900 dark:text-white">카트<br>납품 등록</p>
		</button>
		
		<div class="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-colors dark:border-gray-600 dark:hover:border-purple-500 dark:hover:bg-purple-900/20">
			<div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
				<MapPin class="h-6 w-6 text-purple-600 dark:text-purple-400" />
			</div>
			<p class="text-sm font-medium text-gray-900 dark:text-white">맵 데이터<br>업데이트</p>
		</div>
		
		<button on:click={navigateToMaintenance} class="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-yellow-400 hover:bg-yellow-50 cursor-pointer transition-colors dark:border-gray-600 dark:hover:border-yellow-500 dark:hover:bg-yellow-900/20">
			<div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
				<Wrench class="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
			</div>
			<p class="text-sm font-medium text-gray-900 dark:text-white">A/S 요청<br>처리</p>
		</button>
		
		<div class="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-colors dark:border-gray-600 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20">
			<div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
				<TrendingUp class="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
			</div>
			<p class="text-sm font-medium text-gray-900 dark:text-white">매출 분석<br>보고서</p>
		</div>
	</div>
</div>

<!-- 고객사 등록 모달 -->
{#if showClientModal}
	<GolfCourseModal
		{modalMode}
		selectedCourse={null}
		on:close={() => (showClientModal = false)}
		on:save={handleClientModalSave}
	/>
{/if}

<style>
	/* 숫자 애니메이션 효과 */
	.text-2xl,
	.text-3xl {
		font-variant-numeric: tabular-nums;
	}

	/* 모션 민감 사용자를 위한 설정 */
	@media (prefers-reduced-motion: reduce) {
		.transition-all {
			transition: none;
		}
	}
</style>
