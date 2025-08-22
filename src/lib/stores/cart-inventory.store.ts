import { writable, derived } from 'svelte/store';
import type { Cart, CartInventoryState, CreateCartRequest, UpdateCartRequest } from '$lib/types/cart';

// Initial state
const initialState: CartInventoryState = {
	items: [],
	total: 0,
	page: 1,
	totalPages: 1,
	searchQuery: '',
	selectedStatus: 'all',
	selectedModelId: 'all',
	selectedGolfCourseId: 'all',
	sortBy: 'createdAt',
	sortOrder: 'desc',
	selectedItems: new Set<string>()
};

// Create stores
export const cartInventoryStore = writable<CartInventoryState>(initialState);
export const isLoading = writable<boolean>(false);
export const errorMessage = writable<string | null>(null);

// Derived stores
export const selectedCount = derived(
	cartInventoryStore,
	($store) => $store.selectedItems.size
);

// Store actions
function createCartInventoryStore() {
	const { subscribe, set, update } = cartInventoryStore;

	return {
		subscribe,

		// Load carts with current filters
		async loadCarts() {
			try {
				console.log('🔄 Loading cart inventory...');
				isLoading.set(true);
				errorMessage.set(null);

				const currentState = getCurrentState();
				const params = {
					page: currentState.page,
					limit: 10,
					search: currentState.searchQuery || undefined,
					status: currentState.selectedStatus !== 'all' ? currentState.selectedStatus : undefined,
					modelId: currentState.selectedModelId !== 'all' ? currentState.selectedModelId : undefined,
					golfCourseId: currentState.selectedGolfCourseId !== 'all' ? currentState.selectedGolfCourseId : undefined,
					sortBy: currentState.sortBy,
					sortOrder: currentState.sortOrder
				};

				console.log('📋 Load params:', params);

				// For now, use mock data since the existing service uses different structure
				const response = getMockCarts(params);
				
				update(state => ({
					...state,
					items: response.items,
					total: response.total,
					totalPages: response.totalPages,
					page: response.page
				}));

				console.log('✅ Cart inventory loaded successfully');
			} catch (error) {
				console.error('❌ Error loading cart inventory:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to load cart inventory');
			} finally {
				isLoading.set(false);
			}
		},

		// Create new cart
		async createCart(data: CreateCartRequest): Promise<boolean> {
			try {
				console.log('📝 Creating cart:', data);
				isLoading.set(true);
				errorMessage.set(null);

				// Mock creation for now
				const newCart = createMockCart(data);
				
				// Add to current items
				update(state => ({
					...state,
					items: [newCart, ...state.items],
					total: state.total + 1
				}));
				
				console.log('✅ Cart created successfully');
				return true;
			} catch (error) {
				console.error('❌ Error creating cart:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to create cart');
				return false;
			} finally {
				isLoading.set(false);
			}
		},

		// Update cart
		async updateCart(id: string, data: UpdateCartRequest): Promise<boolean> {
			try {
				console.log('📝 Updating cart:', id, data);
				isLoading.set(true);
				errorMessage.set(null);

				// Mock update for now
				update(state => ({
					...state,
					items: state.items.map(item => 
						item.id === id 
							? { ...item, ...data, updatedAt: new Date().toISOString() }
							: item
					)
				}));
				
				console.log('✅ Cart updated successfully');
				return true;
			} catch (error) {
				console.error('❌ Error updating cart:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to update cart');
				return false;
			} finally {
				isLoading.set(false);
			}
		},

		// Delete cart
		async deleteCart(id: string): Promise<boolean> {
			try {
				console.log('🗑️ Deleting cart:', id);
				isLoading.set(true);
				errorMessage.set(null);

				// Mock deletion
				update(state => ({
					...state,
					items: state.items.filter(item => item.id !== id),
					total: state.total - 1
				}));
				
				console.log('✅ Cart deleted successfully');
				return true;
			} catch (error) {
				console.error('❌ Error deleting cart:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to delete cart');
				return false;
			} finally {
				isLoading.set(false);
			}
		},

		// Bulk delete carts
		async bulkDelete(): Promise<boolean> {
			try {
				const currentState = getCurrentState();
				const selectedIds = Array.from(currentState.selectedItems);
				
				if (selectedIds.length === 0) {
					console.warn('⚠️ No items selected for bulk delete');
					return false;
				}

				console.log('🗑️ Bulk deleting carts:', selectedIds);
				isLoading.set(true);
				errorMessage.set(null);

				// Mock bulk deletion
				update(state => ({
					...state,
					items: state.items.filter(item => !selectedIds.includes(item.id)),
					total: state.total - selectedIds.length,
					selectedItems: new Set<string>()
				}));
				
				console.log('✅ Carts bulk deleted successfully');
				return true;
			} catch (error) {
				console.error('❌ Error bulk deleting carts:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to delete carts');
				return false;
			} finally {
				isLoading.set(false);
			}
		},

		// Deploy cart to golf course
		async deployCart(cartId: string, golfCourseId: string, golfCourseName: string): Promise<boolean> {
			try {
				console.log('🚚 Deploying cart:', cartId, 'to golf course:', golfCourseId);
				isLoading.set(true);
				errorMessage.set(null);

				// Mock deployment
				update(state => ({
					...state,
					items: state.items.map(item => 
						item.id === cartId 
							? { 
								...item, 
								status: 'deployed',
								golfCourseId,
								golfCourseName,
								deploymentDate: new Date().toISOString(),
								updatedAt: new Date().toISOString()
							}
							: item
					)
				}));
				
				console.log('✅ Cart deployed successfully');
				return true;
			} catch (error) {
				console.error('❌ Error deploying cart:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to deploy cart');
				return false;
			} finally {
				isLoading.set(false);
			}
		},

		// Recall cart from golf course
		async recallCart(cartId: string): Promise<boolean> {
			try {
				console.log('🔄 Recalling cart:', cartId);
				isLoading.set(true);
				errorMessage.set(null);

				// Mock recall
				update(state => ({
					...state,
					items: state.items.map(item => 
						item.id === cartId 
							? { 
								...item, 
								status: 'in_warehouse',
								golfCourseId: undefined,
								golfCourseName: undefined,
								deploymentDate: undefined,
								updatedAt: new Date().toISOString()
							}
							: item
					)
				}));
				
				console.log('✅ Cart recalled successfully');
				return true;
			} catch (error) {
				console.error('❌ Error recalling cart:', error);
				errorMessage.set(error instanceof Error ? error.message : 'Failed to recall cart');
				return false;
			} finally {
				isLoading.set(false);
			}
		},

		// Search
		search(query: string) {
			console.log('🔍 Searching carts:', query);
			update(state => ({
				...state,
				searchQuery: query,
				page: 1 // Reset to first page
			}));
			this.loadCarts();
		},

		// Change status filter
		changeStatusFilter(status: 'all' | 'in_warehouse' | 'deployed' | 'maintenance') {
			console.log('🔧 Changing status filter:', status);
			update(state => ({
				...state,
				selectedStatus: status,
				page: 1 // Reset to first page
			}));
			this.loadCarts();
		},

		// Change model filter
		changeModelFilter(modelId: string) {
			console.log('🔧 Changing model filter:', modelId);
			update(state => ({
				...state,
				selectedModelId: modelId,
				page: 1 // Reset to first page
			}));
			this.loadCarts();
		},

		// Change golf course filter
		changeGolfCourseFilter(golfCourseId: string) {
			console.log('🔧 Changing golf course filter:', golfCourseId);
			update(state => ({
				...state,
				selectedGolfCourseId: golfCourseId,
				page: 1 // Reset to first page
			}));
			this.loadCarts();
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
			this.loadCarts();
		},

		// Change page
		changePage(page: number) {
			console.log('📄 Changing page:', page);
			update(state => ({
				...state,
				page
			}));
			this.loadCarts();
		},

		// Toggle selection
		toggleSelection(id: string) {
			update(state => {
				const newSelectedItems = new Set(state.selectedItems);
				if (newSelectedItems.has(id)) {
					newSelectedItems.delete(id);
					console.log('➖ Deselected cart:', id);
				} else {
					newSelectedItems.add(id);
					console.log('➕ Selected cart:', id);
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
					console.log('✅ Selected all carts');
				} else {
					console.log('❌ Deselected all carts');
				}
				
				return {
					...state,
					selectedItems: newSelectedItems
				};
			});
		},

		// Reset store
		reset() {
			console.log('🔄 Resetting cart inventory store');
			set(initialState);
			isLoading.set(false);
			errorMessage.set(null);
		}
	};
}

