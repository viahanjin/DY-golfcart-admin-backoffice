/**
 * 골프장 관리 API 서비스
 */

import { apiService, type ApiResponse } from './api.service';
import { apiConfig } from '$lib/config/api.config';
import type { GolfCourse, GolfCourseCreateInput, GolfCourseUpdateInput } from '$lib/types/golf-course';

export interface GolfCourseListParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: 'active' | 'inactive' | 'maintenance' | 'all';
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface GolfCourseListResponse {
	items: GolfCourse[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

class GolfCourseService {
	private endpoint = apiConfig.endpoints.golfCourses;

	/**
	 * 골프장 목록 조회
	 */
	async getList(params?: GolfCourseListParams): Promise<ApiResponse<GolfCourseListResponse>> {
		try {
			const defaultParams = {
				page: 1,
				limit: 20,
				sortBy: 'createdAt',
				sortOrder: 'desc',
				...params
			};

			// status가 'all'인 경우 파라미터에서 제거
			if (defaultParams.status === 'all') {
				delete defaultParams.status;
			}

			return await apiService.get<GolfCourseListResponse>(this.endpoint, defaultParams);
		} catch (error) {
			console.error('Failed to fetch golf courses:', error);
			return {
				success: false,
				error: {
					code: 'FETCH_ERROR',
					message: '골프장 목록을 불러오는데 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 골프장 상세 조회
	 */
	async getById(id: string): Promise<ApiResponse<GolfCourse>> {
		try {
			return await apiService.get<GolfCourse>(`${this.endpoint}/${id}`);
		} catch (error) {
			console.error(`Failed to fetch golf course ${id}:`, error);
			return {
				success: false,
				error: {
					code: 'FETCH_ERROR',
					message: '골프장 정보를 불러오는데 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 골프장 생성
	 */
	async create(data: GolfCourseCreateInput): Promise<ApiResponse<GolfCourse>> {
		try {
			// 입력 데이터 검증
			const validationError = this.validateGolfCourseData(data);
			if (validationError) {
				return {
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: validationError
					}
				};
			}

			return await apiService.post<GolfCourse>(this.endpoint, data);
		} catch (error) {
			console.error('Failed to create golf course:', error);
			return {
				success: false,
				error: {
					code: 'CREATE_ERROR',
					message: '골프장 등록에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 골프장 수정
	 */
	async update(id: string, data: GolfCourseUpdateInput): Promise<ApiResponse<GolfCourse>> {
		try {
			// 입력 데이터 검증
			const validationError = this.validateGolfCourseData(data, true);
			if (validationError) {
				return {
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: validationError
					}
				};
			}

			return await apiService.put<GolfCourse>(`${this.endpoint}/${id}`, data);
		} catch (error) {
			console.error(`Failed to update golf course ${id}:`, error);
			return {
				success: false,
				error: {
					code: 'UPDATE_ERROR',
					message: '골프장 정보 수정에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 골프장 삭제
	 */
	async delete(id: string): Promise<ApiResponse<void>> {
		try {
			return await apiService.delete<void>(`${this.endpoint}/${id}`);
		} catch (error) {
			console.error(`Failed to delete golf course ${id}:`, error);
			return {
				success: false,
				error: {
					code: 'DELETE_ERROR',
					message: '골프장 삭제에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 골프장 상태 변경
	 */
	async updateStatus(
		id: string, 
		status: 'active' | 'inactive' | 'maintenance'
	): Promise<ApiResponse<GolfCourse>> {
		try {
			return await apiService.patch<GolfCourse>(`${this.endpoint}/${id}/status`, { status });
		} catch (error) {
			console.error(`Failed to update golf course status ${id}:`, error);
			return {
				success: false,
				error: {
					code: 'UPDATE_ERROR',
					message: '골프장 상태 변경에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 골프장 코드 중복 확인
	 */
	async checkCodeDuplicate(code: string): Promise<ApiResponse<{ isDuplicate: boolean }>> {
		try {
			return await apiService.get<{ isDuplicate: boolean }>(
				`${this.endpoint}/check-code`,
				{ code }
			);
		} catch (error) {
			console.error('Failed to check code duplicate:', error);
			return {
				success: false,
				error: {
					code: 'CHECK_ERROR',
					message: '코드 중복 확인에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 골프장명 중복 확인
	 */
	async checkNameDuplicate(name: string): Promise<ApiResponse<{ isDuplicate: boolean }>> {
		try {
			return await apiService.get<{ isDuplicate: boolean }>(
				`${this.endpoint}/check-name`,
				{ name }
			);
		} catch (error) {
			console.error('Failed to check name duplicate:', error);
			return {
				success: false,
				error: {
					code: 'CHECK_ERROR',
					message: '골프장명 중복 확인에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 골프장 코드 자동 생성
	 */
	async generateCode(): Promise<ApiResponse<{ code: string }>> {
		try {
			return await apiService.get<{ code: string }>(`${this.endpoint}/generate-code`);
		} catch (error) {
			console.error('Failed to generate code:', error);
			return {
				success: false,
				error: {
					code: 'GENERATE_ERROR',
					message: '코드 자동 생성에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 일괄 삭제
	 */
	async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
		try {
			return await apiService.post<void>(`${this.endpoint}/bulk-delete`, { ids });
		} catch (error) {
			console.error('Failed to bulk delete golf courses:', error);
			return {
				success: false,
				error: {
					code: 'DELETE_ERROR',
					message: '일괄 삭제에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 엑셀 내보내기
	 */
	async exportToExcel(params?: GolfCourseListParams): Promise<ApiResponse<Blob>> {
		try {
			const response = await apiService.get<Blob>(
				`${this.endpoint}/export`,
				{ ...params, format: 'excel' }
			);
			
			if (response.success && response.data) {
				// 파일 다운로드 처리
				const blob = new Blob([response.data], { 
					type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
				});
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `golf-courses-${new Date().toISOString().split('T')[0]}.xlsx`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			}
			
			return response;
		} catch (error) {
			console.error('Failed to export golf courses:', error);
			return {
				success: false,
				error: {
					code: 'EXPORT_ERROR',
					message: '엑셀 내보내기에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 데이터 검증
	 */
	private validateGolfCourseData(
		data: GolfCourseCreateInput | GolfCourseUpdateInput,
		isUpdate: boolean = false
	): string | null {
		// 필수 필드 검증 (생성 시에만)
		if (!isUpdate) {
			if (!data.courseName?.trim()) {
				return '골프장명을 입력해주세요.';
			}
			if (!data.courseCode?.trim()) {
				return '골프장 코드를 입력해주세요.';
			}
			if (!data.contact?.phone?.trim()) {
				return '대표 전화번호를 입력해주세요.';
			}
			if (!data.contact?.email?.trim()) {
				return '이메일을 입력해주세요.';
			}
		}

		// 이메일 형식 검증
		if (data.contact?.email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(data.contact.email)) {
				return '올바른 이메일 형식이 아닙니다.';
			}
		}

		// 전화번호 형식 검증
		if (data.contact?.phone) {
			const phoneRegex = /^[\d-]+$/;
			if (!phoneRegex.test(data.contact.phone)) {
				return '전화번호는 숫자와 하이픈(-)만 입력 가능합니다.';
			}
		}

		// 위도/경도 범위 검증
		if (data.location) {
			if (data.location.latitude !== undefined) {
				if (data.location.latitude < -90 || data.location.latitude > 90) {
					return '위도는 -90도에서 90도 사이여야 합니다.';
				}
			}
			if (data.location.longitude !== undefined) {
				if (data.location.longitude < -180 || data.location.longitude > 180) {
					return '경도는 -180도에서 180도 사이여야 합니다.';
				}
			}
		}

		// 최대 속도 검증
		if (data.operation?.cartPolicy?.maxSpeed !== undefined) {
			if (data.operation.cartPolicy.maxSpeed < 5 || data.operation.cartPolicy.maxSpeed > 30) {
				return '최대 운행 속도는 5km/h에서 30km/h 사이여야 합니다.';
			}
		}

		return null;
	}
}

// 싱글톤 인스턴스
export const golfCourseService = new GolfCourseService();