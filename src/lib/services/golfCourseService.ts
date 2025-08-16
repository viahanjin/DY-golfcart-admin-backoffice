import { apiRequest } from './api';

// 골프장 관련 API 서비스
export const golfCourseService = {
	// 골프장 목록 조회
	async getGolfCourses() {
		// TODO: API 엔드포인트 연결
		// return await apiRequest('/golf-courses');
		
		// 임시로 mock 데이터 반환
		const mockGolfCourses = await import('$lib/mock/golf-courses.json');
		return mockGolfCourses.default;
	},

	// 골프장 상세 조회
	async getGolfCourse(id: string) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/golf-courses/${id}`);
		
		console.log('TODO: 골프장 상세 조회 API 연결 - id:', id);
		return null;
	},

	// 골프장 생성
	async createGolfCourse(golfCourseData: any) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest('/golf-courses', {
		//     method: 'POST',
		//     body: JSON.stringify(golfCourseData)
		// });
		
		console.log('TODO: 골프장 생성 API 연결 - golfCourseData:', golfCourseData);
		return { success: true, id: `GC-${Date.now()}` };
	},

	// 골프장 수정
	async updateGolfCourse(id: string, golfCourseData: any) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/golf-courses/${id}`, {
		//     method: 'PUT',
		//     body: JSON.stringify(golfCourseData)
		// });
		
		console.log('TODO: 골프장 수정 API 연결 - id:', id, 'golfCourseData:', golfCourseData);
		return { success: true };
	},

	// 골프장 삭제
	async deleteGolfCourse(id: string) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/golf-courses/${id}`, {
		//     method: 'DELETE'
		// });
		
		console.log('TODO: 골프장 삭제 API 연결 - id:', id);
		return { success: true };
	},

	// 골프장명 중복 확인
	async checkDuplicateName(name: string, excludeId?: string) {
		// TODO: API 엔드포인트 연결
		// const params = new URLSearchParams({ name });
		// if (excludeId) params.append('excludeId', excludeId);
		// return await apiRequest(`/golf-courses/check-duplicate?${params}`);
		
		console.log('TODO: 골프장명 중복 확인 API 연결 - name:', name, 'excludeId:', excludeId);
		return { isDuplicate: false };
	},

	// 우편번호로 주소 검색
	async searchAddress(postalCode: string) {
		// TODO: API 엔드포인트 연결 (또는 외부 API 사용)
		// return await apiRequest(`/address/search?postalCode=${postalCode}`);
		
		console.log('TODO: 우편번호 주소 검색 API 연결 - postalCode:', postalCode);
		return { 
			address: '서울특별시 강남구 테헤란로',
			detailAddress: '',
			latitude: 37.5665,
			longitude: 126.9780
		};
	},

	// 지도에서 위치 선택
	async selectLocationFromMap(latitude: number, longitude: number) {
		// TODO: 역지오코딩 API 연결
		// return await apiRequest(`/address/reverse-geocode?lat=${latitude}&lng=${longitude}`);
		
		console.log('TODO: 역지오코딩 API 연결 - lat:', latitude, 'lng:', longitude);
		return {
			address: '선택된 위치의 주소',
			postalCode: '12345'
		};
	}
};