import { writable, derived } from 'svelte/store';
import type { CartModel, CartModelState, CreateCartModelRequest, UpdateCartModelRequest } from '$lib/types/cart-model';
import { cartModelService } from '$lib/services/cart-model.service';

// Initial state
const initialState: CartModelState = {
	items: [],
	total: 0,
	page: 1,
	totalPages: 1,
	searchQuery: '',
	selectedStatus: 'all',
	sortBy: 'createdAt',
	sortOrder: 'desc',
	selectedItems: new Set<string>()
};

// Create stores
export const cartModelStore = writable<CartModelState>(initialState);
export const isLoading = writable<boolean>(false);
export const errorMessage = writable<string | null>(null);

// Derived stores
export const selectedCount = derived(
	cartModelStore,
	($store) => $store.selectedItems.size
);

// Store actions
function createCartModelStore() {
	const { subscribe, set, update } = cartModelStore;

	return {
		subscribe,

		// Load cart models with current filters
		async loadCartModels() {
			try {
				console.log('🔄 Loading cart models...');
				isLoading.set(true);
				errorMessage.set(null);

				const currentState = getCurrentState();
				const params = {
					page: currentState.page,
					limit: 10,
					search: currentState.searchQuery || undefined,
					status: currentState.selectedStatus !== 'all' ? currentState.selectedStatus : undefined,
					sortBy: currentState.sortBy,
					sortOrder: currentState.sortOrder
				};

				console.log('📋 Load params:', params);

				const response = await cartModelService.getCartModels(params);
				
				update(state => ({
					...state,
					items: response.items,
					total: response.total,
					totalPages: response.totalPages,
					page: response.page
				}));

				console.log('✅ Cart models loaded successfully');
			} catch (error) {
				console.error('❌ Error loading cart models:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to load cart models');
			} finally {
				isLoading.set(false);
			}
		},

		// Create new cart model
		async createCartModel(data: CreateCartModelRequest): Promise<boolean> {
			try {
				console.log('📝 Creating cart model:', data);
				isLoading.set(true);
				errorMessage.set(null);

				await cartModelService.createCartModel(data);
				await this.loadCartModels(); // Reload list
				
				console.log('✅ Cart model created successfully');
				return true;
			} catch (error) {
				console.error('❌ Error creating cart model:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to create cart model');
				return false;
			} finally {
				isLoading.set(false);
			}
		},

		// Update cart model
		async updateCartModel(id: string, data: UpdateCartModelRequest): Promise<boolean> {
			try {
				console.log('📝 Updating cart model:', id, data);
				isLoading.set(true);
				errorMessage.set(null);

				await cartModelService.updateCartModel(id, data);
				await this.loadCartModels(); // Reload list
				
				console.log('✅ Cart model updated successfully');
				return true;
			} catch (error) {
				console.error('❌ Error updating cart model:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to update cart model');
				return false;
			} finally {
				isLoading.set(false);
			}
		},

		// Delete cart model
		async deleteCartModel(id: string): Promise<boolean> {
			try {
				console.log('🗑️ Deleting cart model:', id);
				isLoading.set(true);
				errorMessage.set(null);

				await cartModelService.deleteCartModel(id);
				await this.loadCartModels(); // Reload list
				
				console.log('✅ Cart model deleted successfully');
				return true;
			} catch (error) {
				console.error('❌ Error deleting cart model:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to delete cart model');
				return false;
			} finally {
				isLoading.set(false);
			}
		},

		// Bulk delete cart models
		async bulkDelete(): Promise<boolean> {
			try {
				const currentState = getCurrentState();
				const selectedIds = Array.from(currentState.selectedItems);
				
				if (selectedIds.length === 0) {
					console.warn('⚠️ No items selected for bulk delete');
					return false;
				}

				console.log('🗑️ Bulk deleting cart models:', selectedIds);
				isLoading.set(true);
				errorMessage.set(null);

				await cartModelService.bulkDeleteCartModels(selectedIds);
				
				// Clear selection and reload
				update(state => ({
					...state,
					selectedItems: new Set<string>()
				}));
				
				await this.loadCartModels();
				
				console.log('✅ Cart models bulk deleted successfully');
				return true;
			} catch (error) {
				console.error('❌ Error bulk deleting cart models:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to delete cart models');
				return false;
			} finally {
				isLoading.set(false);
			}
		},

		// Search
		search(query: string) {
			console.log('🔍 Searching cart models:', query);
			update(state => ({
				...state,
				searchQuery: query,
				page: 1 // Reset to first page
			}));
			this.loadCartModels();
		},

		// Change filter
		changeFilter(status: 'all' | 'active' | 'discontinued') {
			console.log('🔧 Changing filter:', status);
			update(state => ({
				...state,
				selectedStatus: status,
				page: 1 // Reset to first page
			}));
			this.loadCartModels();
		},

		// Change sorting
		changeSort(sortBy: string) {
			console.log('📊 Changing sort:', sortBy);
			update(state => {
				const newSortOrder = state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc';
				return {
					...state,
					sortBy,
					sortOrder: newSortOrder,
					page: 1 // Reset to first page
				};
			});
			this.loadCartModels();
		},

		// Change page
		changePage(page: number) {
			console.log('📄 Changing page:', page);
			update(state => ({
				...state,
				page
			}));
			this.loadCartModels();
		},

		// Toggle selection
		toggleSelection(id: string) {
			update(state => {
				const newSelectedItems = new Set(state.selectedItems);
				if (newSelectedItems.has(id)) {
					newSelectedItems.delete(id);
					console.log('➖ Deselected cart model:', id);
				} else {
					newSelectedItems.add(id);
					console.log('➕ Selected cart model:', id);
				}
				return {
					...state,
					selectedItems: newSelectedItems
				};
			});
		},

		// Toggle select all
		toggleSelectAll() {
			update(state => {
				const allSelected = state.selectedItems.size === state.items.length;
				const newSelectedItems = new Set<string>();
				
				if (!allSelected) {
					state.items.forEach(item => newSelectedItems.add(item.id));
					console.log('✅ Selected all cart models');
				} else {
					console.log('❌ Deselected all cart models');
				}
				
				return {
					...state,
					selectedItems: newSelectedItems
				};
			});
		},

		// Reset store
		reset() {
			console.log('🔄 Resetting cart model store');
			set(initialState);
			isLoading.set(false);
			errorMessage.set(null);
		}
	};
}

// Helper to get current state
function getCurrentState(): CartModelState {
	let currentState: CartModelState;
	cartModelStore.subscribe(state => currentState = state)();
	return currentState!;
}

// Export the store instance
export const cartModelStoreInstance = createCartModelStore();