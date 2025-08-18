/**
 * 골프장 관리 상태 스토어
 */

import { writable, derived } from 'svelte/store';
import { golfCourseService, type GolfCourseListParams } from '$lib/services/golf-course.service';
import type { GolfCourse, GolfCourseCreateInput, GolfCourseUpdateInput } from '$lib/types/golf-course';
import type { ApiError } from '$lib/services/api.service';
import mockGolfCourses from '$lib/mock/golf-courses.json';

// 스토어 상태 타입
interface GolfCourseState {
	items: GolfCourse[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	loading: boolean;
	error: ApiError | null;
	searchQuery: string;
	selectedStatus: 'active' | 'inactive' | 'maintenance' | 'all';
	sortBy: string;
	sortOrder: 'asc' | 'desc';
	selectedItems: Set<string>;
}

// 초기 상태
const initialState: GolfCourseState = {
	items: [],
	total: 0,
	page: 1,
	limit: 20,
	totalPages: 0,
	loading: false,
	error: null,
	searchQuery: '',
	selectedStatus: 'all',
	sortBy: 'createdAt',
	sortOrder: 'desc',
	selectedItems: new Set()
};

// 메인 스토어
function createGolfCourseStore() {
	const { subscribe, set, update } = writable<GolfCourseState>(initialState);

	// 골프장 목록 로드
	async function loadGolfCourses(params?: GolfCourseListParams) {
		update(state => ({ ...state, loading: true, error: null }));

		try {
			const response = await golfCourseService.getList(params);

			if (response.success && response.data) {
				update(state => ({
					...state,
					items: response.data.items,
					total: response.data.total,
					page: response.data.page,
					limit: response.data.limit,
					totalPages: response.data.totalPages,
					loading: false
				}));
			} else {
				// API 실패시 mock 데이터 사용
				loadMockData(params);
			}
		} catch (error) {
			// 네트워크 오류 등으로 API 호출 자체가 실패한 경우 mock 데이터 사용
			console.warn('API 호출 실패, mock 데이터를 사용합니다:', error);
			loadMockData(params);
		}
	}

	// Mock 데이터 로드 함수
	function loadMockData(params?: GolfCourseListParams) {
		const currentState = get(golfCourseStore);
		let filteredItems = [...mockGolfCourses] as GolfCourse[];

		// 상태 필터링
		if (params?.status && params.status !== 'all') {
			filteredItems = filteredItems.filter(item => item.status === params.status);
		}

		// 검색 필터링
		if (params?.search) {
			const searchLower = params.search.toLowerCase();
			filteredItems = filteredItems.filter(item =>
				item.courseName.toLowerCase().includes(searchLower) ||
				item.courseCode.toLowerCase().includes(searchLower) ||
				item.address.address1.toLowerCase().includes(searchLower)
			);
		}

		// 정렬
		if (params?.sortBy) {
			filteredItems.sort((a, b) => {
				let aValue: any, bValue: any;
				
				switch (params.sortBy) {
					case 'courseName':
						aValue = a.courseName;
						bValue = b.courseName;
						break;
					case 'courseCode':
						aValue = a.courseCode;
						bValue = b.courseCode;
						break;
					case 'totalCarts':
						aValue = a.totalCarts;
						bValue = b.totalCarts;
						break;
					case 'status':
						aValue = a.status;
						bValue = b.status;
						break;
					case 'lastModified':
						aValue = new Date(a.lastModified);
						bValue = new Date(b.lastModified);
						break;
					default:
						aValue = a.createdAt;
						bValue = b.createdAt;
				}

				if (params.sortOrder === 'desc') {
					return aValue < bValue ? 1 : -1;
				}
				return aValue > bValue ? 1 : -1;
			});
		}

		// 페이지네이션
		const page = params?.page || currentState.page;
		const limit = params?.limit || currentState.limit;
		const total = filteredItems.length;
		const totalPages = Math.ceil(total / limit);
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const paginatedItems = filteredItems.slice(startIndex, endIndex);

		update(state => ({
			...state,
			items: paginatedItems,
			total,
			page,
			limit,
			totalPages,
			loading: false,
			error: {
				code: 'API_FALLBACK',
				message: 'API 서버에 연결할 수 없어 로컬 데이터를 표시합니다.'
			}
		}));
	}

	// 페이지 변경
	async function changePage(page: number) {
		update(state => ({ ...state, page }));
		
		const currentState = get(golfCourseStore);
		await loadGolfCourses({
			page,
			limit: currentState.limit,
			search: currentState.searchQuery,
			status: currentState.selectedStatus,
			sortBy: currentState.sortBy,
			sortOrder: currentState.sortOrder
		});
	}

	// 검색
	async function search(query: string) {
		update(state => ({ ...state, searchQuery: query, page: 1 }));
		
		const currentState = get(golfCourseStore);
		await loadGolfCourses({
			page: 1,
			limit: currentState.limit,
			search: query,
			status: currentState.selectedStatus,
			sortBy: currentState.sortBy,
			sortOrder: currentState.sortOrder
		});
	}

	// 필터 변경
	async function changeFilter(status: 'active' | 'inactive' | 'maintenance' | 'all') {
		update(state => ({ ...state, selectedStatus: status, page: 1 }));
		
		const currentState = get(golfCourseStore);
		await loadGolfCourses({
			page: 1,
			limit: currentState.limit,
			search: currentState.searchQuery,
			status: status,
			sortBy: currentState.sortBy,
			sortOrder: currentState.sortOrder
		});
	}

	// 정렬 변경
	async function changeSort(sortBy: string, sortOrder?: 'asc' | 'desc') {
		const currentState = get(golfCourseStore);
		const newSortOrder = sortOrder || (currentState.sortBy === sortBy && currentState.sortOrder === 'asc' ? 'desc' : 'asc');
		
		update(state => ({ ...state, sortBy, sortOrder: newSortOrder }));
		
		await loadGolfCourses({
			page: currentState.page,
			limit: currentState.limit,
			search: currentState.searchQuery,
			status: currentState.selectedStatus,
			sortBy,
			sortOrder: newSortOrder
		});
	}

	// 골프장 생성
	async function createGolfCourse(data: GolfCourseCreateInput): Promise<boolean> {
		update(state => ({ ...state, loading: true, error: null }));

		try {
			const response = await golfCourseService.create(data);

			if (response.success) {
				// 목록 새로고침
				await loadGolfCourses();
				return true;
			} else {
				update(state => ({
					...state,
					loading: false,
					error: response.error || null
				}));
				return false;
			}
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: {
					code: 'API_ERROR',
					message: 'API 서버에 연결할 수 없습니다. 네트워크를 확인해주세요.'
				}
			}));
			return false;
		}
	}

	// 골프장 수정
	async function updateGolfCourse(id: string, data: GolfCourseUpdateInput): Promise<boolean> {
		update(state => ({ ...state, loading: true, error: null }));

		try {
			const response = await golfCourseService.update(id, data);

			if (response.success) {
				// 목록 새로고침
				await loadGolfCourses();
				return true;
			} else {
				update(state => ({
					...state,
					loading: false,
					error: response.error || null
				}));
				return false;
			}
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: {
					code: 'API_ERROR',
					message: 'API 서버에 연결할 수 없습니다. 네트워크를 확인해주세요.'
				}
			}));
			return false;
		}
	}

	// 골프장 삭제
	async function deleteGolfCourse(id: string): Promise<boolean> {
		update(state => ({ ...state, loading: true, error: null }));

		try {
			const response = await golfCourseService.delete(id);

			if (response.success) {
				// 목록 새로고침
				await loadGolfCourses();
				return true;
			} else {
				update(state => ({
					...state,
					loading: false,
					error: response.error || null
				}));
				return false;
			}
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: {
					code: 'API_ERROR',
					message: 'API 서버에 연결할 수 없습니다. 네트워크를 확인해주세요.'
				}
			}));
			return false;
		}
	}

	// 일괄 삭제
	async function bulkDelete(): Promise<boolean> {
		const currentState = get(golfCourseStore);
		const ids = Array.from(currentState.selectedItems);
		
		if (ids.length === 0) {
			update(state => ({
				...state,
				error: {
					code: 'NO_SELECTION',
					message: '삭제할 항목을 선택해주세요.'
				}
			}));
			return false;
		}

		update(state => ({ ...state, loading: true, error: null }));

		try {
			const response = await golfCourseService.bulkDelete(ids);

			if (response.success) {
				// 선택 초기화 및 목록 새로고침
				update(state => ({ ...state, selectedItems: new Set() }));
				await loadGolfCourses();
				return true;
			} else {
				update(state => ({
					...state,
					loading: false,
					error: response.error || null
				}));
				return false;
			}
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: {
					code: 'API_ERROR',
					message: 'API 서버에 연결할 수 없습니다. 네트워크를 확인해주세요.'
				}
			}));
			return false;
		}
	}

	// 상태 변경
	async function updateStatus(id: string, status: 'active' | 'inactive' | 'maintenance'): Promise<boolean> {
		update(state => ({ ...state, loading: true, error: null }));

		try {
			const response = await golfCourseService.updateStatus(id, status);

			if (response.success) {
				// 목록 새로고침
				await loadGolfCourses();
				return true;
			} else {
				update(state => ({
					...state,
					loading: false,
					error: response.error || null
				}));
				return false;
			}
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: {
					code: 'API_ERROR',
					message: 'API 서버에 연결할 수 없습니다. 네트워크를 확인해주세요.'
				}
			}));
			return false;
		}
	}

	// 선택 토글
	function toggleSelection(id: string) {
		update(state => {
			const newSelectedItems = new Set(state.selectedItems);
			if (newSelectedItems.has(id)) {
				newSelectedItems.delete(id);
			} else {
				newSelectedItems.add(id);
			}
			return { ...state, selectedItems: newSelectedItems };
		});
	}

	// 전체 선택/해제
	function toggleSelectAll() {
		update(state => {
			const allIds = state.items.map(item => item.id);
			const newSelectedItems = state.selectedItems.size === allIds.length 
				? new Set<string>() 
				: new Set(allIds);
			return { ...state, selectedItems: newSelectedItems };
		});
	}

	// 에러 클리어
	function clearError() {
		update(state => ({ ...state, error: null }));
	}

	// 스토어 리셋
	function reset() {
		set(initialState);
	}

	return {
		subscribe,
		loadGolfCourses,
		changePage,
		search,
		changeFilter,
		changeSort,
		createGolfCourse,
		updateGolfCourse,
		deleteGolfCourse,
		bulkDelete,
		updateStatus,
		toggleSelection,
		toggleSelectAll,
		clearError,
		reset
	};
}

// 스토어 인스턴스
export const golfCourseStore = createGolfCourseStore();

// 헬퍼 함수 - 스토어 현재 값 가져오기
function get<T>(store: { subscribe: (fn: (value: T) => void) => () => void }): T {
	let value: T;
	store.subscribe((v) => (value = v))();
	return value!;
}

// 파생 스토어 - 로딩 상태
export const isLoading = derived(
	golfCourseStore,
	$golfCourseStore => $golfCourseStore.loading
);

// 파생 스토어 - 에러 메시지
export const errorMessage = derived(
	golfCourseStore,
	$golfCourseStore => $golfCourseStore.error?.message || null
);

// 파생 스토어 - 선택된 항목 수
export const selectedCount = derived(
	golfCourseStore,
	$golfCourseStore => $golfCourseStore.selectedItems.size
);

// 파생 스토어 - 필터링된 결과 존재 여부
export const hasResults = derived(
	golfCourseStore,
	$golfCourseStore => $golfCourseStore.items.length > 0
);