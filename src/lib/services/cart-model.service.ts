import { apiService } from './api.service';
import { apiConfig } from '$lib/config/api.config';
import type { CartModel, CreateCartModelRequest, UpdateCartModelRequest } from '$lib/types/cart-model';

export interface CartModelListResponse {
	items: CartModel[];
	total: number;
	page: number;
	totalPages: number;
}

export class CartModelService {
	private endpoint = apiConfig.endpoints.cartModels;

	async getCartModels(params?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	}): Promise<CartModelListResponse> {
		try {
			console.log('🔍 Fetching cart models with params:', params);
			
			const response = await apiService.get<CartModelListResponse>(this.endpoint, params);
			
			if (!response.success) {
				throw new Error(response.message || '카트 모델 목록을 불러오는데 실패했습니다.');
			}
			
			console.log('✅ Cart models loaded:', response.data);
			return response.data!;
		} catch (error) {
			console.error('❌ Error fetching cart models:', error);
			throw error instanceof Error ? error : new Error('카트 모델 목록을 불러오는데 실패했습니다.');
		}
	}

	async getCartModel(id: string): Promise<CartModel> {
		try {
			console.log('🔍 Fetching cart model:', id);
			
			const response = await apiService.get<CartModel>(`${this.endpoint}/${id}`);
			
			if (!response.success) {
				throw new Error(response.message || '카트 모델을 불러오는데 실패했습니다.');
			}
			
			console.log('✅ Cart model loaded:', response.data);
			return response.data!;
		} catch (error) {
			console.error('❌ Error fetching cart model:', error);
			throw error instanceof Error ? error : new Error('카트 모델을 불러오는데 실패했습니다.');
		}
	}

	async createCartModel(data: CreateCartModelRequest): Promise<CartModel> {
		try {
			console.log('📝 Creating cart model:', data);
			
			const response = await apiService.post<CartModel>(this.endpoint, data);
			
			if (!response.success) {
				throw new Error(response.message || '카트 모델 생성에 실패했습니다.');
			}
			
			console.log('✅ Cart model created:', response.data);
			return response.data!;
		} catch (error) {
			console.error('❌ Error creating cart model:', error);
			throw error instanceof Error ? error : new Error('카트 모델 생성에 실패했습니다.');
		}
	}

	async updateCartModel(id: string, data: UpdateCartModelRequest): Promise<CartModel> {
		try {
			console.log('📝 Updating cart model:', id, data);
			
			const response = await apiService.put<CartModel>(`${this.endpoint}/${id}`, data);
			
			if (!response.success) {
				throw new Error(response.message || '카트 모델 수정에 실패했습니다.');
			}
			
			console.log('✅ Cart model updated:', response.data);
			return response.data!;
		} catch (error) {
			console.error('❌ Error updating cart model:', error);
			throw error instanceof Error ? error : new Error('카트 모델 수정에 실패했습니다.');
		}
	}

	async deleteCartModel(id: string): Promise<void> {
		try {
			console.log('🗑️ Deleting cart model:', id);
			
			const response = await apiService.delete<void>(`${this.endpoint}/${id}`);
			
			if (!response.success) {
				throw new Error(response.message || '카트 모델 삭제에 실패했습니다.');
			}
			
			console.log('✅ Cart model deleted:', id);
		} catch (error) {
			console.error('❌ Error deleting cart model:', error);
			throw error instanceof Error ? error : new Error('카트 모델 삭제에 실패했습니다.');
		}
	}

	async bulkDeleteCartModels(ids: string[]): Promise<void> {
		try {
			console.log('🗑️ Bulk deleting cart models:', ids);
			
			const response = await apiService.post<void>(`${this.endpoint}/bulk-delete`, { ids });
			
			if (!response.success) {
				throw new Error(response.message || '카트 모델 일괄 삭제에 실패했습니다.');
			}
			
			console.log('✅ Cart models bulk deleted:', ids);
		} catch (error) {
			console.error('❌ Error bulk deleting cart models:', error);
			throw error instanceof Error ? error : new Error('카트 모델 일괄 삭제에 실패했습니다.');
		}
	}
}

export const cartModelService = new CartModelService();