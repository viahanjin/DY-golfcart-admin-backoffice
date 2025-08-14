<script lang="ts">
	import { onMount } from 'svelte';
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
		Users,
		Activity
	} from 'lucide-svelte';
	import GolfCourseModal from '@/lib/components/golf/GolfCourseModal.svelte';
	import ConfirmDialog from '@/lib/components/ui/ConfirmDialog.svelte';
	import mockGolfCourses from '$lib/mock/golf-courses.json';

	// 골프장 데이터 타입
	interface GolfCourse {
		id:string;
		// 기본 정보
		courseName: string; // 기존: courseName -> 한글명으로 사용
		courseNameEn: string;
		courseCode: string;
		address: {
			zipcode: string;
			address1: string;
			address2: string;
		};
		contact: {
			phone: string;
			fax?: string;
			email: string;
		};

		// 위치 정보
		location: {
			latitude: number;
			longitude: number;
			altitude?: number;
			coordinateSystem: 'WGS84' | 'UTM-K';
			rtk?: {
				baseLatitude: number;
				baseLongitude: number;
				provider: string;
			};
		};

		// 운영 정보
		operation: {
			totalHoles: 9 | 18 | 27 | 36;
			operatingHours: {
				summer: string;
				winter: string;
			};
			closedDays: string;
			cartPolicy: {
				fairwayAccess: boolean;
				rainPolicy: string;
				maxSpeed: number; // km/h
			};
		};

		// 지형 및 환경 정보
		environment: {
			terrain: ('flat' | 'hilly' | 'mountainous')[];
			gpsShadedAreas: {
				count: number;
				locations: string; // 예: "3번홀 티박스, 7번홀 그린 주변"
			};
			specialNotes: string;
		};

		// 기존 필드 유지 (일부는 operation으로 이동)
		totalCarts: number;
		activeCarts: number;
		status: 'active' | 'inactive' | 'maintenance';
		lastModified: string;
		createdAt: string;
	}

	// 임시 데이터 (실제로는 API에서 가져올 데이터)
	let golfCourses: GolfCourse[] = mockGolfCourses;

	// 상태 관리
	let searchQuery = '';
	let selectedStatus = 'all';
	let sortBy = 'lastModified';
	let sortOrder: 'asc' | 'desc' = 'desc';

	// 모달 상태
	let showModal = false;
	let modalMode: 'create' | 'edit' | 'view' = 'create';
	let selectedCourse: GolfCourse | null = null;

	// 삭제 확인 다이얼로그
	let showDeleteDialog = false;
	let courseToDelete: GolfCourse | null = null;

	// 필터링된 골프장 목록
	$: filteredCourses = golfCourses
		.filter((course) => {
			const matchesSearch =
				(course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
					course.courseNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
					course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
					course.address.address1.toLowerCase().includes(searchQuery.toLowerCase()));

			const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;

			return matchesSearch && matchesStatus;
		})
		.sort((a, b) => {
			const aValue = a[sortBy as keyof GolfCourse];
			const bValue = b[sortBy as keyof GolfCourse];

			if (sortOrder === 'asc') {
				return aValue < bValue ? -1 : 1;
			} else {
				return aValue > bValue ? -1 : 1;
			}
		});

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

	function confirmDelete() {
		if (courseToDelete) {
			// TODO: 서버 API를 호출하여 골프장을 삭제해야 합니다.
			// 임시로 클라이언트에서만 데이터를 업데이트합니다.
			golfCourses = golfCourses.filter((c) => c.id !== courseToDelete?.id);
			console.log('골프장 삭제됨:', courseToDelete.courseName);
		}
		showDeleteDialog = false;
		courseToDelete = null;
	}

	function handleModalSave(event: CustomEvent) {
		const { mode, data } = event.detail;

		// TODO: 서버 API를 호출하여 골프장을 생성하거나 수정해야 합니다.
		// 임시로 클라이언트에서만 데이터를 업데이트합니다.
		if (mode === 'create') {
			// 새 골프장 추가
			const newCourse: GolfCourse = {
				...data,
				id: Date.now().toString(),
				createdAt: new Date().toISOString(),
				lastModified: new Date().toISOString()
			};
			golfCourses = [...golfCourses, newCourse];
			console.log('새 골프장 추가됨:', newCourse);
		} else if (mode === 'edit') {
			// 기존 골프장 수정
			golfCourses = golfCourses.map((course) =>
				course.id === data.id ? { ...data, lastModified: new Date().toISOString() } : course
			);
			console.log('골프장 수정됨:', data);
		}

		showModal = false;
	}

	// 통계 계산
	$: totalCourses = golfCourses.length;
	$: activeCourses = golfCourses.filter((c) => c.status === 'active').length;
	$: totalCartsAll = golfCourses.reduce((sum, c) => sum + c.totalCarts, 0);
	$: activeCartsAll = golfCourses.reduce((sum, c) => sum + c.activeCarts, 0);
</script>

<svelte:head>
	<title>골프장 관리 - 골프카트 관제 시스템</title>
</svelte:head>

