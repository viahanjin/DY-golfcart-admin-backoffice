/**
 * 공통 API 서비스
 * 모든 API 호출을 위한 기본 서비스 레이어
 */

import { apiConfig } from '$lib/config/api.config';

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: ApiError;
	message?: string;
	url?: unknown;
}

export interface ApiError {
	code: string;
	message: string;
	details?: unknown;
}

export interface RequestOptions extends RequestInit {
	params?: Record<string, string | number | boolean>;
	timeout?: number;
}

class ApiService {
	private abortControllers: Map<string, AbortController> = new Map();

	/**
	 * 공통 HTTP 요청 처리
	 */
	private async request<T>(
		endpoint: string,
		options: RequestOptions = {}
	): Promise<ApiResponse<T>> {
		const { params, timeout = apiConfig.timeout, ...fetchOptions } = options;

		// URL 생성 - API prefix 자동 추가
		const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
		const url = new URL(`${apiConfig.baseURL}${apiEndpoint}`);
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					url.searchParams.append(key, String(value));
				}
			});
		}

		// 이전 요청 취소 (동일한 엔드포인트)
		const requestKey = `${fetchOptions.method || 'GET'}_${endpoint}`;
		if (this.abortControllers.has(requestKey)) {
			this.abortControllers.get(requestKey)?.abort();
		}

		// 새로운 AbortController 생성
		const abortController = new AbortController();
		this.abortControllers.set(requestKey, abortController);

		// 타임아웃 설정
		const timeoutId = setTimeout(() => abortController.abort(), timeout);

		try {
			// 기본 헤더 설정
			const headers = new Headers(fetchOptions.headers);
			if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
				headers.set('Content-Type', 'application/json');
			}

			// 토큰 추가 (있는 경우)
			const token = this.getAuthToken();
			if (token) {
				headers.set('Authorization', `Bearer ${token}`);
			}

			const response = await fetch(url.toString(), {
				...fetchOptions,
				headers,
				signal: abortController.signal
			});

			clearTimeout(timeoutId);
			this.abortControllers.delete(requestKey);

			// 응답 처리
			if (!response.ok) {
				return await this.handleErrorResponse<T>(response);
			}

			const data = await response.json();
			return {
				success: true,
				data: data.data || data,
				message: data.message,
				url: data.url
			};
		} catch (error) {
			clearTimeout(timeoutId);
			this.abortControllers.delete(requestKey);

			if (error instanceof Error) {
				if (error.name === 'AbortError') {
					return {
						success: false,
						error: {
							code: 'TIMEOUT',
							message: '요청 시간이 초과되었습니다.'
						}
					};
				}

				return {
					success: false,
					error: {
						code: 'NETWORK_ERROR',
						message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
					}
				};
			}

			return {
				success: false,
				error: {
					code: 'UNKNOWN_ERROR',
					message: '알 수 없는 오류가 발생했습니다.'
				}
			};
		}
	}

	/**
	 * 에러 응답 처리
	 */
	private async handleErrorResponse<T>(response: Response): Promise<ApiResponse<T>> {
		try {
			const errorData = await response.json();

			// 401 Unauthorized - 토큰 만료 또는 인증 실패
			if (response.status === 401) {
				this.clearAuthToken();
				// 로그인 페이지로 리다이렉트 (SvelteKit에서는 goto 사용)
				if (typeof window !== 'undefined') {
					window.location.href = '/login';
				}
			}

			return {
				success: false,
				error: {
					code: errorData.code || `HTTP_${response.status}`,
					message: errorData.message || this.getDefaultErrorMessage(response.status),
					details: errorData.details
				}
			};
		} catch {
			return {
				success: false,
				error: {
					code: `HTTP_${response.status}`,
					message: this.getDefaultErrorMessage(response.status)
				}
			};
		}
	}

	/**
	 * 기본 에러 메시지
	 */
	private getDefaultErrorMessage(status: number): string {
		const messages: Record<number, string> = {
			400: '잘못된 요청입니다.',
			401: '인증이 필요합니다.',
			403: '권한이 없습니다.',
			404: '요청한 리소스를 찾을 수 없습니다.',
			409: '중복된 데이터가 존재합니다.',
			422: '입력한 데이터가 올바르지 않습니다.',
			429: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
			500: '서버 오류가 발생했습니다.',
			502: '게이트웨이 오류가 발생했습니다.',
			503: '서비스를 일시적으로 사용할 수 없습니다.',
			504: '게이트웨이 시간이 초과되었습니다.'
		};

		return messages[status] || `오류가 발생했습니다. (${status})`;
	}

	/**
	 * 인증 토큰 관리
	 */
	private getAuthToken(): string | null {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('accessToken');
		}
		return null;
	}

	private setAuthToken(token: string): void {
		if (typeof window !== 'undefined') {
			localStorage.setItem('accessToken', token);
		}
	}

	private clearAuthToken(): void {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
		}
	}

	/**
	 * HTTP 메서드별 함수
	 */
	async get<T>(
		endpoint: string,
		params?: Record<string, string | number | boolean>
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'GET',
			params
		});
	}

	async post<T>(
		endpoint: string,
		data?: unknown,
		options?: RequestOptions
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			...options,
			method: 'POST',
			body: data instanceof FormData ? data : JSON.stringify(data)
		});
	}

	async put<T>(
		endpoint: string,
		data?: unknown,
		options?: RequestOptions
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			...options,
			method: 'PUT',
			body: data instanceof FormData ? data : JSON.stringify(data)
		});
	}

	async patch<T>(
		endpoint: string,
		data?: unknown,
		options?: RequestOptions
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			...options,
			method: 'PATCH',
			body: data instanceof FormData ? data : JSON.stringify(data)
		});
	}

	async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			...options,
			method: 'DELETE'
		});
	}

	/**
	 * 파일 업로드
	 */
	async upload<T>(
		endpoint: string,
		file: File,
		additionalData?: Record<string, string>
	): Promise<ApiResponse<T>> {
		const formData = new FormData();
		formData.append('file', file);

		if (additionalData) {
			Object.entries(additionalData).forEach(([key, value]) => {
				formData.append(key, value);
			});
		}

		return this.post<T>(endpoint, formData);
	}

	/**
	 * 진행 중인 요청 취소
	 */
	cancelRequest(endpoint: string, method: string = 'GET'): void {
		const requestKey = `${method}_${endpoint}`;
		this.abortControllers.get(requestKey)?.abort();
		this.abortControllers.delete(requestKey);
	}

	/**
	 * 모든 진행 중인 요청 취소
	 */
	cancelAllRequests(): void {
		this.abortControllers.forEach((controller) => controller.abort());
		this.abortControllers.clear();
	}
}

// 싱글톤 인스턴스
export const apiService = new ApiService();
