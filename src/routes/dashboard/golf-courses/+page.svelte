<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Plus,
		Search,
		Filter,
		MapPin,
		Edit,
		Trash2,
		Eye,
		MoreVertical,
		Car,
		Clock,
		Activity,
		Download,
		RefreshCw,
		AlertCircle,
		Loader2,
		CheckSquare,
		Square,
		X
	} from 'lucide-svelte';
	import GolfCourseModal from '@/lib/components/golf/GolfCourseModal.svelte';
	import ConfirmDialog from '@/lib/components/ui/ConfirmDialog.svelte';
	import { golfCourseStore, isLoading, errorMessage, selectedCount, hasResults } from '$lib/stores/golf-course.store';
	import { golfCourseService } from '$lib/services/golf-course.service';
	import type { GolfCourse } from '$lib/types/golf-course';
	
	// Store 구독
	let loading = false;
	let error: string | null = null;
	let selectedItemsCount = 0;
	
	const unsubscribeLoading = isLoading.subscribe(value => loading = value);
	const unsubscribeError = errorMessage.subscribe(value => error = value);
	const unsubscribeSelected = selectedCount.subscribe(value => selectedItemsCount = value);
	
	// 모달 상태
	let showModal = false;
	let modalMode: 'create' | 'edit' | 'view' = 'create';
	let selectedCourse: GolfCourse | null = null;

	// 삭제 확인 다이얼로그
	let showDeleteDialog = false;
	let courseToDelete: GolfCourse | null = null;
	let showBulkDeleteDialog = false;

	// 검색 디바운스
	let searchTimer: ReturnType<typeof setTimeout>;
	let searchInput = '';

	// 컴포넌트 마운트 시 데이터 로드
	onMount(async () => {
		await golfCourseStore.loadGolfCourses();
	});

	// 컴포넌트 언마운트 시 정리
	onDestroy(() => {
		unsubscribeLoading();
		unsubscribeError();
		unsubscribeSelected();
		if (searchTimer) clearTimeout(searchTimer);
	});

	// 검색 처리 (디바운스 적용)
	function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		searchInput = target.value;
		
		if (searchTimer) clearTimeout(searchTimer);
		
		searchTimer = setTimeout(() => {
			golfCourseStore.search(searchInput);
		}, 300);
	}

	// 필터 변경
	function handleFilterChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		golfCourseStore.changeFilter(target.value as any);
	}

	// 정렬 변경
	function handleSort(field: string) {
		golfCourseStore.changeSort(field);
	}

	// 새로고침
	async function handleRefresh() {
		await golfCourseStore.loadGolfCourses();
	}

	// 엑셀 내보내기
	async function handleExport() {
		const response = await golfCourseService.exportToExcel({
			search: $golfCourseStore.searchQuery,
			status: $golfCourseStore.selectedStatus,
			sortBy: $golfCourseStore.sortBy,
			sortOrder: $golfCourseStore.sortOrder
		});
		
		if (!response.success && response.error) {
			// 에러 토스트 표시 (나중에 토스트 컴포넌트 추가)
			console.error('Export failed:', response.error.message);
		}
	}

	// CRUD 액션들
	function handleCreate() {
		modalMode = 'create';
		selectedCourse = null;
		showModal = true;
	}

	function handleView(course: GolfCourse) {
		modalMode = 'view';
		selectedCourse = course;
		showModal = true;
	}

	function handleEdit(course: GolfCourse) {
		modalMode = 'edit';
		selectedCourse = course;
		showModal = true;
	}

	function handleDelete(course: GolfCourse) {
		courseToDelete = course;
		showDeleteDialog = true;
	}

	function handleBulkDelete() {
		if (selectedItemsCount === 0) {
			alert('삭제할 항목을 선택해주세요.');
			return;
		}
		showBulkDeleteDialog = true;
	}

	async function confirmDelete() {
		if (courseToDelete) {
			const success = await golfCourseStore.deleteGolfCourse(courseToDelete.id);
			if (success) {
				// 성공 토스트 표시
				console.log('골프장이 삭제되었습니다.');
			}
		}
		showDeleteDialog = false;
		courseToDelete = null;
	}

	async function confirmBulkDelete() {
		const success = await golfCourseStore.bulkDelete();
		if (success) {
			// 성공 토스트 표시
			console.log('선택한 골프장들이 삭제되었습니다.');
		}
		showBulkDeleteDialog = false;
	}

	async function handleModalSave(event: CustomEvent) {
		const { mode, data } = event.detail;
		
		let success = false;
		if (mode === 'create') {
			success = await golfCourseStore.createGolfCourse(data);
		} else if (mode === 'edit' && selectedCourse) {
			success = await golfCourseStore.updateGolfCourse(selectedCourse.id, data);
		}
		
		if (success) {
			showModal = false;
			// 성공 토스트 표시
			console.log(mode === 'create' ? '골프장이 등록되었습니다.' : '골프장 정보가 수정되었습니다.');
		}
	}

	// 상태별 색상 및 텍스트
	function getStatusInfo(status: string) {
		switch (status) {
			case 'active':
				return {
					color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50',
					text: '운영중'
				};
			case 'inactive':
				return {
					color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700',
					text: '비활성'
				};
			case 'maintenance':
				return {
					color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50',
					text: '정비중'
				};
			default:
				return { color: 'text-gray-600 bg-gray-100', text: '알 수 없음' };
		}
	}

	// 날짜 포맷팅
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// 선택 처리
	function handleSelectItem(id: string) {
		golfCourseStore.toggleSelection(id);
	}

	function handleSelectAll() {
		golfCourseStore.toggleSelectAll();
	}

	// 페이지네이션
	function handlePageChange(page: number) {
		golfCourseStore.changePage(page);
	}
