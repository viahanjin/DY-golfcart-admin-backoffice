export interface MapData {
	id: string;
	name: string;
	description: string;
	golfCourseId: string;
	golfCourseName: string;
	type: '3D' | '2D' | 'SATELLITE';
	version: string;
	imageUrl: string;
	thumbnailUrl: string;
	metadataUrl: string;
	bounds: {
		north: number;
		south: number;
		east: number;
		west: number;
	};
	layers: Array<{
		name: string;
		visible: boolean;
		type: string;
	}>;
	fileSize: number;
	resolution: string;
	createdAt: string;
	updatedAt: string;
}

export type MapCreateInput = Omit<MapData, 'id' | 'createdAt' | 'updatedAt'>;
export type MapUpdateInput = Partial<MapCreateInput>;
