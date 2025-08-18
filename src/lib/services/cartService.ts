import { apiRequest } from './api';

// 카트 관련 API 서비스
export const cartService = {
	// 카트 목록 조회
	async getCarts() {
		// TODO: API 엔드포인트 연결
		// return await apiRequest('/carts');
		
		// 임시로 mock 데이터 반환
		const mockCarts = await import('$lib/mock/carts.json');
		return mockCarts.default;
	},

	// 카트 상세 조회
	async getCart(id: string) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/carts/${id}`);
		
		console.log('TODO: 카트 상세 조회 API 연결 - id:', id);
		return null;
	},

	// 카트 생성
	async createCart(cartData: any) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest('/carts', {
		//     method: 'POST',
		//     body: JSON.stringify(cartData)
		// });
		
		console.log('TODO: 카트 생성 API 연결 - cartData:', cartData);
		return { success: true, id: `CART-${Date.now()}` };
	},

	// 카트 수정
	async updateCart(id: string, cartData: any) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/carts/${id}`, {
		//     method: 'PUT',
		//     body: JSON.stringify(cartData)
		// });
		
		console.log('TODO: 카트 수정 API 연결 - id:', id, 'cartData:', cartData);
		return { success: true };
	},

	// 카트 삭제
	async deleteCart(id: string) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/carts/${id}`, {
		//     method: 'DELETE'
		// });
		
		console.log('TODO: 카트 삭제 API 연결 - id:', id);
		return { success: true };
	},

	// 카트 상태 업데이트
	async updateCartStatus(id: string, status: string) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/carts/${id}/status`, {
		//     method: 'PATCH',
		//     body: JSON.stringify({ status })
		// });
		
		console.log('TODO: 카트 상태 업데이트 API 연결 - id:', id, 'status:', status);
		return { success: true };
	},

	// 카트 배터리 상태 조회
	async getCartBatteryStatus(id: string) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/carts/${id}/battery`);
		
		console.log('TODO: 카트 배터리 상태 조회 API 연결 - id:', id);
		return { 
			level: 85, 
			isCharging: false, 
			estimatedHours: 6.5 
		};
	},

	// 카트 위치 추적
	async getCartLocation(id: string) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/carts/${id}/location`);
		
		console.log('TODO: 카트 위치 추적 API 연결 - id:', id);
		return { 
			latitude: 37.5665, 
			longitude: 126.9780, 
			lastUpdate: new Date().toISOString() 
		};
	}
};