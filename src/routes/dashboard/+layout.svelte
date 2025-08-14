<script lang="ts">
	import { page } from '$app/stores';
	import Header from '../../lib/components/layout/Header.svelte';
	import Sidebar from '../../lib/components/layout/Sidebar.svelte';

	// 사이드바 열림/닫힘 상태
	let sidebarOpen = true;

	// 현재 사용자 정보 (임시 - 나중에 실제 데이터로 교체)
	let user = {
		name: '관리자',
		email: 'admin@dy.com',
		role: '시스템 관리자'
	};
	console.log('$page.url.pathname', $page.url.pathname);
	// 사이드바 토글 함수
	const toggleSidebar = () => {
		sidebarOpen = !sidebarOpen;
	};
</script>

<div class="flex h-screen bg-gray-50 dark:bg-gray-900">
	<!-- 사이드바 -->

	<!-- 메인 영역 -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- 헤더 -->
		<Header {user} on:toggleSidebar={toggleSidebar} />
		<div class="flex flex-1 overflow-hidden">
			<Sidebar bind:isOpen={sidebarOpen} />
			<!-- 컨텐츠 영역 -->
			<main class="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
				<slot />
			</main>
		</div>
	</div>
</div>
