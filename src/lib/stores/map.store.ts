import { writable, derived, get as getStore } from 'svelte/store';
import type { MapData, MapCreateInput, MapUpdateInput } from '$lib/types/map';
import { mapService } from '$lib/services/map.service';

interface MapState {
	items: MapData[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	loading: boolean;
	error: { code: string; message: string } | null;
	searchQuery: string;
	selectedStatus: 'active' | 'testing' | 'inactive' | 'all';
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
	selectedStatus: 'all',
	sortBy: 'createdAt',
	sortOrder: 'desc',
	selectedItems: new Set()
};

function createMapStore() {
	const { subscribe, set, update } = writable<MapState>(initialState);

	async function loadMaps(params: any = {}) {
		update(s => ({ ...s, loading: true, error: null }));

		const queryParams = {
			page: params.page || 1,
			limit: params.limit || 20,
			search: params.search || '',
			status: params.status === 'all' ? undefined : params.status,
			golfCourseId: params.golfCourseId === 'all' ? undefined : params.golfCourseId,
			sortBy: params.sortBy || 'createdAt',
			sortOrder: params.sortOrder || 'desc'
		};

		try {
			const response = await mapService.getList(queryParams);
			console.log('🔍 Map service response:', response);
			
			if (response.success && response.data) {
				const data = response.data;
				console.log('📋 Map data items:', data.items);
				update(s => ({
					...s,
					items: data.items as unknown as MapData[],
					total: data.total,
					page: data.page,
					limit: data.limit,
					totalPages: data.totalPages,
					loading: false,
					searchQuery: queryParams.search,
					selectedStatus: params.status || 'all',
					sortBy: queryParams.sortBy,
					sortOrder: queryParams.sortOrder
				}));
			} else {
				console.error('맵 목록 로드 실패:', response.error);
				update(s => ({
					...s,
					loading: false,
					error: response.error ? { code: response.error.code, message: response.error.message } : { code: 'API_ERROR', message: '맵 목록을 불러올 수 없습니다.' }
				}));
			}
		} catch (error) {
			console.error('맵 목록 API 호출 실패:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: 'API 서버에 연결할 수 없습니다.' }
			}));
		}
	}

	async function changePage(page: number) {
		const currentState = getStore(mapStore);
		await loadMaps({ ...currentState, page });
	}

	async function search(query: string) {
		await loadMaps({ page: 1, search: query, status: getStore(mapStore).selectedStatus });
	}

	async function changeFilter(status: any) {
		await loadMaps({ page: 1, search: getStore(mapStore).searchQuery, status });
	}

	async function changeSort(sortBy: string) {
		const currentState = getStore(mapStore);
		const sortOrder = currentState.sortBy === sortBy && currentState.sortOrder === 'asc' ? 'desc' : 'asc';
		await loadMaps({ ...currentState, sortBy, sortOrder });
	}

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

	function toggleSelectAll() {
		update(state => {
			const allIds = state.items.map(item => item.mapId);
			const newSelectedItems = state.selectedItems.size === allIds.length
				? new Set<string>()
				: new Set(allIds);
			return { ...state, selectedItems: newSelectedItems };
		});
	}

	function clearError() {
		update(s => ({ ...s, error: null }));
	}

	// Mock CRUD operations
	async function createMap(data: MapCreateInput) {
		try {
			update(s => ({ ...s, loading: true }));
			
			// 타입 맞춤을 위해 데이터 변환
			const createInput = {
				name: data.mapName,
				description: `맵 생성`,
				golfCourseId: data.connectedGolfCourseId,
				type: '2D' as const,
				mapStatus: data.mapStatus,
				bounds: {
					north: data.mapData?.originGps?.latitude ? data.mapData.originGps.latitude + 0.01 : 37.51,
					south: data.mapData?.originGps?.latitude ? data.mapData.originGps.latitude - 0.01 : 37.49,
					east: data.mapData?.originGps?.longitude ? data.mapData.originGps.longitude + 0.01 : 127.06,
					west: data.mapData?.originGps?.longitude ? data.mapData.originGps.longitude - 0.01 : 127.04
				}
			};
			
			const response = await mapService.create(createInput);
			
			if (response.success) {
				await loadMaps();
				return true;
			} else {
				update(s => ({ ...s, error: response.error ? { code: response.error.code, message: response.error.message } : { code: 'API_ERROR', message: '작업에 실패했습니다.' }, loading: false }));
				return false;
			}
		} catch (error) {
			console.error("Failed to create map:", error);
			update(s => ({ ...s, error: { code: 'CREATE_ERROR', message: '맵 생성에 실패했습니다.' }, loading: false }));
			return false;
		}
	}

	async function updateMap(id: string, data: MapUpdateInput) {
		try {
			console.log('🔄 Updating map:', id, data);
			update(s => ({ ...s, loading: true }));
			
			const response = await mapService.update(id, data);
			console.log('✅ Map update response:', response);
			
			if (response.success) {
				await loadMaps();
				return true;
			} else {
				update(s => ({ ...s, error: response.error ? { code: response.error.code, message: response.error.message } : { code: 'API_ERROR', message: '작업에 실패했습니다.' }, loading: false }));
				return false;
			}
		} catch (error) {
			console.error("Failed to update map:", error);
			update(s => ({ ...s, error: { code: 'UPDATE_ERROR', message: '맵 수정에 실패했습니다.' }, loading: false }));
			return false;
		}
	}

	async function deleteMap(id: string) {
		try {
			update(s => ({ ...s, loading: true }));
			
			const response = await mapService.delete(id);
			
			if (response.success) {
				await loadMaps();
				return true;
			} else {
				update(s => ({ ...s, error: response.error ? { code: response.error.code, message: response.error.message } : { code: 'API_ERROR', message: '작업에 실패했습니다.' }, loading: false }));
				return false;
			}
		} catch (error) {
			console.error("Failed to delete map:", error);
			update(s => ({ ...s, error: { code: 'DELETE_ERROR', message: '맵 삭제에 실패했습니다.' }, loading: false }));
			return false;
		}
	}

	async function bulkDelete() {
		try {
			const currentState = getStore(mapStore);
			const selectedIds = Array.from(currentState.selectedItems);
			
			update(s => ({ ...s, loading: true }));
			
			// 각각의 맵을 삭제
			const deletePromises = selectedIds.map(id => mapService.delete(id));
			const results = await Promise.all(deletePromises);
			
			const hasFailures = results.some(result => !result.success);
			
			if (!hasFailures) {
				update(s => ({ ...s, selectedItems: new Set() }));
				await loadMaps();
				return true;
			} else {
				update(s => ({ 
					...s, 
					error: { code: 'BULK_DELETE_ERROR', message: '일부 맵 삭제에 실패했습니다.' },
					loading: false 
				}));
				return false;
			}
		} catch (error) {
			console.error("Failed to bulk delete maps:", error);
			update(s => ({ 
				...s, 
				error: { code: 'BULK_DELETE_ERROR', message: '선택한 맵들 삭제에 실패했습니다.' },
				loading: false 
			}));
			return false;
		}
	}

	return {
		subscribe,
		loadMaps,
		changePage,
		search,
		changeFilter,
		changeSort,
		toggleSelection,
		toggleSelectAll,
		clearError,
		createMap,
		updateMap,
		deleteMap,
		bulkDelete,
	};
}

export const mapStore = createMapStore();

export const isLoading = derived(mapStore, $s => $s.loading);
export const errorMessage = derived(mapStore, $s => $s.error?.message || null);
export const selectedCount = derived(mapStore, $s => $s.selectedItems.size);
