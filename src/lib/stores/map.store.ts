import { writable, derived } from 'svelte/store';
import { mapService, type Map, type MapCreateInput, type MapUpdateInput, type MapListParams } from '$lib/services/map.service';

interface MapState {
	items: Map[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	loading: boolean;
	error: { code: string; message: string } | null;
	searchQuery: string;
	selectedType: '2D' | '3D' | 'SATELLITE' | 'all';
	selectedGolfCourseId: string | null;
	sortBy: string;
	sortOrder: 'asc' | 'desc';
	selectedItems: Set<string>;
}

const initialState: MapState = {
	items: [],
	total: 0,
	page: 1,
	limit: 20,
	totalPages: 0,
	loading: false,
	error: null,
	searchQuery: '',
	selectedType: 'all',
	selectedGolfCourseId: null,
	sortBy: 'createdAt',
	sortOrder: 'desc',
	selectedItems: new Set()
};

function createMapStore() {
	const { subscribe, set, update } = writable<MapState>(initialState);

	async function loadMaps(params: MapListParams = {}) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			const response = await mapService.getList({
				page: params.page || 1,
				limit: params.limit || 20,
				search: params.search || '',
				type: params.type || undefined,
				golfCourseId: params.golfCourseId,
				sortBy: params.sortBy || 'createdAt',
				sortOrder: params.sortOrder || 'desc'
			});

			if (response.success && response.data) {
				update(s => ({
					...s,
					items: response.data.items,
					total: response.data.total,
					page: response.data.page,
					limit: response.data.limit,
					totalPages: response.data.totalPages,
					loading: false,
					searchQuery: params.search || '',
					selectedType: (params.type || 'all') as any,
					selectedGolfCourseId: params.golfCourseId || null,
					sortBy: params.sortBy || 'createdAt',
					sortOrder: params.sortOrder || 'desc'
				}));
			} else {
				update(s => ({
					...s,
					loading: false,
					error: response.error || { code: 'UNKNOWN', message: '알 수 없는 오류가 발생했습니다.' }
				}));
			}
		} catch (error) {
			console.error('Failed to load maps:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' }
			}));
		}
	}

	async function changePage(page: number) {
		update(s => ({ ...s, page }));
		await loadMaps({ page });
	}

	async function changeLimit(limit: number) {
		update(s => ({ ...s, limit, page: 1 }));
		await loadMaps({ limit, page: 1 });
	}

	async function setSearchQuery(query: string) {
		update(s => ({ ...s, searchQuery: query, page: 1 }));
		await loadMaps({ search: query, page: 1 });
	}

	async function setTypeFilter(type: MapState['selectedType']) {
		update(s => ({ ...s, selectedType: type, page: 1 }));
		const typeParam = type === 'all' ? undefined : type;
		await loadMaps({ type: typeParam, page: 1 });
	}

	async function setGolfCourseFilter(golfCourseId: string | null) {
		update(s => ({ ...s, selectedGolfCourseId: golfCourseId, page: 1 }));
		await loadMaps({ golfCourseId, page: 1 });
	}

	async function setSorting(sortBy: string, sortOrder: 'asc' | 'desc') {
		update(s => ({ ...s, sortBy, sortOrder, page: 1 }));
		await loadMaps({ sortBy, sortOrder, page: 1 });
	}

	function selectItem(id: string) {
		update(s => ({
			...s,
			selectedItems: new Set(s.selectedItems).add(id)
		}));
	}

	function deselectItem(id: string) {
		update(s => {
			const newSet = new Set(s.selectedItems);
			newSet.delete(id);
			return { ...s, selectedItems: newSet };
		});
	}

	function selectAll() {
		update(s => ({
			...s,
			selectedItems: new Set(s.items.map(item => item.id))
		}));
	}

	function deselectAll() {
		update(s => ({
			...s,
			selectedItems: new Set()
		}));
	}

	async function createMap(data: MapCreateInput) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			const response = await mapService.create(data);
			
			if (response.success) {
				await loadMaps(); // 목록 새로고침
				return response;
			} else {
				update(s => ({
					...s,
					loading: false,
					error: response.error || { code: 'CREATE_ERROR', message: '맵 생성에 실패했습니다.' }
				}));
				return response;
			}
		} catch (error) {
			console.error('Failed to create map:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' }
			}));
			return { success: false, error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' } };
		}
	}

	async function updateMap(id: string, data: MapUpdateInput) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			const response = await mapService.update(id, data);
			
			if (response.success) {
				await loadMaps(); // 목록 새로고침
				return response;
			} else {
				update(s => ({
					...s,
					loading: false,
					error: response.error || { code: 'UPDATE_ERROR', message: '맵 수정에 실패했습니다.' }
				}));
				return response;
			}
		} catch (error) {
			console.error('Failed to update map:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' }
			}));
			return { success: false, error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' } };
		}
	}

	async function deleteMap(id: string) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			const response = await mapService.delete(id);
			
			if (response.success) {
				await loadMaps(); // 목록 새로고침
				return response;
			} else {
				update(s => ({
					...s,
					loading: false,
					error: response.error || { code: 'DELETE_ERROR', message: '맵 삭제에 실패했습니다.' }
				}));
				return response;
			}
		} catch (error) {
			console.error('Failed to delete map:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' }
			}));
			return { success: false, error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' } };
		}
	}

	async function deleteSelectedMaps() {
		const state = get(mapStore);
		const selectedIds = Array.from(state.selectedItems);
		
		if (selectedIds.length === 0) return;

		update(s => ({ ...s, loading: true, error: null }));

		try {
			const deletePromises = selectedIds.map(id => mapService.delete(id));
			await Promise.all(deletePromises);
			
			await loadMaps(); // 목록 새로고침
			deselectAll(); // 선택 해제
		} catch (error) {
			console.error('Failed to delete selected maps:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'BULK_DELETE_ERROR', message: '일괄 삭제에 실패했습니다.' }
			}));
		}
	}

	async function uploadImage(file: File, mapId?: string) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			const response = await mapService.uploadImageFile(file, mapId);
			
			if (response.success) {
				update(s => ({ ...s, loading: false }));
				return response;
			} else {
				update(s => ({
					...s,
					loading: false,
					error: response.error || { code: 'UPLOAD_ERROR', message: '이미지 업로드에 실패했습니다.' }
				}));
				return response;
			}
		} catch (error) {
			console.error('Failed to upload image:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' }
			}));
			return { success: false, error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' } };
		}
	}

	async function uploadMetadata(files: File[], mapId?: string) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			const response = await mapService.uploadMetadataFolder(files, mapId);
			
			if (response.success) {
				update(s => ({ ...s, loading: false }));
				return response;
			} else {
				update(s => ({
					...s,
					loading: false,
					error: response.error || { code: 'UPLOAD_ERROR', message: '메타데이터 업로드에 실패했습니다.' }
				}));
				return response;
			}
		} catch (error) {
			console.error('Failed to upload metadata:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' }
			}));
			return { success: false, error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' } };
		}
	}

	function clearError() {
		update(s => ({ ...s, error: null }));
	}

	return {
		subscribe,
		loadMaps,
		changePage,
		changeLimit,
		setSearchQuery,
		setTypeFilter,
		setGolfCourseFilter,
		setSorting,
		selectItem,
		deselectItem,
		selectAll,
		deselectAll,
		createMap,
		updateMap,
		deleteMap,
		deleteSelectedMaps,
		uploadImage,
		uploadMetadata,
		clearError
	};
}

export const mapStore = createMapStore();

// Derived stores
export const isLoading = derived(mapStore, $state => $state.loading);
export const errorMessage = derived(mapStore, $state => $state.error?.message || null);
export const selectedCount = derived(mapStore, $state => $state.selectedItems.size);

// Store 액세스를 위한 get 함수
import { get } from 'svelte/store';