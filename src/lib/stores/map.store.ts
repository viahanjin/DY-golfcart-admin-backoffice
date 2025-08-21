import { writable, derived, get } from 'svelte/store';
import { mapService, type MapListParams } from '$lib/services/map.service';
import type { MapData, MapCreateInput, MapUpdateInput } from '$lib/types/map';
import mockMapsData from '$lib/mock/maps.json';

interface MapState {
	items: MapData[];
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

	// 목 데이터를 MapData 형식으로 변환
	function transformMockData(): MapData[] {
		return mockMapsData.map((mockMap: any) => ({
			id: mockMap.mapId,
			name: mockMap.mapName,
			description: `${mockMap.mapData.resolution} 해상도, ${mockMap.mapData.size} 크기`,
			golfCourseId: mockMap.connectedGolfCourseId,
			golfCourseName: mockMap.connectedGolfCourseId === '1' ? '서울 컶트리클럽' : '부산 오션뷰 골프장',
			type: (mockMap.mapStatus.status === 'testing' ? '3D' : mockMap.mapStatus.status === 'active' ? '2D' : 'SATELLITE') as '3D' | '2D' | 'SATELLITE',
			version: mockMap.version,
			imageUrl: mockMap.mapFiles.imageFile,
			thumbnailUrl: mockMap.mapFiles.imageFile.replace('.png', '_thumb.png'),
			metadataUrl: mockMap.mapFiles.metadataFile,
			bounds: {
				north: mockMap.mapData.originGps.latitude + 0.01,
				south: mockMap.mapData.originGps.latitude - 0.01,
				east: mockMap.mapData.originGps.longitude + 0.01,
				west: mockMap.mapData.originGps.longitude - 0.01
			},
			layers: [
				{ name: '빈 레이어', visible: true, type: 'polygon' },
				{ name: '코스 경계', visible: true, type: 'line' },
				{ name: '장애물', visible: false, type: 'point' }
			],
			fileSize: 1024 * 1024 * 5, // 5MB
			resolution: mockMap.mapData.resolution,
			createdAt: mockMap.createdAt,
			updatedAt: mockMap.updatedAt
		}));
	}

	async function loadMaps(params: MapListParams = {}) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			console.log('맵 목록 조회 API 호출:', params);
			
			// 쿼리 파라미터 구성
			const searchParams = new URLSearchParams();
			if (params.page) searchParams.set('page', params.page.toString());
			if (params.limit) searchParams.set('limit', params.limit.toString());
			if (params.search) searchParams.set('search', params.search);
			if (params.type && params.type !== 'all') searchParams.set('type', params.type);
			if (params.golfCourseId) searchParams.set('golfCourseId', params.golfCourseId);
			if (params.sortBy) searchParams.set('sortBy', params.sortBy);
			if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
			
			// 실제 mock 서버 API 호출
			const response = await fetch(`http://localhost:8080/api/maps?${searchParams.toString()}`);
			console.log('API 응답 상태:', response.status);
			
			const result = await response.json();
			console.log('API 응답 데이터:', result);

			if (result.success) {
				const { items, pagination } = result.data;
				
				update(s => ({
					...s,
					items,
					total: pagination.total,
					page: pagination.page,
					limit: pagination.limit,
					totalPages: pagination.totalPages,
					loading: false,
					searchQuery: params.search || '',
					selectedType: (params.type || 'all') as any,
					selectedGolfCourseId: params.golfCourseId || null,
					sortBy: params.sortBy || 'createdAt',
					sortOrder: params.sortOrder || 'desc'
				}));
			} else {
				throw new Error(result.message || '맵 목록 조회에 실패했습니다.');
			}
		} catch (error) {
			console.error('맵 목록 조회 실패:', error);
			const errorMessage = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.';
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: errorMessage }
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
			console.log('맵 생성 API 호출:', data);
			
			// 실제 mock 서버 API 호출
			const response = await fetch('http://localhost:8080/api/maps', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data)
			});

			console.log('API 응답 상태:', response.status);
			const result = await response.json();
			console.log('API 응답 데이터:', result);

			if (result.success) {
				update(s => ({ ...s, loading: false }));
				await loadMaps(); // 목록 새로고침 (실제 서버 데이터 사용하도록 수정 필요)
				return { success: true, data: result.data };
			} else {
				throw new Error(result.message || '맵 생성에 실패했습니다.');
			}
		} catch (error) {
			console.error('맵 생성 실패:', error);
			const errorMessage = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.';
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: errorMessage }
			}));
			return { success: false, error: { code: 'NETWORK_ERROR', message: errorMessage } };
		}
	}

	async function updateMap(id: string, data: MapUpdateInput) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			// 목 데이터 수정 시뮬레이션
			console.log('맵 수정 목 데이터:', id, data);
			
			// 성공 응답 시뮬레이션
			setTimeout(() => {
				update(s => ({ ...s, loading: false }));
				loadMaps(); // 목록 새로고침
			}, 500);
			
			return { success: true, data: { id, ...data } };
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
			// 목 데이터 삭제 시뮬레이션
			console.log('맵 삭제 목 데이터:', id);
			
			// 성공 응답 시뮬레이션
			setTimeout(() => {
				update(s => ({ ...s, loading: false }));
				loadMaps(); // 목록 새로고침
			}, 500);
			
			return { success: true };
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
		search: setSearchQuery,
		changeFilter: setTypeFilter,
		setGolfCourseFilter,
		changeSort: (params: { sortBy: string; sortOrder: 'asc' | 'desc' }) => setSorting(params.sortBy, params.sortOrder),
		selectItem,
		deselectItem,
		toggleSelection: (id: string) => {
			const state = get(mapStore);
			if (state.selectedItems.has(id)) {
				deselectItem(id);
			} else {
				selectItem(id);
			}
		},
		selectAll,
		deselectAll,
		toggleSelectAll: () => {
			const state = get(mapStore);
			if (state.selectedItems.size === state.items.length) {
				deselectAll();
			} else {
				selectAll();
			}
		},
		createMap,
		updateMap,
		deleteMap,
		bulkDelete: deleteSelectedMaps,
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

