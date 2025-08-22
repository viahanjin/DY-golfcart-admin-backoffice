import { writable, derived } from 'svelte/store';
import type { Cart, CartCreateInput, CartUpdateInput } from '$lib/types/cart';
import mockCarts from '$lib/mock/carts.json';

interface CartState {
	items: Cart[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	loading: boolean;
	error: { code: string; message: string } | null;
	searchQuery: string;
	selectedStatus: 'available' | 'maintenance' | 'broken' | 'unavailable' | 'all';
	sortBy: string;
	sortOrder: 'asc' | 'desc';
	selectedItems: Set<string>;
}

const initialState: CartState = {
	items: [],
	total: 0,
	page: 1,
	limit: 20,
	totalPages: 0,
	loading: false,
	error: null,
	searchQuery: '',
	selectedStatus: 'all',
	sortBy: 'id',
	sortOrder: 'asc',
	selectedItems: new Set()
};

function createCartStore() {
	const { subscribe, set, update } = writable<CartState>(initialState);

	async function loadCarts(params: any = {}) {
		update(s => ({ ...s, loading: true }));

		// Mock data logic
		const {
			page = 1,
			limit = 20,
			search = '',
			status = 'all',
			sortBy = 'id',
			sortOrder = 'asc'
		} = params;

		let filtered: Cart[] = [...(mockCarts as any)];

		if (status !== 'all') {
			filtered = filtered.filter(c => (c as any).cartStatus?.currentState === status);
		}

		if (search) {
			const lowerSearch = search.toLowerCase();
			filtered = filtered.filter(c =>
				c.id.toLowerCase().includes(lowerSearch) ||
				(c as any).cartName?.toLowerCase().includes(lowerSearch)
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
		const currentState = get(cartStore);
		await loadCarts({ ...currentState, page });
	}

	async function search(query: string) {
		await loadCarts({ page: 1, search: query, status: get(cartStore).selectedStatus });
	}

	async function changeFilter(status: any) {
		await loadCarts({ page: 1, search: get(cartStore).searchQuery, status });
	}

	async function changeSort(sortBy: string) {
		const currentState = get(cartStore);
		const sortOrder = currentState.sortBy === sortBy && currentState.sortOrder === 'asc' ? 'desc' : 'asc';
		await loadCarts({ ...currentState, sortBy, sortOrder });
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
			const allIds = state.items.map(item => item.id);
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
	async function createCart(data: CartCreateInput) {
		console.log("Creating cart", data);
		await loadCarts();
		return true;
	}
	async function updateCart(id: string, data: CartUpdateInput) {
		console.log("Updating cart", id, data);
		await loadCarts();
		return true;
	}
	async function deleteCart(id: string) {
		console.log("Deleting cart", id);
		await loadCarts();
		return true;
	}
	async function bulkDelete() {
		console.log("Bulk deleting carts", get(cartStore).selectedItems);
		update(s => ({...s, selectedItems: new Set()}));
		await loadCarts();
		return true;
	}

	return {
		subscribe,
		loadCarts,
		changePage,
		search,
		changeFilter,
		changeSort,
		toggleSelection,
		toggleSelectAll,
		clearError,
		createCart,
		updateCart,
		deleteCart,
		bulkDelete,
	};
}

export const cartStore = createCartStore();

function get<T>(store: { subscribe: (fn: (value: T) => void) => () => void }): T {
	let value: T;
	store.subscribe((v) => (value = v))();
	return value!;
}

export const isLoading = derived(cartStore, $s => $s.loading);
export const errorMessage = derived(cartStore, $s => $s.error?.message || null);
export const selectedCount = derived(cartStore, $s => $s.selectedItems.size);
