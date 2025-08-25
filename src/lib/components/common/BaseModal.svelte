<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { X } from 'lucide-svelte';

	export let size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' = '2xl';

	const dispatch = createEventDispatcher();

	function handleClose() {
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		// 스크롤 방지
		document.body.style.overflow = 'hidden';
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
		// 스크롤 복원
		document.body.style.overflow = '';
	});

	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl',
		'3xl': 'max-w-3xl',
		'popup': 'max-w-md',
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	on:click={handleClose}
	class="fixed inset-0 z-[9999] bg-black bg-opacity-60 transition-opacity duration-300"
	style="backdrop-filter: blur(4px);"
>
	<!-- 팝업 컨테이너 -->
	<div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 w-full max-w-[90vw] max-h-[90vh]">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			on:click|stopPropagation
			class="w-full {sizeClasses[size]} max-h-full flex flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800 transform transition-all duration-300 scale-100 border border-gray-200 dark:border-gray-600"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			style="animation: modalSlideIn 0.3s ease-out;"
		>
		<!-- Header -->
		<div class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-4 sm:p-6 dark:border-gray-700">
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
				<slot name="title">Modal Title</slot>
			</h2>
			<button
				on:click={handleClose}
				class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
				aria-label="Close modal"
			>
				<X class="h-5 w-5" />
			</button>
		</div>

			<!-- Body -->
			<div class="flex-1 overflow-y-auto p-4 sm:p-6">
				<slot />
			</div>

			<!-- Footer -->
			{#if $$slots.footer}
				<div class="flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	/* 부드러운 전환 효과 */
	:global(.modal-backdrop) {
		backdrop-filter: blur(4px);
		transition: backdrop-filter 0.3s ease-out;
	}

	/* 모바일 반응형 */
	@media (max-width: 640px) {
		.modal-container {
			padding: 1rem;
			max-width: 95vw;
			max-height: 85vh;
		}
	}
</style>
