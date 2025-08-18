import { writable, derived } from 'svelte/store';
import { cartService, type Cart, type CartCreateInput, type CartUpdateInput, type CartListParams } from '$lib/services/cart.service';

interface CartState {
	items: Cart[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	loading: boolean;
	error: { code: string; message: string } | null;
	searchQuery: string;
	selectedStatus: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'CHARGING' | 'all';
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
	sortBy: 'createdAt',
	sortOrder: 'desc',
	selectedItems: new Set()
};

function createCartStore() {
	const { subscribe, set, update } = writable<CartState>(initialState);

	async function loadCarts(params: CartListParams = {}) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			const response = await cartService.getList({
				page: params.page || 1,
				limit: params.limit || 20,
				search: params.search || '',
				status: params.status || undefined,
				golfCourseId: params.golfCourseId,
				batteryLevel: params.batteryLevel,
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
					selectedStatus: (params.status || 'all') as any,
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
			console.error('Failed to load carts:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' }
			}));
		}
	}

	async function changePage(page: number) {
		update(s => ({ ...s, page }));
		await loadCarts({ page });
	}

	async function changeLimit(limit: number) {
		update(s => ({ ...s, limit, page: 1 }));
		await loadCarts({ limit, page: 1 });
	}

	async function setSearchQuery(query: string) {
		update(s => ({ ...s, searchQuery: query, page: 1 }));
		await loadCarts({ search: query, page: 1 });
	}

	async function setStatusFilter(status: CartState['selectedStatus']) {
		update(s => ({ ...s, selectedStatus: status, page: 1 }));
		const statusParam = status === 'all' ? undefined : status;
		await loadCarts({ status: statusParam, page: 1 });
	}

	async function setSorting(sortBy: string, sortOrder: 'asc' | 'desc') {
		update(s => ({ ...s, sortBy, sortOrder, page: 1 }));
		await loadCarts({ sortBy, sortOrder, page: 1 });
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

	async function createCart(data: CartCreateInput) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			const response = await cartService.create(data);
			
			if (response.success) {
				await loadCarts(); // 목록 새로고침
				return response;
			} else {
				update(s => ({
					...s,
					loading: false,
					error: response.error || { code: 'CREATE_ERROR', message: '카트 생성에 실패했습니다.' }
				}));
				return response;
			}
		} catch (error) {
			console.error('Failed to create cart:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' }
			}));
			return { success: false, error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' } };
		}
	}

	async function updateCart(id: string, data: CartUpdateInput) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			const response = await cartService.update(id, data);
			
			if (response.success) {
				await loadCarts(); // 목록 새로고침
				return response;
			} else {
				update(s => ({
					...s,
					loading: false,
					error: response.error || { code: 'UPDATE_ERROR', message: '카트 수정에 실패했습니다.' }
				}));
				return response;
			}
		} catch (error) {
			console.error('Failed to update cart:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' }
			}));
			return { success: false, error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' } };
		}
	}

	async function deleteCart(id: string) {
		update(s => ({ ...s, loading: true, error: null }));

		try {
			const response = await cartService.delete(id);
			
			if (response.success) {
				await loadCarts(); // 목록 새로고침
				return response;
			} else {
				update(s => ({
					...s,
					loading: false,
					error: response.error || { code: 'DELETE_ERROR', message: '카트 삭제에 실패했습니다.' }
				}));
				return response;
			}
		} catch (error) {
			console.error('Failed to delete cart:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' }
			}));
			return { success: false, error: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' } };
		}
	}

	async function deleteSelectedCarts() {
		const state = get(cartStore);
		const selectedIds = Array.from(state.selectedItems);
		
		if (selectedIds.length === 0) return;

		update(s => ({ ...s, loading: true, error: null }));

		try {
			const deletePromises = selectedIds.map(id => cartService.delete(id));
			await Promise.all(deletePromises);
			
			await loadCarts(); // 목록 새로고침
			deselectAll(); // 선택 해제
		} catch (error) {
			console.error('Failed to delete selected carts:', error);
			update(s => ({
				...s,
				loading: false,
				error: { code: 'BULK_DELETE_ERROR', message: '일괄 삭제에 실패했습니다.' }
			}));
		}
	}

	function clearError() {
		update(s => ({ ...s, error: null }));
	}

	return {
		subscribe,
		loadCarts,
		changePage,
		changeLimit,
		setSearchQuery,
		setStatusFilter,
		setSorting,
		selectItem,
		deselectItem,
		selectAll,
		deselectAll,
		createCart,
		updateCart,
		deleteCart,
		deleteSelectedCarts,
		clearError
	};
}

export const cartStore = createCartStore();

// Derived stores
export const isLoading = derived(cartStore, $state => $state.loading);
export const errorMessage = derived(cartStore, $state => $state.error?.message || null);
export const selectedCount = derived(cartStore, $state => $state.selectedItems.size);

// Store 액세스를 위한 get 함수
import { get } from 'svelte/store';