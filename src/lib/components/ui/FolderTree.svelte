<script lang="ts">
	import { ChevronRight, ChevronDown, Folder, File } from 'lucide-svelte';
	import type { FileNode } from '$lib/utils/folder-tree';

	export let tree: FileNode[] = [];
	export let selectedFiles: File[] = [];
	export let depth: number = 0;

	function getFileIcon(fileName: string) {
		const ext = fileName.split('.').pop()?.toLowerCase();
		switch (ext) {
			case 'json':
				return '📄';
			case 'png':
			case 'jpg':
			case 'jpeg':
			case 'gif':
				return '🖼️';
			case 'txt':
			case 'md':
				return '📝';
			default:
				return '📄';
		}
	}

	function formatFileSize(bytes?: number): string {
		if (!bytes) return '';
		if (bytes < 1024) return `${bytes}B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
	}

	function toggleFolder(node: FileNode) {
		node.expanded = !node.expanded;
		tree = [...tree]; // 반응성 트리거
	}

	function getFileFromSelectedFiles(path: string): File | undefined {
		return selectedFiles.find((file) => file.webkitRelativePath === path);
	}

	function isJsonFile(fileName: string): boolean {
		return fileName.toLowerCase().endsWith('.json');
	}
</script>

<div class="text-sm">
	{#each tree as node}
		<div style="margin-left: {depth * 20}px;">
			{#if node.type === 'folder'}
				<button
					class="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-gray-800 transition-colors duration-200 hover:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-700"
					on:click={() => toggleFolder(node)}
				>
					<span class="flex items-center gap-1">
						{#if node.expanded}
							<ChevronDown class="h-4 w-4 text-black dark:text-black" />
						{:else}
							<ChevronRight class="h-4 w-4 text-black dark:text-black" />
						{/if}
						<Folder class="h-4 w-4 text-blue-600 dark:text-blue-400" />
					</span>
					<span class="font-medium text-gray-800 dark:text-gray-100">{node.name}</span>
					{#if node.children}
						<span class="ml-auto text-xs text-gray-500 dark:text-gray-400"
							>({node.children.length} 항목)</span
						>
					{/if}
				</button>

				{#if node.expanded && node.children}
					<div class="mt-1">
						<svelte:self tree={node.children} {selectedFiles} depth={depth + 1} />
					</div>
				{/if}
			{:else}
				<div class="flex items-center gap-2 px-2 py-1 text-black dark:text-black">
					<span class="relative flex items-center gap-1 text-gray-500 dark:text-gray-400">
						<File class="h-4 w-4" />
						<span class="text-xs">{getFileIcon(node.name)}</span>
					</span>
					<span class="text-sm text-black dark:text-black">{node.name}</span>
					<span class="ml-auto text-xs text-gray-500 dark:text-gray-400"
						>{formatFileSize(node.size)}</span
					>
					{#if isJsonFile(node.name)}
						<span
							class="rounded bg-blue-200 px-1 text-xs text-blue-800 dark:bg-blue-800 dark:text-blue-200"
							>JSON</span
						>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>
