<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { AlertTriangle, X } from 'lucide-svelte';

	export let title: string;
	export let message: string;
	export let confirmText = '확인';
	export let cancelText = '취소';
	export let danger = false;

	const dispatch = createEventDispatcher();

	function handleConfirm() {
		dispatch('confirm');
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<!-- 다이얼로그 배경 -->
<div 
	class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 p-4 backdrop-blur-sm"
	style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;"
>
	<!-- 다이얼로그 창 -->
	<div class="w-full max-w-md rounded-xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-gray-800 dark:ring-white/20">
		<!-- 다이얼로그 헤더 -->
		<div class="flex items-center gap-3 p-6 pb-4">
			{#if danger}
				<div class="rounded-full bg-red-100 p-2 dark:bg-red-900/50">
					<AlertTriangle class="h-6 w-6 text-red-600 dark:text-red-400" />
				</div>
			{/if}
			<div class="flex-1">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
					{title}
				</h3>
			</div>
		</div>

		<!-- 다이얼로그 내용 -->
		<div class="px-6 pb-4">
			<p class="text-gray-600 dark:text-gray-300">
				{message}
			</p>
		</div>

		<!-- 다이얼로그 푸터 -->
		<div
			class="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700"
		>
			<button
				on:click={handleCancel}
				class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			>
				{cancelText}
			</button>
			<button
				on:click={handleConfirm}
				class="px-4 py-2 {danger
					? 'bg-red-600 hover:bg-red-700'
					: 'bg-blue-600 hover:bg-blue-700'} rounded-lg text-white transition-colors"
			>
				{confirmText}
			</button>
		</div>
	</div>
</div>
