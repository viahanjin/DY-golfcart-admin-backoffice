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

	function handleBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			handleClose();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		document.body.style.overflow = 'hidden';
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
		document.body.style.overflow = '';
	});

	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl',
		'3xl': 'max-w-3xl',
	};
</script>

<div
	on:click={handleClose}
	on:keydown={handleBackdropKeydown}
	role="button"
	tabindex="-1"
	class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
>
	<div
		on:click|stopPropagation
		class="max-h-[90vh] w-full {sizeClasses[size]} flex flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- Header -->
		<div class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-4 sm:p-6 dark:border-gray-700">
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
				<slot name="title">Modal Title</slot>
			</h2>
			<button
				on:click={handleClose}
				class="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
				aria-label="Close modal"
			>
				<X class="h-5 w-5" />
			</button>
		</div>

		<!-- Body -->
		<div class="overflow-y-auto p-4 sm:p-6">
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
