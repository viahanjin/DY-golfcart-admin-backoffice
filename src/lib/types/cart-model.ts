export interface CartModel {
	id: string;
	modelName: string;
	modelCode: string;
	year: number;
	specs: {
		maxSpeed: number;
		batteryType: string;
		seats: number;
	};
	features: string[];
	status: 'active' | 'discontinued';
	createdAt: string;
	updatedAt: string;
}

export interface CreateCartModelRequest {
	modelName: string;
	modelCode: string;
	year: number;
	specs: {
		maxSpeed: number;
		batteryType: string;
		seats: number;
	};
	features: string[];
	status: 'active' | 'discontinued';
}

export interface UpdateCartModelRequest extends Partial<CreateCartModelRequest> {}

// Store state interface
export interface CartModelState {
	items: CartModel[];
	total: number;
	page: number;
	totalPages: number;
	searchQuery: string;
	selectedStatus: 'all' | 'active' | 'discontinued';
	sortBy: string;
	sortOrder: 'asc' | 'desc';
	selectedItems: Set<string>;
}