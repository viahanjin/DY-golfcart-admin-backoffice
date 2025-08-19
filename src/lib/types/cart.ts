export interface Cart {
	id: string;
	cartNumber: string;
	modelName: string;
	manufacturer: string;
	golfCourseId: string;
	golfCourseName: string;
	status: 'AVAILABLE' | 'IN_USE' | 'CHARGING' | 'MAINTENANCE';
	batteryLevel: number;
	batteryStatus: string;
	isCharging: boolean;
	lastMaintenance: string;
	nextMaintenance: string;
	currentLocation: {
		latitude: number;
		longitude: number;
		course: string;
		hole: number;
	};
	usageStats: {
		totalDistance: number;
		totalHours: number;
		todayDistance: number;
		todayHours: number;
	};
	createdAt: string;
	updatedAt: string;
}

export type CartCreateInput = Omit<Cart, 'id'>;
export type CartUpdateInput = Partial<CartCreateInput>;
