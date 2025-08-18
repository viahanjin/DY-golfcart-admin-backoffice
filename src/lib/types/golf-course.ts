/**
 * 골프장 관련 타입 정의
 */

export interface GolfCourse {
	id: string;
	// 기본 정보
	courseName: string;
	courseNameEn: string;
	courseCode: string;
	address: Address;
	contact: Contact;
	
	// 위치 정보
	location: Location;
	
	// 운영 정보
	operation: Operation;
	
	// 지형 및 환경 정보
	environment: Environment;
	
	// 시스템 정보
	totalCarts: number;
	activeCarts: number;
	status: 'active' | 'inactive' | 'maintenance';
	lastModified: string;
	createdAt: string;
}

export interface Address {
	zipcode: string;
	address1: string;
	address2: string;
}

export interface Contact {
	phone: string;
	fax?: string;
	email: string;
}

export interface Location {
	latitude: number;
	longitude: number;
	altitude?: number;
	coordinateSystem: 'WGS84' | 'UTM-K';
	rtk?: RTKInfo;
}

export interface RTKInfo {
	baseLatitude: number;
	baseLongitude: number;
	provider: string;
}

export interface Operation {
	totalHoles: 9 | 18 | 27 | 36;
	operatingHours: {
		summer: string;
		winter: string;
	};
	closedDays: string;
	cartPolicy: CartPolicy;
}

export interface CartPolicy {
	fairwayAccess: boolean;
	rainPolicy: string;
	maxSpeed: number; // km/h
}

export interface Environment {
	terrain: ('flat' | 'hilly' | 'mountainous')[];
	gpsShadedAreas: {
		count: number;
		locations: string;
	};
	specialNotes: string;
}

// 생성 시 입력 타입 (id와 시스템 필드 제외)
export type GolfCourseCreateInput = Omit<
	GolfCourse, 
	'id' | 'totalCarts' | 'activeCarts' | 'lastModified' | 'createdAt'
>;

// 수정 시 입력 타입 (모든 필드 선택적)
export type GolfCourseUpdateInput = Partial<GolfCourseCreateInput>;

// 검색 필터 타입
export interface GolfCourseFilter {
	search?: string;
	status?: 'active' | 'inactive' | 'maintenance' | 'all';
	minCarts?: number;
	maxCarts?: number;
	totalHoles?: number;
	terrain?: string[];
}

// 정렬 옵션
export interface GolfCourseSortOption {
	field: 'courseName' | 'courseCode' | 'createdAt' | 'lastModified' | 'totalCarts' | 'status';
	order: 'asc' | 'desc';
}