// Helper to get current state
function getCurrentState(): CartInventoryState {
	let currentState: CartInventoryState;
	cartInventoryStore.subscribe(state => currentState = state)();
	return currentState!;
}

// Mock data functions
function getMockCarts(params?: any): {
	items: Cart[];
	total: number;
	page: number;
	totalPages: number;
} {
	console.log('🧪 Using mock cart inventory data');
	
	const mockCarts: Cart[] = [
		{
			id: 'CART-001',
			serialNumber: 'DYC2024001',
			modelId: 'MODEL-001',
			modelName: 'DY-CART-2024',
			modelCode: 'DYC2024',
			status: 'deployed',
			golfCourseId: 'GC001',
			golfCourseName: '파인밸리 골프클럽',
			deploymentDate: '2024-03-15T10:00:00Z',
			batteryLevel: 85,
			lastSeenAt: '2024-08-22T14:30:00Z',
			maintenanceStatus: 'good',
			location: {
				lat: 37.4563,
				lng: 126.7052
			},
			createdAt: '2024-01-20T09:00:00Z',
			updatedAt: '2024-08-22T14:30:00Z'
		},
		{
			id: 'CART-002',
			serialNumber: 'DYC2024002',
			modelId: 'MODEL-001',
			modelName: 'DY-CART-2024',
			modelCode: 'DYC2024',
			status: 'in_warehouse',
			batteryLevel: 100,
			lastSeenAt: '2024-08-21T18:00:00Z',
			maintenanceStatus: 'good',
			location: {
				lat: 37.4963,
				lng: 127.0293
			},
			createdAt: '2024-01-20T09:00:00Z',
			updatedAt: '2024-08-21T18:00:00Z'
		},
		{
			id: 'CART-003',
			serialNumber: 'DYC2023003',
			modelId: 'MODEL-002',
			modelName: 'DY-CART-2023',
			modelCode: 'DYC2023',
			status: 'deployed',
			golfCourseId: 'GC002',
			golfCourseName: '오션뷰 골프리조트',
			deploymentDate: '2024-02-10T09:30:00Z',
			batteryLevel: 45,
			lastSeenAt: '2024-08-22T13:15:00Z',
			maintenanceStatus: 'warning',
			location: {
				lat: 35.1796,
				lng: 129.0756
			},
			createdAt: '2023-05-15T09:00:00Z',
			updatedAt: '2024-08-22T13:15:00Z'
		},
		{
			id: 'CART-004',
			serialNumber: 'DYC2024004',
			modelId: 'MODEL-001',
			modelName: 'DY-CART-2024',
			modelCode: 'DYC2024',
			status: 'maintenance',
			golfCourseId: 'GC001',
			golfCourseName: '파인밸리 골프클럽',
			deploymentDate: '2024-04-01T08:00:00Z',
			batteryLevel: 0,
			lastSeenAt: '2024-08-20T16:45:00Z',
			maintenanceStatus: 'critical',
			location: {
				lat: 37.4563,
				lng: 126.7052
			},
			createdAt: '2024-01-25T09:00:00Z',
			updatedAt: '2024-08-20T16:45:00Z'
		},
		{
			id: 'CART-005',
			serialNumber: 'DYC2024005',
			modelId: 'MODEL-001',
			modelName: 'DY-CART-2024',
			modelCode: 'DYC2024',
			status: 'in_warehouse',
			batteryLevel: 78,
			lastSeenAt: '2024-08-22T12:00:00Z',
			maintenanceStatus: 'good',
			location: {
				lat: 37.4963,
				lng: 127.0293
			},
			createdAt: '2024-02-01T09:00:00Z',
			updatedAt: '2024-08-22T12:00:00Z'
		}
	];

	let filteredCarts = mockCarts;

	// Apply filters
	if (params?.status && params.status !== 'all') {
		filteredCarts = filteredCarts.filter(cart => cart.status === params.status);
	}

	if (params?.modelId && params.modelId !== 'all') {
		filteredCarts = filteredCarts.filter(cart => cart.modelId === params.modelId);
	}

	if (params?.golfCourseId && params.golfCourseId !== 'all') {
		filteredCarts = filteredCarts.filter(cart => cart.golfCourseId === params.golfCourseId);
	}

	if (params?.search) {
		const search = params.search.toLowerCase();
		filteredCarts = filteredCarts.filter(cart => 
			cart.serialNumber.toLowerCase().includes(search) ||
			cart.modelName.toLowerCase().includes(search) ||
			cart.golfCourseName?.toLowerCase().includes(search)
		);
	}

	// Apply sorting
	if (params?.sortBy) {
		filteredCarts.sort((a, b) => {
			const aValue = a[params.sortBy as keyof Cart];
			const bValue = b[params.sortBy as keyof Cart];
			
			if (aValue === undefined || bValue === undefined) return 0;
			
			if (params.sortOrder === 'desc') {
				return aValue < bValue ? 1 : -1;
			}
			return aValue > bValue ? 1 : -1;
		});
	}

	const page = params?.page || 1;
	const limit = params?.limit || 10;
	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedCarts = filteredCarts.slice(startIndex, endIndex);

	return {
		items: paginatedCarts,
		total: filteredCarts.length,
		page,
		totalPages: Math.ceil(filteredCarts.length / limit)
	};
}

function createMockCart(data: CreateCartRequest): Cart {
	console.log('🧪 Creating mock cart');
	
	return {
		id: `CART-${Date.now()}`,
		...data,
		status: data.status || 'in_warehouse',
		batteryLevel: 100,
		lastSeenAt: new Date().toISOString(),
		maintenanceStatus: 'good',
		location: {
			lat: 37.4963,
			lng: 127.0293
		},
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};
}

// Export the store instance
export const cartInventoryStoreInstance = createCartInventoryStore();