<script lang="ts">
	import { Plus, Edit, Map } from 'lucide-svelte';
	import mockCourses from '$lib/mock/courses.json';
	import CourseModal from '$lib/components/course/CourseModal.svelte';

	interface Course {
		courseId: string;
		courseName: string;
		golfCourseId: string;
		golfCourseName: string;
		holeCount: number;
		difficulty: '초급' | '중급' | '고급';
		hasMap: boolean;
	}

	let courses: Course[] = mockCourses;
	let showModal = false;
	let modalMode: 'create' | 'edit' = 'create';
	let selectedCourse: Course | null = null;

	// 골프장별로 코스 그룹화
	$: groupedCourses = courses.reduce((acc, course) => {
		if (!acc[course.golfCourseName]) {
			acc[course.golfCourseName] = [];
		}
		acc[course.golfCourseName].push(course);
		return acc;
	}, {} as Record<string, Course[]>);

	function handleCreate() {
		modalMode = 'create';
		selectedCourse = null;
		showModal = true;
	}
	function handleEdit(course: Course) {
		modalMode = 'edit';
		selectedCourse = course;
		showModal = true;
	}
	function handleMapEdit(course: Course) {
		alert(`${course.courseName} 맵 편집 기능 구현 예정`);
	}
	function handleModalSave(event: CustomEvent) {
		const { mode, data } = event.detail;
		if (mode === 'create') {
			courses = [...courses, { ...data, golfCourseName: '새 골프장', hasMap: false }]; // 임시 데이터
		} else {
			courses = courses.map(c => c.courseId === data.courseId ? { ...c, ...data } : c);
		}
		showModal = false;
	}
</script>

<svelte:head>
	<title>코스 관리 - 골프카트 관제 시스템</title>
</svelte:head>

<div class="space-y-6 p-6">
	<!-- 헤더 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="mb-1 text-2xl font-bold">코스 관리</h1>
			<p class="text-gray-600">골프장별 코스를 관리하고 맵을 연결합니다.</p>
		</div>
		<button on:click={handleCreate} class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
			<Plus class="h-4 w-4" />
			새 코스 등록
		</button>
	</div>

	<!-- 코스 카드 뷰 -->
	<div class="space-y-8">
		{#each Object.entries(groupedCourses) as [golfCourseName, courseList]}
			<div class="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
				<h2 class="mb-4 text-xl font-semibold dark:text-white">{golfCourseName}</h2>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{#each courseList as course (course.courseId)}
						<div class="flex flex-col rounded-lg border p-4 text-center dark:border-gray-600">
							<h3 class="text-lg font-bold dark:text-white">{course.courseName}</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400">{course.holeCount}홀, {course.difficulty}</p>
							<div class="my-4 flex items-center justify-center gap-2 {course.hasMap ? 'text-green-500' : 'text-red-500'}">
								<Map class="h-5 w-5" />
								<span>맵: {course.hasMap ? '있음' : '없음'}</span>
							</div>
							<div class="mt-auto flex justify-center gap-2">
								<button on:click={() => handleEdit(course)} class="btn-secondary text-sm">수정</button>
								<button on:click={() => handleMapEdit(course)} class="btn-secondary text-sm">맵 편집</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

{#if showModal}
	<CourseModal {modalMode} {selectedCourse} on:save={handleModalSave} on:close={() => showModal = false} />
{/if}
