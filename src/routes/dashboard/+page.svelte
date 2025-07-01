<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Car,
		Activity,
		Power,
		PowerOff,
		TrendingUp,
		Clock,
		MapPin,
		AlertTriangle
	} from 'lucide-svelte';

	// 임시 데이터 (추후 API로 교체)
	let stats = {
		totalCarts: 45,
		activeCarts: 32,
		inactiveCarts: 13,
		maintenanceCarts: 3,
		batteryLow: 2,
		emergencyAlerts: 0
	};

	// 실시간 시간 표시
	let currentTime = new Date().toLocaleString('ko-KR');

	// 카트 상태별 퍼센티지 계산
	$: activePercentage = Math.round((stats.activeCarts / stats.totalCarts) * 100);
	$: inactivePercentage = Math.round((stats.inactiveCarts / stats.totalCarts) * 100);

	// 1초마다 시간 업데이트
	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date().toLocaleString('ko-KR');
		}, 1000);

		// 실제 환경에서는 실시간 데이터 구독
		// const unsubscribe = subscribeToCartData((newStats) => {
		//     stats = newStats;
		// });

		return () => {
			clearInterval(interval);
			// unsubscribe?.();
		};
	});
</script>

// src/routes/dashboard/+page.svelte
<svelte:head>
	<title>대시보드 - 골프카트 관제 시스템</title>
</svelte:head>

<!-- 대시보드 메인 -->
<div class="space-y-6 p-6">
	<!-- 헤더 섹션 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">골프카트 관제 대시보드</h1>
			<p class="text-gray-600 dark:text-gray-400">실시간 카트 상태 모니터링 및 운영 현황</p>
		</div>

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

	<!-- 주요 통계 카드들 -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<!-- 총 판매(등록) 카트 -->
		<div
			class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="mb-4 flex items-center justify-between">
				<div class="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/50">
					<Car class="h-6 w-6 text-blue-600 dark:text-blue-400" />
				</div>
				<div class="text-right">
					<div class="text-2xl font-bold text-gray-900 dark:text-white">
						{stats.totalCarts}
					</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">대</div>
				</div>
			</div>
			<div>
				<h3 class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">총 등록 카트</h3>
				<div class="flex items-center gap-2">
					<TrendingUp class="h-4 w-4 text-green-500" />
					<span class="text-xs text-green-600 dark:text-green-400"> 전체 운영 대수 </span>
				</div>
			</div>
		</div>

		<!-- 활성화된 카트 -->
		<div
			class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="mb-4 flex items-center justify-between">
				<div class="rounded-lg bg-green-100 p-3 dark:bg-green-900/50">
					<Activity class="h-6 w-6 text-green-600 dark:text-green-400" />
				</div>
				<div class="text-right">
					<div class="text-2xl font-bold text-green-600 dark:text-green-400">
						{stats.activeCarts}
					</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">대</div>
				</div>
			</div>
			<div>
				<h3 class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">운행 중 카트</h3>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Power class="h-4 w-4 text-green-500" />
						<span class="text-xs text-green-600 dark:text-green-400">
							{activePercentage}% 가동률
						</span>
					</div>
					<!-- 간단한 프로그래스 바 -->
					<div class="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
						<div
							class="h-full bg-green-500 transition-all duration-300"
							style="width: {activePercentage}%"
						></div>
					</div>
				</div>
			</div>
		</div>

		<!-- 비활성화된 카트 -->
		<div
			class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="mb-4 flex items-center justify-between">
				<div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
					<PowerOff class="h-6 w-6 text-gray-600 dark:text-gray-400" />
				</div>
				<div class="text-right">
					<div class="text-2xl font-bold text-gray-600 dark:text-gray-400">
						{stats.inactiveCarts}
					</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">대</div>
				</div>
			</div>
			<div>
				<h3 class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">대기 중 카트</h3>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<MapPin class="h-4 w-4 text-gray-500" />
						<span class="text-xs text-gray-600 dark:text-gray-400"> 보관소 대기 </span>
					</div>
					<span class="text-xs text-gray-500 dark:text-gray-400">
						{inactivePercentage}%
					</span>
				</div>
			</div>
		</div>

		<!-- 정비/알림 상태 -->
		<div
			class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="mb-4 flex items-center justify-between">
				<div class="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/50">
					<AlertTriangle class="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
				</div>
				<div class="text-right">
					<div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
						{stats.maintenanceCarts}
					</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">대</div>
				</div>
			</div>
			<div>
				<h3 class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">정비 필요</h3>
				<div class="space-y-1">
					<div class="flex items-center justify-between text-xs">
						<span class="text-orange-600 dark:text-orange-400">정기 정비</span>
						<span class="text-gray-500">{stats.maintenanceCarts - stats.batteryLow}대</span>
					</div>
					<div class="flex items-center justify-between text-xs">
						<span class="text-red-600 dark:text-red-400">배터리 부족</span>
						<span class="text-gray-500">{stats.batteryLow}대</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 시스템 상태 요약 -->
	<div
		class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
	>
		<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">시스템 운영 상태</h2>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- 운영 현황 -->
			<div class="text-center">
				<div class="mb-2 text-3xl font-bold text-green-600 dark:text-green-400">
					{activePercentage}%
				</div>
				<div class="text-sm text-gray-600 dark:text-gray-400">전체 가동률</div>
			</div>

			<!-- 응급 상황 -->
			<div class="text-center">
				<div
					class="text-3xl font-bold {stats.emergencyAlerts > 0
						? 'text-red-600 dark:text-red-400'
						: 'text-gray-400'} mb-2"
				>
					{stats.emergencyAlerts}
				</div>
				<div class="text-sm text-gray-600 dark:text-gray-400">응급 알림</div>
			</div>

			<!-- 평균 배터리 -->
			<div class="text-center">
				<div class="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">85%</div>
				<div class="text-sm text-gray-600 dark:text-gray-400">평균 배터리</div>
			</div>
		</div>
	</div>

	<!-- 추후 확장 예정 영역 -->
	<div
		class="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-600 dark:bg-gray-800/50"
	>
		<div class="text-center">
			<div class="mb-4 text-4xl">📈</div>
			<h3 class="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">추가 기능 개발 예정</h3>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				실시간 지도, 상세 분석, 알림 히스토리 등의 기능이 이곳에 추가될 예정입니다.
			</p>
		</div>
	</div>
</div>

<style>
	/* 카드 호버 효과 */
	.bg-white:hover,
	.dark .bg-gray-800:hover {
		transform: translateY(-2px);
		box-shadow:
			0 10px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	/* 애니메이션 */
	.bg-white,
	.bg-gray-800 {
		transition: all 0.2s ease-in-out;
	}

	/* 숫자 애니메이션 효과 */
	.text-2xl,
	.text-3xl {
		font-variant-numeric: tabular-nums;
	}

	/* 모션 민감 사용자를 위한 설정 */
	@media (prefers-reduced-motion: reduce) {
		.bg-white:hover,
		.dark .bg-gray-800:hover {
			transform: none;
		}

		.transition-all {
			transition: none;
		}
	}
</style>
