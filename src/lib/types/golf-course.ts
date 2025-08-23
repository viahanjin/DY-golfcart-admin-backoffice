/**
 * 골프장 관련 타입 정의
 */

export interface GolfCourse {
	id: string;
	name: string;
	address: string;
	postalCode: string;
	phone: string;
	email: string;
	status: 'ACTIVE' | 'INACTIVE';
	coursesCount: number;
	cartsCount: number;
	location: {
		latitude: number;
		longitude: number;
	};
	operatingHours: {
		weekday: string;
		weekend: string;
	};
	createdAt: string;
	updatedAt: string;
}

export type GolfCourseCreateInput = Omit<GolfCourse, 'id' | 'createdAt' | 'updatedAt'>;
export type GolfCourseUpdateInput = Partial<GolfCourseCreateInput>;