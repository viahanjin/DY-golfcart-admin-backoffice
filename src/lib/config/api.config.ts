/**
 * API 설정 파일
 * 환경변수 또는 설정 파일을 통해 엔드포인트를 쉽게 변경할 수 있습니다.
 */

interface ApiConfig {
	baseURL: string;
	timeout: number;
	endpoints: {
		golfCourses: string;
		carts: string;
		courses: string;
		maps: string;
		users: string;
		auth: {
			login: string;
			logout: string;
			refresh: string;
		};
	};
}

// 환경변수에서 API URL을 가져오거나 기본값 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiConfig: ApiConfig = {
	baseURL: API_BASE_URL,
	timeout: 30000, // 30초
	endpoints: {
		golfCourses: '/golf-courses',
		carts: '/carts',
		courses: '/courses',
		maps: '/maps',
		users: '/users',
		auth: {
			login: '/auth/login',
			logout: '/auth/logout',
			refresh: '/auth/refresh'
		}
	}
};

// API 엔드포인트 빌더 헬퍼 함수
export function buildApiUrl(endpoint: string, params?: Record<string, any>): string {
	const url = new URL(`${apiConfig.baseURL}${endpoint}`);
	
	if (params) {
		Object.keys(params).forEach(key => {
			if (params[key] !== undefined && params[key] !== null) {
				url.searchParams.append(key, params[key].toString());
			}
		});
	}
	
	return url.toString();
}