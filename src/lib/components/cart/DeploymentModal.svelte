<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import BaseModal from '$lib/components/common/BaseModal.svelte';
	import type { Cart } from '$lib/types/cart';

	export let cart: Cart | null = null;

	const dispatch = createEventDispatcher();

	// Mock golf course data - in real app this would come from a store
	const golfCourses = [
		{ id: 'GC001', name: '파인밸리 골프클럽', address: '경기도 용인시' },
		{ id: 'GC002', name: '오션뷰 골프리조트', address: '부산광역시 기장군' },
		{ id: 'GC003', name: '그린힐스 컨트리클럽', address: '강원도 춘천시' },
		{ id: 'GC004', name: '레이크사이드 골프장', address: '충청남도 천안시' },
		{ id: 'GC005', name: '마운틴뷰 골프클럽', address: '경상북도 경주시' }
	];

	let selectedGolfCourseId = '';
	let deploymentNotes = '';

	// 유효성 검사
	$: isFormValid = selectedGolfCourseId.trim() !== '';

	function handleSave() {
		if (!cart || !selectedGolfCourseId) return;

		const selectedGolfCourse = golfCourses.find(gc => gc.id === selectedGolfCourseId);
		if (!selectedGolfCourse) return;

		console.log('🚚 Deploying cart:', cart.id, 'to:', selectedGolfCourse.name);

		dispatch('save', {
			golfCourseId: selectedGolfCourseId,
			golfCourseName: selectedGolfCourse.name,
			deploymentNotes
		});
	}
</script>

<BaseModal size="lg" on:close={() => dispatch('close')}>
	<span slot="title">카트 현장 배치</span>

	<div class="space-y-6">
		{#if cart}
			<!-- 카트 정보 -->
			<div class="rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold text-gray-900 dark:text-white">배치할 카트</h3>
				<div class="mt-3 space-y-2">
					<div class="flex justify-between">
						<span class="text-sm text-gray-600 dark:text-gray-400">일련번호:</span>
						<span class="text-sm font-medium text-gray-900 dark:text-white">{cart.serialNumber}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-gray-600 dark:text-gray-400">모델명:</span>
						<span class="text-sm font-medium text-gray-900 dark:text-white">{cart.modelName}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-gray-600 dark:text-gray-400">배터리 수준:</span>
						<span class="text-sm font-medium text-gray-900 dark:text-white">{cart.batteryLevel}%</span>
					</div>
				</div>
			</div>

			<!-- 배치 정보 -->
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold text-gray-900 dark:text-white">배치 정보</h3>
				
				<div>
					<label
						for="golfCourse"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
					>
						배치할 골프장 *
					</label>
					<select
						id="golfCourse"
						bind:value={selectedGolfCourseId}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						required
					>
						<option value="">골프장을 선택하세요</option>
						{#each golfCourses as golfCourse}
							<option value={golfCourse.id}>
								{golfCourse.name} ({golfCourse.address})
							</option>
						{/each}
					</select>
				</div>

				<div>
					<label
						for="deploymentNotes"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
					>
						배치 메모
					</label>
					<textarea
						id="deploymentNotes"
						bind:value={deploymentNotes}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						rows="3"
						placeholder="배치와 관련된 특이사항을 입력하세요..."
					></textarea>
				</div>

				<!-- 배치 예정 정보 -->
				<div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
					<h4 class="text-sm font-medium text-blue-800 dark:text-blue-300">배치 예정 정보</h4>
					<div class="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
						<p>• 배치일: {new Date().toLocaleDateString('ko-KR')}</p>
						<p>• 상태 변경: 창고보관 → 현장배치</p>
						<p>• 담당자: 시스템 관리자</p>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div slot="footer">
		<button
			on:click={() => dispatch('close')}
			class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
		>
			취소
		</button>
		<button
			on:click={handleSave}
			disabled={!isFormValid}
			class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
		>
			배치 확정
		</button>
	</div>
</BaseModal>