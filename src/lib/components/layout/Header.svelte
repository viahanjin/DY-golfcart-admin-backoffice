<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';
	import { Menu, Bell, Settings, User, LogOut, ChevronDown } from 'lucide-svelte';
	import myLogo from '$lib/assets/logo.svg';

	export let user: {
		name: string;
		email: string;
		role: string;
	};

	const dispatch = createEventDispatcher();

	// 상태 관리
	let currentTime = new Date().toLocaleTimeString('ko-KR');
	let showUserMenu = false;
	let notificationCount = 0; // 실제로는 API에서 가져올 데이터

	// 시간 업데이트
	setInterval(() => {
		currentTime = new Date().toLocaleTimeString('ko-KR');
	}, 1000);

	// 사이드바 토글
	const handleToggleSidebar = () => {
		dispatch('toggleSidebar');
	};

	// 로그아웃
	const handleLogout = () => {
		goto('/login');
	};

	// 사용자 메뉴 토글
	const toggleUserMenu = () => {
		showUserMenu = !showUserMenu;
	};

	// 외부 클릭 시 메뉴 닫기
	const handleClickOutside = (event: MouseEvent) => {
		const target = event.target;
		if (showUserMenu && (!(target instanceof Element) || !target.closest('.user-menu'))) {
			showUserMenu = false;
		}
	};
</script>

<svelte:window on:click={handleClickOutside} />

<header
	class="border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<div class="flex items-center justify-between">
		<!-- 좌측: 메뉴 토글 + 로고 + 제목 -->
		<div class="flex items-center gap-4">
			<!-- 사이드바 토글 버튼 -->
			<button
				on:click={handleToggleSidebar}
				class="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
				aria-label="메뉴 토글"
			>
				<Menu class="h-5 w-5 text-gray-600 dark:text-gray-300" />
			</button>

			<!-- 로고 -->
			<div class="flex items-center gap-3">
				<div class="bg-gradient-to- flex h-11 w-11 items-center justify-center rounded-lg">
					<img src={myLogo} alt="회사 로고" class="h-25 w-24" />
				</div>
				<div>
					<h1 class="text-lg font-semibold text-gray-900 dark:text-white">골프카트 관제 시스템</h1>
				</div>
			</div>
		</div>

		<!-- 우측: 시간 + 알림 + 사용자 메뉴 -->
		<div class="flex items-center gap-4">
			<!-- 현재 시간 -->
			<div class="hidden font-mono text-sm text-gray-600 md:block dark:text-gray-300">
				{currentTime}
			</div>

			<!-- 알림 버튼 -->
			<button
				class="relative rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
				aria-label="알림"
			>
				<Bell class="h-5 w-5 text-gray-600 dark:text-gray-300" />
				{#if notificationCount > 0}
					<span
						class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
					>
						{notificationCount > 9 ? '9+' : notificationCount}
					</span>
				{/if}
			</button>
			<!-- 사용자 메뉴 -->
			<div class="user-menu relative">
				<button
					on:click={toggleUserMenu}
					class="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					<!-- 아바타 -->
					<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
						<span class="text-sm font-medium text-white">
							{user.name.charAt(0)}
						</span>
					</div>
					<!-- 사용자 정보 (데스크톱에서만) -->
					<div class="hidden text-left md:block">
						<div class="text-sm font-medium text-gray-900 dark:text-white">
							{user.name}
						</div>
						<div class="text-xs text-gray-500 dark:text-gray-400">
							{user.role}
						</div>
					</div>
					<ChevronDown class="h-4 w-4 text-gray-500 dark:text-gray-400" />
				</button>

				<!-- 드롭다운 메뉴 -->
				{#if showUserMenu}
					<div
						class="absolute top-full right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
					>
						<!-- 사용자 정보 헤더 -->
						<div class="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
							<div class="text-sm font-medium text-gray-900 dark:text-white">
								{user.name}
							</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">
								{user.email}
							</div>
						</div>

						<!-- 메뉴 항목들 -->
						<div class="py-1">
							<button
								class="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
							>
								<User class="h-4 w-4" />
								프로필 설정
							</button>
							<button
								class="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
							>
								<Settings class="h-4 w-4" />
								시스템 설정
							</button>
							<hr class="my-1 border-gray-200 dark:border-gray-700" />
							<button
								on:click={handleLogout}
								class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
							>
								<LogOut class="h-4 w-4" />
								로그아웃
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>