</script>

<div class="p-6">
	<!-- 헤더 -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">골프장 관리</h1>
		<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">등록된 골프장을 관리하고 새로운 골프장을 추가할 수 있습니다.</p>
	</div>

	<!-- 에러 메시지 -->
	{#if error}
		<div class="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
			<div class="flex">
				<AlertCircle class="h-5 w-5 text-red-400" />
				<div class="ml-3">
					<p class="text-sm text-red-800 dark:text-red-300">{error}</p>
				</div>
				<button
					on:click={() => golfCourseStore.clearError()}
					class="ml-auto text-red-500 hover:text-red-700"
				>
					<X class="h-4 w-4" />
				</button>
			</div>
		</div>
	{/if}

	<!-- 통계 카드 -->
	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<MapPin class="h-8 w-8 text-blue-500" />
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">전체 골프장</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{$golfCourseStore.total}</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<Activity class="h-8 w-8 text-green-500" />
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">운영중</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{$golfCourseStore.items.filter(c => c.status === 'active').length}
					</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<Car class="h-8 w-8 text-purple-500" />
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">전체 카트</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{$golfCourseStore.items.reduce((sum, c) => sum + c.totalCarts, 0)}
					</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<Clock class="h-8 w-8 text-yellow-500" />
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">정비중</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{$golfCourseStore.items.filter(c => c.status === 'maintenance').length}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- 필터 및 액션 바 -->
	<div class="mb-4 flex flex-col gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-1 gap-2">
			<!-- 검색 -->
			<div class="relative flex-1 sm:max-w-xs">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					value={searchInput}
					on:input={handleSearch}
					placeholder="골프장명, 코드, 주소 검색..."
					class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<!-- 상태 필터 -->
			<select
				value={$golfCourseStore.selectedStatus}
				on:change={handleFilterChange}
				class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="all">전체 상태</option>
				<option value="active">운영중</option>
				<option value="inactive">비활성</option>
				<option value="maintenance">정비중</option>
			</select>
		</div>

		<div class="flex gap-2">
			{#if selectedItemsCount > 0}
				<button
					on:click={handleBulkDelete}
					class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				>
					<Trash2 class="h-4 w-4" />
					삭제 ({selectedItemsCount})
				</button>
			{/if}
			
			<button
				on:click={handleRefresh}
				disabled={loading}
				class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			>
				<RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
				새로고침
			</button>
			
			<button
				on:click={handleExport}
				class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			>
				<Download class="h-4 w-4" />
				엑셀
			</button>
			
			<button
				on:click={handleCreate}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				<Plus class="h-4 w-4" />
				골프장 추가
			</button>
		</div>
	</div>

	<!-- 테이블 -->
	<div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
		{#if loading && !$hasResults}
			<div class="flex h-64 items-center justify-center">
				<Loader2 class="h-8 w-8 animate-spin text-blue-500" />
			</div>
		{:else if !$hasResults}
			<div class="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
				<MapPin class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
				<p class="text-lg font-medium">등록된 골프장이 없습니다</p>
				<p class="mt-1 text-sm">새로운 골프장을 추가해주세요.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
						<tr>
							<th class="px-4 py-3 text-left">
								<button
									on:click={handleSelectAll}
									class="flex items-center gap-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
								>
									{#if $golfCourseStore.selectedItems.size === $golfCourseStore.items.length && $golfCourseStore.items.length > 0}
										<CheckSquare class="h-4 w-4" />
									{:else}
										<Square class="h-4 w-4" />
									{/if}
								</button>
							</th>
							<th class="px-4 py-3 text-left">
								<button
									on:click={() => handleSort('courseName')}
									class="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
								>
									골프장명
									{#if $golfCourseStore.sortBy === 'courseName'}
										<span class="text-xs">{$golfCourseStore.sortOrder === 'asc' ? '▲' : '▼'}</span>
									{/if}
								</button>
							</th>
							<th class="px-4 py-3 text-left">
								<button
									on:click={() => handleSort('courseCode')}
									class="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
								>
									코드
									{#if $golfCourseStore.sortBy === 'courseCode'}
										<span class="text-xs">{$golfCourseStore.sortOrder === 'asc' ? '▲' : '▼'}</span>
									{/if}
								</button>
							</th>
							<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">주소</th>
							<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">홀 수</th>
							<th class="px-4 py-3 text-left">
								<button
									on:click={() => handleSort('totalCarts')}
									class="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
								>
									카트
									{#if $golfCourseStore.sortBy === 'totalCarts'}
										<span class="text-xs">{$golfCourseStore.sortOrder === 'asc' ? '▲' : '▼'}</span>
									{/if}
								</button>
							</th>
							<th class="px-4 py-3 text-left">
								<button
									on:click={() => handleSort('status')}
									class="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
								>
									상태
									{#if $golfCourseStore.sortBy === 'status'}
										<span class="text-xs">{$golfCourseStore.sortOrder === 'asc' ? '▲' : '▼'}</span>
									{/if}
								</button>
							</th>
							<th class="px-4 py-3 text-left">
								<button
									on:click={() => handleSort('lastModified')}
									class="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
								>
									최종 수정
									{#if $golfCourseStore.sortBy === 'lastModified'}
										<span class="text-xs">{$golfCourseStore.sortOrder === 'asc' ? '▲' : '▼'}</span>
									{/if}
								</button>
							</th>
							<th class="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-200">액션</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each $golfCourseStore.items as course (course.id)}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
								<td class="px-4 py-3">
									<button
										on:click={() => handleSelectItem(course.id)}
										class="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
									>
										{#if $golfCourseStore.selectedItems.has(course.id)}
											<CheckSquare class="h-4 w-4" />
										{:else}
											<Square class="h-4 w-4" />
										{/if}
									</button>
								</td>
								<td class="px-4 py-3">
									<div>
										<p class="font-medium text-gray-900 dark:text-white">{course.courseName}</p>
										<p class="text-sm text-gray-500 dark:text-gray-400">{course.courseNameEn}</p>
									</div>
								</td>
								<td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{course.courseCode}</td>
								<td class="px-4 py-3">
									<p class="text-sm text-gray-900 dark:text-white">{course.address.address1}</p>
									{#if course.address.address2}
										<p class="text-xs text-gray-500 dark:text-gray-400">{course.address.address2}</p>
									{/if}
								</td>
								<td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{course.operation.totalHoles}홀</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-1">
										<span class="text-sm font-medium text-gray-900 dark:text-white">{course.activeCarts}</span>
										<span class="text-sm text-gray-500 dark:text-gray-400">/ {course.totalCarts}</span>
									</div>
								</td>
								<td class="px-4 py-3">
									<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusInfo(course.status).color}">
										{getStatusInfo(course.status).text}
									</span>
								</td>
								<td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
									{formatDate(course.lastModified)}
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center justify-center gap-1">
										<button
											on:click={() => handleView(course)}
											class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700"
											title="상세보기"
										>
											<Eye class="h-4 w-4" />
										</button>
										<button
											on:click={() => handleEdit(course)}
											class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-700"
											title="수정"
										>
											<Edit class="h-4 w-4" />
										</button>
										<button
											on:click={() => handleDelete(course)}
											class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700"
											title="삭제"
										>
											<Trash2 class="h-4 w-4" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- 페이지네이션 -->
			{#if $golfCourseStore.totalPages > 1}
				<div class="flex items-center justify-between border-t px-4 py-3 dark:border-gray-700">
					<div class="text-sm text-gray-700 dark:text-gray-200">
						전체 {$golfCourseStore.total}개 중 {($golfCourseStore.page - 1) * $golfCourseStore.limit + 1}-{Math.min($golfCourseStore.page * $golfCourseStore.limit, $golfCourseStore.total)}
					</div>
					<div class="flex gap-1">
						<button
							on:click={() => handlePageChange($golfCourseStore.page - 1)}
							disabled={$golfCourseStore.page === 1}
							class="rounded px-3 py-1 text-sm {$golfCourseStore.page === 1 ? 'cursor-not-allowed text-gray-400 dark:text-gray-500' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}"
						>
							이전
						</button>
						{#each Array($golfCourseStore.totalPages) as _, i}
							{#if i + 1 === 1 || i + 1 === $golfCourseStore.totalPages || (i + 1 >= $golfCourseStore.page - 2 && i + 1 <= $golfCourseStore.page + 2)}
								<button
									on:click={() => handlePageChange(i + 1)}
									class="rounded px-3 py-1 text-sm {i + 1 === $golfCourseStore.page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}"
								>
									{i + 1}
								</button>
							{:else if i + 1 === $golfCourseStore.page - 3 || i + 1 === $golfCourseStore.page + 3}
								<span class="px-2 text-gray-500 dark:text-gray-400">...</span>
							{/if}
						{/each}
						<button
							on:click={() => handlePageChange($golfCourseStore.page + 1)}
							disabled={$golfCourseStore.page === $golfCourseStore.totalPages}
							class="rounded px-3 py-1 text-sm {$golfCourseStore.page === $golfCourseStore.totalPages ? 'cursor-not-allowed text-gray-400 dark:text-gray-500' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}"
						>
							다음
						</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- 모달 -->
{#if showModal}
	<GolfCourseModal
		{modalMode}
		{selectedCourse}
		on:close={() => (showModal = false)}
		on:save={handleModalSave}
	/>
{/if}

<!-- 삭제 확인 다이얼로그 -->
{#if showDeleteDialog}
	<ConfirmDialog
		title="골프장 삭제"
		message={`정말로 "${courseToDelete?.courseName}" 골프장을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`}
		confirmText="삭제"
		danger={true}
		on:confirm={confirmDelete}
		on:cancel={() => {
			showDeleteDialog = false;
			courseToDelete = null;
		}}
	/>
{/if}

<!-- 일괄 삭제 확인 다이얼로그 -->
{#if showBulkDeleteDialog}
	<ConfirmDialog
		title="선택 항목 삭제"
		message={`선택한 ${selectedItemsCount}개의 골프장을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`}
		confirmText="모두 삭제"
		danger={true}
		on:confirm={confirmBulkDelete}
		on:cancel={() => {
			showBulkDeleteDialog = false;
		}}
	/>
{/if}