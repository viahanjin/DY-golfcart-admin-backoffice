export interface Cart {
	id: string;
	cartName: string;
	modelYear: string;
	manufacturer: string;
	assignedGolfCourseId: string;
	hardware: { mcu: boolean; vcu: boolean; vpu: boolean; acu: boolean };
	sensors: string[];
	capabilities: {
		supportedModes: string[];
		maxSpeed: number;
		battery: { type: string; capacity: string; expectedHours: number };
	};
	network: { macAddress: string; ip: string; isStatic: boolean };
	mqtt: { clientId: string; qos: number };
	cartStatus: {
		currentState: 'available' | 'maintenance' | 'broken' | 'unavailable';
		lastInspection: string;
		nextInspection: string;
	};
}

export type CartCreateInput = Omit<Cart, 'id'>;
export type CartUpdateInput = Partial<CartCreateInput>;
