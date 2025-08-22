import { writable } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

export interface User {
	id: string;
	email: string;
	name: string;
	role: string;
}

export interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const initialState: AuthState = {
	user: null,
	accessToken: null,
	refreshToken: null,
	isAuthenticated: false,
	isLoading: false
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	// 로컬 스토리지에서 토큰 가져오기
	const getStoredTokens = () => {
		if (!browser) return { accessToken: null, refreshToken: null };
		
		try {
			const accessToken = localStorage.getItem('accessToken');
			const refreshToken = localStorage.getItem('refreshToken');
			return { accessToken, refreshToken };
		} catch {
			return { accessToken: null, refreshToken: null };
		}
	};

	// 토큰을 로컬 스토리지에 저장
	const storeTokens = (accessToken: string, refreshToken: string) => {
		if (!browser) return;
		
		try {
			localStorage.setItem('accessToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);
		} catch (error) {
			console.error('Failed to store tokens:', error);
		}
	};

	// 토큰 제거
	const clearTokens = () => {
		if (!browser) return;
		
		try {
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
		} catch (error) {
			console.error('Failed to clear tokens:', error);
		}
	};

	// API 호출 헬퍼
	const apiCall = async (endpoint: string, options: RequestInit = {}) => {
		const baseUrl = browser 
			? import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
			: 'http://localhost:8000';
		console.log('🔍 API Call Debug:', {
			endpoint,
			baseUrl,
			env: import.meta.env.VITE_API_BASE_URL,
			browser
		});
		const url = `${baseUrl}${endpoint}`;
		
		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			}
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
			throw new Error(error.detail || 'API call failed');
		}

		return response.json();
	};

	return {
		subscribe,

		// 초기화 (페이지 로드 시 호출)
		init: async () => {
			update(state => ({ ...state, isLoading: true }));

			const { accessToken, refreshToken } = getStoredTokens();
			
			if (accessToken && refreshToken) {
				try {
					// 현재 사용자 정보 가져오기
					const response = await apiCall('/api/auth/me', {
						headers: {
							'Authorization': `Bearer ${accessToken}`
						}
					});

					if (response.success) {
						update(state => ({
							...state,
							user: response.data,
							accessToken,
							refreshToken,
							isAuthenticated: true,
							isLoading: false
						}));
						return;
					}
				} catch (error) {
					console.log('Token validation failed, trying refresh...');
					
					// Access Token이 만료된 경우 Refresh Token으로 갱신 시도
					try {
						const refreshResponse = await apiCall('/api/auth/refresh', {
							method: 'POST',
							body: JSON.stringify({ refresh_token: refreshToken })
						});

						if (refreshResponse.success) {
							const newAccessToken = refreshResponse.data.accessToken;
							storeTokens(newAccessToken, refreshToken);

							// 다시 사용자 정보 가져오기
							const userResponse = await apiCall('/api/auth/me', {
								headers: {
									'Authorization': `Bearer ${newAccessToken}`
								}
							});

							if (userResponse.success) {
								update(state => ({
									...state,
									user: userResponse.data,
									accessToken: newAccessToken,
									refreshToken,
									isAuthenticated: true,
									isLoading: false
								}));
								return;
							}
						}
					} catch (refreshError) {
						console.log('Refresh failed:', refreshError);
					}
				}
			}

			// 인증 실패 시 토큰 정리
			clearTokens();
			update(state => ({
				...initialState,
				isLoading: false
			}));
		},

		// 로그인
		login: async (email: string, password: string) => {
			update(state => ({ ...state, isLoading: true }));

			try {
				const response = await apiCall('/api/auth/login', {
					method: 'POST',
					body: JSON.stringify({ email, password })
				});

				if (response.success) {
					const { accessToken, refreshToken, user } = response.data;
					
					storeTokens(accessToken, refreshToken);
					
					update(state => ({
						...state,
						user,
						accessToken,
						refreshToken,
						isAuthenticated: true,
						isLoading: false
					}));

					return { success: true };
				}
			} catch (error) {
				update(state => ({ ...state, isLoading: false }));
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
			}
		},

		// 로그아웃
		logout: async () => {
			update(() => ({ ...initialState, isLoading: true }));

			try {
				await apiCall('/api/auth/logout', {
					method: 'POST'
				});
			} catch (error) {
				console.error('Logout API call failed:', error);
			} finally {
				clearTokens();
				update(() => ({
					...initialState,
					isLoading: false
				}));
				goto('/login');
			}
		},

		// 토큰 갱신
		refreshAccessToken: async () => {
			const { refreshToken } = getStoredTokens();
			
			if (!refreshToken) {
				throw new Error('No refresh token available');
			}

			try {
				const response = await apiCall('/api/auth/refresh', {
					method: 'POST',
					body: JSON.stringify({ refresh_token: refreshToken })
				});

				if (response.success) {
					const newAccessToken = response.data.accessToken;
					storeTokens(newAccessToken, refreshToken);

					update(state => ({
						...state,
						accessToken: newAccessToken
					}));

					return newAccessToken;
				}
			} catch (error) {
				console.error('Token refresh failed:', error);
				clearTokens();
				update(() => ({
					...initialState
				}));
				goto('/login');
				throw error;
			}
		}
	};
}

export const authStore = createAuthStore();