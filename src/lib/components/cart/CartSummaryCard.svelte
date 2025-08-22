<script lang="ts">
	import { Car, Package, MapPin, Wrench, Battery } from 'lucide-svelte';
	import type { Cart } from '$lib/types/cart';

	export let golfCourseId: string;
	export let golfCourseName: string;

	// Mock cart data for the golf course - in real app this would come from a service
	let carts: Cart[] = [
		{
			id: 'CART-001',
			serialNumber: 'DYC2024001',
			modelId: 'MODEL-001',
			modelName: 'DY-CART-2024',
			modelCode: 'DYC2024',
			status: 'deployed',
			golfCourseId: 'GC001',
			golfCourseName: '파인밸리 골프클럽',
			deploymentDate: '2024-03-15T10:00:00Z',
			batteryLevel: 85,
			lastSeenAt: '2024-08-22T14:30:00Z',
			maintenanceStatus: 'good',
			location: { lat: 37.4563, lng: 126.7052 },
			createdAt: '2024-01-20T09:00:00Z',
			updatedAt: '2024-08-22T14:30:00Z'
		},
		{
			id: 'CART-004',
			serialNumber: 'DYC2024004',
			modelId: 'MODEL-001',
			modelName: 'DY-CART-2024',
			modelCode: 'DYC2024',
			status: 'maintenance',
			golfCourseId: 'GC001',
			golfCourseName: '파인밸리 골프클럽',
			deploymentDate: '2024-04-01T08:00:00Z',
			batteryLevel: 0,
			lastSeenAt: '2024-08-20T16:45:00Z',
			maintenanceStatus: 'critical',
			location: { lat: 37.4563, lng: 126.7052 },
			createdAt: '2024-01-25T09:00:00Z',
			updatedAt: '2024-08-20T16:45:00Z'
		}
	];

	// Filter carts for this golf course
	$: deployedCarts = carts.filter(cart => cart.golfCourseId === golfCourseId);
	$: totalCarts = deployedCarts.length;
	$: activeCarts = deployedCarts.filter(cart => cart.status === 'deployed').length;
	$: maintenanceCarts = deployedCarts.filter(cart => cart.status === 'maintenance').length;
	$: avgBatteryLevel = totalCarts > 0 
		? Math.round(deployedCarts.reduce((sum, cart) => sum + cart.batteryLevel, 0) / totalCarts)
		: 0;

	function getStatusColor(status: string) {
		switch (status) {
			case 'deployed': return 'text-green-600';
			case 'maintenance': return 'text-red-600';
			default: return 'text-gray-600';
		}
	}

	function getBatteryColor(level: number) {
		if (level > 70) return 'text-green-600';
		if (level > 30) return 'text-yellow-600';
		return 'text-red-600';
	}
</script>

{#if totalCarts > 0}
	<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
		<div class="flex items-center justify-between mb-3">
			<h3 class="text-sm font-medium text-gray-900 dark:text-white">배치된 카트</h3>
			<span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-400">
				총 {totalCarts}대
			</span>
		</div>

		<!-- Summary Stats -->
		<div class="grid grid-cols-2 gap-3 mb-4">
			<div class="flex items-center gap-2">
				<Car class="h-4 w-4 text-green-600" />
				<div>
					<p class="text-xs text-gray-500 dark:text-gray-400">운영 중</p>
					<p class="text-sm font-medium text-gray-900 dark:text-white">{activeCarts}대</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Wrench class="h-4 w-4 text-red-600" />
				<div>
					<p class="text-xs text-gray-500 dark:text-gray-400">정비 중</p>
					<p class="text-sm font-medium text-gray-900 dark:text-white">{maintenanceCarts}대</p>
				</div>
			</div>
		</div>

		<!-- Average Battery Level -->
		<div class="mb-4">
			<div class="flex items-center justify-between mb-1">
				<span class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
					<Battery class="h-3 w-3" />
					평균 배터리
				</span>
				<span class="text-xs font-medium {getBatteryColor(avgBatteryLevel)}">
					{avgBatteryLevel}%
				</span>
			</div>
			<div class="w-full rounded bg-gray-200 dark:bg-gray-700">
				<div 
					class="h-2 rounded bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
					style="width: {avgBatteryLevel}%"
				></div>
			</div>
		</div>

		<!-- Cart List -->
		<div class="space-y-2">
			{#each deployedCarts as cart}
				<div class="flex items-center justify-between rounded-md border border-gray-100 p-2 dark:border-gray-700">
					<div class="flex items-center gap-2">
						<span class="text-xs font-medium text-gray-900 dark:text-white">
							{cart.serialNumber}
						</span>
						<span class="text-xs text-gray-500 dark:text-gray-400">
							({cart.modelCode})
						</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-xs {getBatteryColor(cart.batteryLevel)}">
							{cart.batteryLevel}%
						</span>
						<span class="text-xs {getStatusColor(cart.status)}">
							{cart.status === 'deployed' ? '운영' : '정비'}
						</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
		<Package class="mx-auto h-8 w-8 text-gray-400 mb-2" />
		<p class="text-sm text-gray-500 dark:text-gray-400">배치된 카트가 없습니다</p>
	</div>
{/if}