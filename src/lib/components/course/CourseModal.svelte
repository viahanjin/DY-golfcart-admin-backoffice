<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { X } from 'lucide-svelte';

	export let modalMode: 'create' | 'edit' | 'view';
	export let selectedCourse: any = null;

	const dispatch = createEventDispatcher();

	function getInitialFormData() {
		return {
			courseName: '',
			courseCode: '',
			golfCourseId: '',
			courseOrder: 1,
			holeCount: 9,
			courseType: '일반코스',
			difficulty: '중급',
			length: 0,
			avgSlope: 0
		};
	}

	let formData = getInitialFormData();
	$: isReadOnly = modalMode === 'view';

	onMount(() => {
		if (selectedCourse && (modalMode === 'edit' || modalMode === 'view')) {
			formData = JSON.parse(JSON.stringify(selectedCourse));
		}
	});

	function handleSave() {
		if (formData.courseName && formData.golfCourseId) {
			dispatch('save', { mode: modalMode, data: formData });
		} else {
			alert('코스명과 소속 골프장은 필수 항목입니다.');
		}
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
	<div class="w-full max-w-2xl rounded-lg bg-white dark:bg-gray-800">
		<div class="flex items-center justify-between border-b p-6 dark:border-gray-700">
			<h2 class="text-xl font-semibold dark:text-white">
				{modalMode === 'create' ? '새 코스 등록' : '코스 정보 수정'}
			</h2>
			<button on:click={() => dispatch('close')} class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X class="h-5 w-5" /></button>
		</div>

		<div class="space-y-6 p-6">
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold dark:text-white">코스 식별 정보</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div><label for="courseName" class="dark:text-gray-300">코스명 *</label><input id="courseName" type="text" bind:value={formData.courseName} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
					<div><label for="courseCode" class="dark:text-gray-300">코스 코드</label><input id="courseCode" type="text" bind:value={formData.courseCode} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				</div>
			</div>

			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold dark:text-white">소속 및 구성</h3>
				<div><label for="golfCourseId" class="dark:text-gray-300">소속 골프장 *</label>
					<select id="golfCourseId" bind:value={formData.golfCourseId} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
						<option value="">선택하세요</option>
						<option value="1">서울 컨트리클럽</option>
						<option value="2">부산 오션뷰 골프장</option>
					</select>
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div><label for="holeCount" class="dark:text-gray-300">홀 수</label><input id="holeCount" type="number" bind:value={formData.holeCount} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
					<div><label for="difficulty" class="dark:text-gray-300">난이도</label>
						<select id="difficulty" bind:value={formData.difficulty} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
							<option>초급</option><option>중급</option><option>고급</option>
						</select>
					</div>
				</div>
			</div>
		</div>

		<div class="flex items-center justify-end gap-3 border-t px-6 py-4 dark:border-gray-700">
			<button on:click={() => dispatch('close')} class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">취소</button>
			<button on:click={handleSave} class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400">
				{modalMode === 'create' ? '등록' : '수정'}
			</button>
		</div>
	</div>
</div>
