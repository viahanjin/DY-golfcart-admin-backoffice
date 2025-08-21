/**
 * 카트 관리 API 서비스
 */

import { apiService, type ApiResponse } from './api.service';
import { apiConfig } from '$lib/config/api.config';

export interface Cart {
	id: string;
	cartNumber: string;
	modelName: string;
	manufacturer?: string;
	golfCourseId: string;
	golfCourseName?: string;
	status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'CHARGING';
	batteryLevel: number;
	batteryStatus: 'NORMAL' | 'LOW' | 'CRITICAL';
	isCharging: boolean;
	lastMaintenance?: string;
	nextMaintenance?: string;
	currentLocation?: {
		latitude: number;
		longitude: number;
		course?: string;
		hole?: number;
	};
	usageStats?: {
		totalDistance: number;
		totalHours: number;
		todayDistance: number;
		todayHours: number;
	};
	createdAt: string;
	updatedAt: string;
}

export interface CartCreateInput {
	cartNumber: string;
	modelName: string;
	manufacturer?: string;
	golfCourseId: string;
	manufacturingDate?: string;
	purchaseDate?: string;
	specifications?: {
		seatingCapacity?: number;
		maxSpeed?: number;
		weight?: number;
		dimensions?: {
			length: number;
			width: number;
			height: number;
		};
	};
	battery?: {
		voltage: number;
		capacity: number;
	};
}

export interface CartUpdateInput extends Partial<CartCreateInput> {}

export interface CartListParams {
	page?: number;
	limit?: number;
	golfCourseId?: string;
	status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'CHARGING';
	batteryLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface CartListResponse {
	items: Cart[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface BatteryStatus {
	cartId: string;
	level: number;
	voltage?: number;
	current?: number;
	temperature?: number;
	status: 'NORMAL' | 'LOW' | 'CRITICAL';
	isCharging: boolean;
	estimatedRange?: number;
	estimatedTime?: number;
	cycles?: number;
	health?: number;
	lastUpdate: string;
}

export interface LocationData {
	cartId: string;
	latitude: number;
	longitude: number;
	altitude?: number;
	speed?: number;
	heading?: number;
	course?: string;
	hole?: number;
	accuracy?: number;
	lastUpdate: string;
}

class CartService {
	private endpoint = apiConfig.endpoints.carts;

	/**
	 * 카트 목록 조회
	 */
	async getList(params?: CartListParams): Promise<ApiResponse<CartListResponse>> {
		try {
			const defaultParams = {
				page: 1,
				limit: 20,
				sortBy: 'createdAt',
				sortOrder: 'desc',
				...params
			};

			return await apiService.get<CartListResponse>(this.endpoint, defaultParams);
		} catch (error) {
			console.error('Failed to fetch carts:', error);
			return {
				success: false,
				error: {
					code: 'FETCH_ERROR',
					message: '카트 목록을 불러오는데 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 카트 상세 조회
	 */
	async getById(id: string): Promise<ApiResponse<Cart>> {
		try {
			return await apiService.get<Cart>(`${this.endpoint}/${id}`);
		} catch (error) {
			console.error('Failed to fetch cart:', error);
			return {
				success: false,
				error: {
					code: 'FETCH_ERROR',
					message: '카트 정보를 불러오는데 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 카트 생성
	 */
	async create(data: CartCreateInput): Promise<ApiResponse<Cart>> {
		try {
			return await apiService.post<Cart>(this.endpoint, data);
		} catch (error) {
			console.error('Failed to create cart:', error);
			return {
				success: false,
				error: {
					code: 'CREATE_ERROR',
					message: '카트 생성에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 카트 수정
	 */
	async update(id: string, data: CartUpdateInput): Promise<ApiResponse<Cart>> {
		try {
			return await apiService.put<Cart>(`${this.endpoint}/${id}`, data);
		} catch (error) {
			console.error('Failed to update cart:', error);
			return {
				success: false,
				error: {
					code: 'UPDATE_ERROR',
					message: '카트 수정에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 카트 삭제
	 */
	async delete(id: string): Promise<ApiResponse<void>> {
		try {
			return await apiService.delete<void>(`${this.endpoint}/${id}`);
		} catch (error) {
			console.error('Failed to delete cart:', error);
			return {
				success: false,
				error: {
					code: 'DELETE_ERROR',
					message: '카트 삭제에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 카트 상태 업데이트
	 */
	async updateStatus(id: string, status: Cart['status'], note?: string): Promise<ApiResponse<{ id: string; status: string; statusChangedAt: string }>> {
		try {
			return await apiService.patch(`${this.endpoint}/${id}/status`, { status, note });
		} catch (error) {
			console.error('Failed to update cart status:', error);
			return {
				success: false,
				error: {
					code: 'UPDATE_STATUS_ERROR',
					message: '카트 상태 업데이트에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 카트 배터리 상태 조회
	 */
	async getBatteryStatus(id: string): Promise<ApiResponse<BatteryStatus>> {
		try {
			return await apiService.get<BatteryStatus>(`${this.endpoint}/${id}/battery`);
		} catch (error) {
			console.error('Failed to fetch battery status:', error);
			return {
				success: false,
				error: {
					code: 'FETCH_BATTERY_ERROR',
					message: '배터리 상태를 불러오는데 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 카트 위치 조회
	 */
	async getLocation(id: string): Promise<ApiResponse<LocationData>> {
		try {
			return await apiService.get<LocationData>(`${this.endpoint}/${id}/location`);
		} catch (error) {
			console.error('Failed to fetch location:', error);
			return {
				success: false,
				error: {
					code: 'FETCH_LOCATION_ERROR',
					message: '위치 정보를 불러오는데 실패했습니다.'
				}
			};
		}
	}
}

// 싱글톤 인스턴스 생성 및 내보내기
export const cartService = new CartService();