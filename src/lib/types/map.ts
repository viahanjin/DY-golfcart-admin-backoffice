export interface MapData {
	mapId: string;
	mapName: string;
	connectedGolfCourseId: string;
	golfCourseName?: string;
	version: string;
	createdAt: string;
	updatedAt: string;
	mapStatus: {
		status: 'active' | 'testing' | 'inactive';
		validationStatus: 'verified' | 'pending' | 'failed';
	};
	mapData: {
		resolution: string;
		size: string;
		originGps: { latitude: number; longitude: number };
		rotation: number;
	};
	mapFiles: { imageFile: string; metadataFile: string };
	courseInfo: { totalCourses: number; defaultMode: string; defaultSpeedLimit: number };
}

export type MapCreateInput = Omit<MapData, 'mapId' | 'createdAt' | 'updatedAt'>;
export type MapUpdateInput = Partial<MapCreateInput>;
