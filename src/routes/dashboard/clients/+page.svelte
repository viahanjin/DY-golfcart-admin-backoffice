<script lang="ts">
	import { onMount } from 'svelte';
	import { Package, Users, UserCheck, UserX } from 'lucide-svelte';

	// 임시 데이터 (실제로는 API에서 가져올 데이터)
	let clients = [
		{
			id: 1,
			name: '대구 골프컨트리클럽',
			status: 'active',
			carts: 45,
			lastActive: '2024-01-15',
			contactPerson: '김골프',
			phone: '053-123-4567'
		},
		{
			id: 2,
			name: '부산 그린골프장',
			status: 'active',
			carts: 32,
			lastActive: '2024-01-14',
			contactPerson: '이그린',
			phone: '051-987-6543'
		},
		{
			id: 3,
			name: '서울 프리미엄골프',
			status: 'inactive',
			carts: 28,
			lastActive: '2024-01-10',
			contactPerson: '박프리',
			phone: '02-555-1234'
		}
	];

	let totalClients = clients.length;
	let activeClients = clients.filter(c => c.status === 'active').length;
	let inactiveClients = clients.filter(c => c.status === 'inactive').length;
	let totalCarts = clients.reduce((sum, c) => sum + c.carts, 0);

	onMount(() => {
		console.log('고객 관리 페이지가 로드되었습니다.');
	});

	function getStatusBadge(status: string) {
		return status === 'active' 
			? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
			: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
	}

	function getStatusText(status: string) {
		return status === 'active' ? '활성' : '비활성';
	}
</script>

<svelte:head>
	<title>고객 관리 - 골프카트 관제 시스템</title>
	<meta name="description" content="골프장 고객 관리 및 현황" />
</svelte:head>

<div class="p-4 md:p-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">고객 관리</h1>
		<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
			골프장 고객 현황 및 관리를 위한 페이지입니다.
		</p>
	</div>

	<!-- 통계 카드 -->
	<div class="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
			<div class="flex items-center">
				<Users class="h-8 w-8 text-blue-500" />
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">전체 고객</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{totalClients}</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
			<div class="flex items-center">
				<UserCheck class="h-8 w-8 text-green-500" />
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">활성 고객</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{activeClients}</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
			<div class="flex items-center">
				<UserX class="h-8 w-8 text-red-500" />
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">비활성 고객</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{inactiveClients}</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
			<div class="flex items-center">
				<Package class="h-8 w-8 text-purple-500" />
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">총 카트 수</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{totalCarts}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- 고객 목록 테이블 -->
	<div class="rounded-lg bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
		<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
			<h3 class="text-lg font-medium text-gray-900 dark:text-white">고객 목록</h3>
		</div>
		
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead class="bg-gray-50 dark:bg-gray-700">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
							고객명
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
							담당자
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
							연락처
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
							카트 수
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
							상태
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
							마지막 활동
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
					{#each clients as client}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900 dark:text-white">
									{client.name}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500 dark:text-gray-400">
									{client.contactPerson}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500 dark:text-gray-400">
									{client.phone}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-900 dark:text-white">
									{client.carts}대
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusBadge(client.status)}">
									{getStatusText(client.status)}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
								{client.lastActive}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>