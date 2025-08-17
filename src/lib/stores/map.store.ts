import { writable, derived } from 'svelte/store';
import type { MapData, MapCreateInput, MapUpdateInput } from '$lib/types/map';
import mockMaps from '$lib/mock/maps.json';

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
		update(s => ({ ...s, loading: true }));

		const {
			page = 1,
			limit = 20,
			search = '',
			status = 'all',
			sortBy = 'createdAt',
			sortOrder = 'desc'
		} = params;

		let filtered: MapData[] = [...mockMaps] as MapData[];

		if (status !== 'all') {
			filtered = filtered.filter(m => m.mapStatus.status === status);
		}

		if (search) {
			const lowerSearch = search.toLowerCase();
			filtered = filtered.filter(m =>
				m.mapId.toLowerCase().includes(lowerSearch) ||
				m.mapName.toLowerCase().includes(lowerSearch)
			);
		}

		filtered.sort((a, b) => {
			const aVal = (a as any)[sortBy];
			const bVal = (b as any)[sortBy];
			if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		const total = filtered.length;
		const totalPages = Math.ceil(total / limit);
		const paginatedItems = filtered.slice((page - 1) * limit, page * limit);

		update(s => ({
			...s,
			items: paginatedItems,
			total,
			page,
			limit,
			totalPages,
			loading: false,
			searchQuery: search,
			selectedStatus: status,
			sortBy,
			sortOrder
		}));
	}

	async function changePage(page: number) {
		const currentState = get(mapStore);
		await loadMaps({ ...currentState, page });
	}

	async function search(query: string) {
		await loadMaps({ page: 1, search: query, status: get(mapStore).selectedStatus });
	}

	async function changeFilter(status: any) {
		await loadMaps({ page: 1, search: get(mapStore).searchQuery, status });
	}

	async function changeSort(sortBy: string) {
		const currentState = get(mapStore);
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
		console.log("Creating map", data);
		await loadMaps();
		return true;
	}
	async function updateMap(id: string, data: MapUpdateInput) {
		console.log("Updating map", id, data);
		await loadMaps();
		return true;
	}
	async function deleteMap(id: string) {
		console.log("Deleting map", id);
		await loadMaps();
		return true;
	}
	async function bulkDelete() {
		console.log("Bulk deleting maps", get(mapStore).selectedItems);
		update(s => ({...s, selectedItems: new Set()}));
		await loadMaps();
		return true;
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

function get<T>(store: { subscribe: (fn: (value: T) => void) => () => void }): T {
	let value: T;
	store.subscribe((v) => (value = v))();
	return value!;
}

export const isLoading = derived(mapStore, $s => $s.loading);
export const errorMessage = derived(mapStore, $s => $s.error?.message || null);
export const selectedCount = derived(mapStore, $s => $s.selectedItems.size);
