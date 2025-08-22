/**
 * 골프장별 카트 관리 타입 정의
 */

export interface GolfCourseCart {
	id: string;
	golfCourseId: string;
	cartNumber: string; // 카트 번호 (예: CART-001)
	serialNumber: string; // 일련번호
	modelId: string; // 카트 모델 ID
	modelName: string; // 카트 모델명
	status: CartStatus;
	deployedAt: string; // 배치일
	lastMaintenanceAt?: string; // 마지막 점검일
	notes?: string; // 비고
	createdAt: string;
	updatedAt: string;
}

export type CartStatus = 'active' | 'maintenance' | 'broken' | 'inactive';

export interface CartStatusInfo {
	status: CartStatus;
	label: string;
	color: string;
	bgColor: string;
}

export const CART_STATUS_MAP: Record<CartStatus, CartStatusInfo> = {
	active: {
		status: 'active',
		label: '운영중',
		color: 'text-green-800 dark:text-green-200',
		bgColor: 'bg-green-100 dark:bg-green-900/20'
	},
	maintenance: {
		status: 'maintenance',
		label: '점검중',
		color: 'text-yellow-800 dark:text-yellow-200',
		bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
	},
	broken: {
		status: 'broken',
		label: '고장',
		color: 'text-red-800 dark:text-red-200',
		bgColor: 'bg-red-100 dark:bg-red-900/20'
	},
	inactive: {
		status: 'inactive',
		label: '비활성',
		color: 'text-gray-800 dark:text-gray-200',
		bgColor: 'bg-gray-100 dark:bg-gray-900/20'
	}
};

// 카트 추가 시 입력 데이터
export interface AddCartInput {
	cartNumber: string;
	serialNumber: string;
	modelId: string;
	notes?: string;
}

// 카트 수정 시 입력 데이터
export interface UpdateCartInput {
	cartNumber?: string;
	serialNumber?: string;
	status?: CartStatus;
	notes?: string;
}

// 카트 목록 조회 파라미터
export interface CartListParams {
	golfCourseId: string;
	status?: CartStatus | 'all';
	modelId?: string;
	search?: string;
}

// 카트 통계
export interface CartStats {
	total: number;
	active: number;
	maintenance: number;
	broken: number;
	inactive: number;
}