export interface Cart {
	id: string;
	serialNumber: string;
	modelId: string;
	modelName: string;
	modelCode: string;
	
	// 배치 정보
	golfCourseId?: string;
	golfCourseName?: string;
	deploymentDate?: string;
	status: 'in_warehouse' | 'deployed' | 'maintenance';
	
	// 운영 정보
	batteryLevel: number;
	lastSeenAt: string;
	maintenanceStatus: 'good' | 'warning' | 'critical';
	location?: {
		lat: number;
		lng: number;
	};
	
	// 네트워크 정보 (배치 시 입력)
	macAddress?: string;
	mqttClientId?: string;
	
	createdAt: string;
	updatedAt: string;
}

export interface CreateCartRequest {
	serialNumber: string;
	modelId: string;
	modelName: string;
	modelCode: string;
	status?: 'in_warehouse' | 'deployed' | 'maintenance';
	macAddress?: string;
	mqttClientId?: string;
}

export interface UpdateCartRequest extends Partial<CreateCartRequest> {}

export type CartCreateInput = CreateCartRequest;
export type CartUpdateInput = UpdateCartRequest;

export interface DeployCartRequest {
	golfCourseId: string;
	golfCourseName: string;
	macAddress?: string;
	mqttClientId?: string;
	deploymentNotes?: string;
}

export interface BulkCreateCartRequest {
	carts: {
		serialNumber: string;
		modelId: string;
	}[];
}

// Store state interface for cart inventory
export interface CartInventoryState {
	items: Cart[];
	total: number;
	page: number;
	totalPages: number;
	searchQuery: string;
	selectedStatus: 'all' | 'in_warehouse' | 'deployed' | 'maintenance';
	selectedModelId: string;
	selectedGolfCourseId: string;
	sortBy: string;
	sortOrder: 'asc' | 'desc';
	selectedItems: Set<string>;
}

// Customer cart summary
export interface CustomerCartSummary {
	customerId: string;
	cartsByModel: {
		modelId: string;
		modelName: string;
		modelCode: string;
		count: number;
		carts: {
			id: string;
			serialNumber: string;
			deploymentDate: string;
			status: string;
		}[];
	}[];
	totalCarts: number;
}