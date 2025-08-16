// API 서비스 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// API 요청 헬퍼 함수
async function apiRequest(endpoint: string, options: RequestInit = {}) {
	const url = `${API_BASE_URL}${endpoint}`;
	
	const defaultOptions: RequestInit = {
		headers: {
			'Content-Type': 'application/json',
			// TODO: 인증 토큰 추가
			// 'Authorization': `Bearer ${getAuthToken()}`
		},
		...options
	};

	try {
		const response = await fetch(url, defaultOptions);
		
		if (!response.ok) {
			throw new Error(`API Error: ${response.status} ${response.statusText}`);
		}
		
		return await response.json();
	} catch (error) {
		console.error('API 요청 실패:', error);
		throw error;
	}
}

// 파일 업로드용 API 요청 헬퍼
async function apiUpload(endpoint: string, formData: FormData) {
	const url = `${API_BASE_URL}${endpoint}`;
	
	try {
		const response = await fetch(url, {
			method: 'POST',
			// Content-Type 헤더는 자동으로 설정됨 (multipart/form-data)
			headers: {
				// TODO: 인증 토큰 추가
				// 'Authorization': `Bearer ${getAuthToken()}`
			},
			body: formData
		});
		
		if (!response.ok) {
			throw new Error(`Upload Error: ${response.status} ${response.statusText}`);
		}
		
		return await response.json();
	} catch (error) {
		console.error('파일 업로드 실패:', error);
		throw error;
	}
}

export { apiRequest, apiUpload, API_BASE_URL };