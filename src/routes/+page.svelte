<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// 페이지 로드 시 바로 로그인 화면으로 이동
	onMount(() => {
		goto('/login', { replaceState: true });
	});
</script>

<!-- 로딩 중 임시 화면 -->
<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"
>
	<div class="text-center">
		<div
			class="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
		></div>
		<p class="text-gray-400">골프카트 관제 시스템 로딩 중...</p>
	</div>
</div>