<!-- 골프장 관리 메인 -->
<div class="space-y-6 p-6">
	<!-- 헤더 섹션 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">골프장 관리</h1>
			<p class="text-gray-600 dark:text-gray-400">등록된 골프장의 정보를 관리하고 모니터링합니다</p>
		</div>

		<!-- 새 골프장 등록 버튼 -->
		<button
			on:click={handleCreate}
			class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
		>
			<Plus class="h-4 w-4" />
			새 골프장 등록
		</button>
	</div>

	<!-- 통계 요약 카드 -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-4">
		<div
			class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/50">
					<MapPin class="h-5 w-5 text-blue-600 dark:text-blue-400" />
				</div>
				<div>
					<div class="text-xl font-bold text-gray-900 dark:text-white">{totalCourses}</div>
					<div class="text-sm text-gray-600 dark:text-gray-400">총 골프장</div>
				</div>
			</div>
		</div>

		<div
			class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/50">
					<Activity class="h-5 w-5 text-green-600 dark:text-green-400" />
				</div>
				<div>
					<div class="text-xl font-bold text-green-600 dark:text-green-400">{activeCourses}</div>
					<div class="text-sm text-gray-600 dark:text-gray-400">운영중</div>
				</div>
			</div>
		</div>

		<div
			class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/50">
					<Car class="h-5 w-5 text-purple-600 dark:text-purple-400" />
				</div>
				<div>
					<div class="text-xl font-bold text-gray-900 dark:text-white">{totalCartsAll}</div>
					<div class="text-sm text-gray-600 dark:text-gray-400">총 카트</div>
				</div>
			</div>
		</div>

		<div
			class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/50">
					<Users class="h-5 w-5 text-orange-600 dark:text-orange-400" />
				</div>
				<div>
					<div class="text-xl font-bold text-orange-600 dark:text-orange-400">{activeCartsAll}</div>
					<div class="text-sm text-gray-600 dark:text-gray-400">운행중 카트</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 검색 및 필터 -->
	<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
		<div class="flex flex-col items-center gap-4 md:flex-row">
			<!-- 검색 -->
			<div class="relative flex-1">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
				<input
					type="text"
					placeholder="골프장명, 코드, 지역으로 검색..."
					bind:value={searchQuery}
					class="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<!-- 상태 필터 -->
			<div class="flex items-center gap-2">
				<Filter class="h-4 w-4 text-gray-400" />
				<select
					bind:value={selectedStatus}
					class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					<option value="all">전체 상태</option>
					<option value="active">운영중</option>
					<option value="inactive">비활성</option>
					<option value="maintenance">정비중</option>
				</select>
			</div>

			<!-- 정렬 -->
			<div class="flex items-center gap-2">
				<select
					bind:value={sortBy}
					class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					<option value="lastModified">최근 수정순</option>
					<option value="courseName">이름순</option>
					<option value="createdAt">등록순</option>
					<option value="totalCarts">카트 수순</option>
				</select>

				<button
					on:click={() => (sortOrder = sortOrder === 'asc' ? 'desc' : 'asc')}
					class="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
				>
					{sortOrder === 'asc' ? '↑' : '↓'}
				</button>
			</div>
		</div>
	</div>

	<!-- 골프장 목록 테이블 -->
	<div
		class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
	>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50 dark:bg-gray-700">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">골프장 정보</th>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">주소</th>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">운영 정보</th>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">상태</th>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">최근 수정</th>
						<th class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">작업</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
					{#each filteredCourses as course (course.id)}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
							<!-- 골프장 정보 -->
							<td class="px-6 py-4">
								<div>
									<div class="text-sm font-medium text-gray-900 dark:text-white">{course.courseName}</div>
									<div class="text-sm text-gray-500 dark:text-gray-400">{course.courseCode}</div>
								</div>
							</td>

							<!-- 주소 -->
							<td class="px-6 py-4">
								<div class="text-sm text-gray-900 dark:text-white">{course.address.address1}</div>
								<div class="text-sm text-gray-500 dark:text-gray-400">{course.address.zipcode}</div>
							</td>

							<!-- 운영 정보 -->
							<td class="px-6 py-4">
								<div class="text-sm text-gray-900 dark:text-white">{course.operation.totalHoles}홀</div>
								<div class="text-sm text-gray-500 dark:text-gray-400">카트 {course.activeCarts}/{course.totalCarts}</div>
							</td>

							<!-- 상태 -->
							<td class="px-6 py-4">
								<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusInfo(course.status).color}">
									{getStatusInfo(course.status).text}
								</span>
							</td>

							<!-- 최근 수정 -->
							<td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
								{formatDate(course.lastModified)}
							</td>

							<!-- 작업 버튼들 -->
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<button on:click={() => handleView(course)} title="상세보기" class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
										<Eye class="h-4 w-4" />
									</button>
									<button on:click={() => handleEdit(course)} title="수정" class="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400">
										<Edit class="h-4 w-4" />
									</button>
									<button on:click={() => handleDelete(course)} title="삭제" class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
										<Trash2 class="h-4 w-4" />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<!-- 데이터가 없을 때 -->
			{#if filteredCourses.length === 0}
				<div class="py-12 text-center">
					<MapPin class="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">골프장이 없습니다</h3>
					<p class="mb-4 text-gray-500 dark:text-gray-400">
						{searchQuery || selectedStatus !== 'all'
							? '검색 조건에 맞는 골프장이 없습니다.'
							: '첫 번째 골프장을 등록해보세요.'}
					</p>
					{#if !searchQuery && selectedStatus === 'all'}
						<button
							on:click={handleCreate}
							class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							<Plus class="h-4 w-4" />
							골프장 등록
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- 골프장 등록/수정 모달 -->
{#if showModal}
	<GolfCourseModal
		{modalMode}
		{selectedCourse}
		on:save={handleModalSave}
		on:close={() => (showModal = false)}
	/>
{/if}

<!-- 삭제 확인 다이얼로그 -->
{#if showDeleteDialog && courseToDelete}
	<ConfirmDialog
		title="골프장 삭제"
		message="'{courseToDelete.courseName}' 골프장을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
		confirmText="삭제"
		cancelText="취소"
		danger={true}
		on:confirm={confirmDelete}
		on:cancel={() => {
			showDeleteDialog = false;
			courseToDelete = null;
		}}
	/>
{/if}
