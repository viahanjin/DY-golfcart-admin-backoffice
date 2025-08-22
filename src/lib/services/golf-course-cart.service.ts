import { apiService } from './api.service';
import type { 
    GolfCourseCart, 
    AddCartInput, 
    CartListParams,
    CartStats 
} from '$lib/types/golf-course-cart';
import type { CartModel } from '$lib/types/cart-model';

export interface GolfCourseCartResponse {
    items: GolfCourseCart[];
    total: number;
    stats: CartStats;
}

export interface CartModelsResponse {
    items: CartModel[];
    total: number;
}

export const golfCourseCartService = {
    /**
     * 골프장별 카트 목록 조회
     */
    async getGolfCourseCarts(golfCourseId: string, params?: Omit<CartListParams, 'golfCourseId'>): Promise<GolfCourseCartResponse> {
        const searchParams = new URLSearchParams();
        
        if (params?.status && params.status !== 'all') {
            searchParams.append('status', params.status);
        }
        
        if (params?.modelId) {
            searchParams.append('modelId', params.modelId);
        }
        
        if (params?.search) {
            searchParams.append('search', params.search);
        }
        
        const queryString = searchParams.toString();
        const url = `/carts/golf-courses/${golfCourseId}/carts${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiService.get(url);
        
        if (!response.success) {
            throw new Error(response.message || '카트 목록을 불러오는데 실패했습니다.');
        }
        
        return response.data as GolfCourseCartResponse;
    },

    /**
     * 골프장에 카트 추가
     */
    async addCartToGolfCourse(golfCourseId: string, cartData: AddCartInput): Promise<GolfCourseCart> {
        const response = await apiService.post(`/carts/golf-courses/${golfCourseId}/carts`, cartData);
        
        if (!response.success) {
            throw new Error(response.message || '카트 추가에 실패했습니다.');
        }
        
        return response.data as GolfCourseCart;
    },

    /**
     * 카트 상태 업데이트
     */
    async updateCartStatus(golfCourseId: string, cartId: string, status: string): Promise<GolfCourseCart> {
        const response = await apiService.patch(`/carts/golf-courses/${golfCourseId}/carts/${cartId}/status`, {
            status
        });
        
        if (!response.success) {
            throw new Error(response.message || '카트 상태 업데이트에 실패했습니다.');
        }
        
        return response.data as GolfCourseCart;
    },

    /**
     * 골프장에서 카트 제거
     */
    async removeCartFromGolfCourse(golfCourseId: string, cartId: string): Promise<void> {
        const response = await apiService.delete(`/carts/golf-courses/${golfCourseId}/carts/${cartId}`);
        
        if (!response.success) {
            throw new Error(response.message || '카트 제거에 실패했습니다.');
        }
    },

    /**
     * 사용 가능한 카트 모델 목록 조회
     */
    async getAvailableCartModels(): Promise<CartModel[]> {
        const response = await apiService.get('/cart-models');
        
        if (!response.success) {
            throw new Error(response.message || '카트 모델 목록을 불러오는데 실패했습니다.');
        }
        
        return (response.data as CartModelsResponse).items;
    }
};