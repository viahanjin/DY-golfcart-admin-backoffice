/**
 * 맵 관리 API 서비스
 */

import { apiService, type ApiResponse } from './api.service';
import { apiConfig } from '$lib/config/api.config';

export interface Map {
	id: string;
	name: string;
	description?: string;
	golfCourseId: string;
	golfCourseName?: string;
	type: '2D' | '3D' | 'SATELLITE';
	version?: string;
	imageUrl?: string;
	thumbnailUrl?: string;
	metadataUrl?: string;
	bounds?: {
		north: number;
		south: number;
		east: number;
		west: number;
		center?: {
			latitude: number;
			longitude: number;
		};
	};
	layers?: Array<{
		id?: string;
		name: string;
		type: 'polygon' | 'line' | 'point' | 'raster';
		visible: boolean;
		style?: any;
		features?: number;
	}>;
	fileSize?: number;
	resolution?: string;
	createdAt: string;
	updatedAt: string;
}

export interface MapCreateInput {
	name: string;
	description?: string;
	golfCourseId: string;
	type: '2D' | '3D' | 'SATELLITE';
	bounds: {
		north: number;
		south: number;
		east: number;
		west: number;
	};
}

export interface MapUpdateInput {
	name?: string;
	description?: string;
	version?: string;
}

export interface MapListParams {
	page?: number;
	limit?: number;
	golfCourseId?: string;
	type?: '2D' | '3D' | 'SATELLITE';
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface MapListResponse {
	items: Map[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface FileUploadResponse {
	url: string;
	thumbnailUrl?: string;
	filename: string;
	size: number;
	mimeType: string;
	resolution?: string;
}

export interface MetadataUploadResponse {
	folderPath: string;
	fileCount: number;
	jsonFileCount: number;
	totalSize: number;
	files: Array<{
		name: string;
		path: string;
		size: number;
	}>;
}

class MapService {
	private endpoint = apiConfig.endpoints.maps;

	/**
	 * 맵 목록 조회
	 */
	async getList(params?: MapListParams): Promise<ApiResponse<MapListResponse>> {
		try {
			const defaultParams = {
				page: 1,
				limit: 20,
				sortBy: 'createdAt',
				sortOrder: 'desc',
				...params
			};

			return await apiService.get<MapListResponse>(this.endpoint, defaultParams);
		} catch (error) {
			console.error('Failed to fetch maps:', error);
			return {
				success: false,
				error: {
					code: 'FETCH_ERROR',
					message: '맵 목록을 불러오는데 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 맵 상세 조회
	 */
	async getById(id: string): Promise<ApiResponse<Map>> {
		try {
			return await apiService.get<Map>(`${this.endpoint}/${id}`);
		} catch (error) {
			console.error('Failed to fetch map:', error);
			return {
				success: false,
				error: {
					code: 'FETCH_ERROR',
					message: '맵 정보를 불러오는데 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 맵 생성
	 */
	async create(data: MapCreateInput): Promise<ApiResponse<Map>> {
		try {
			return await apiService.post<Map>(this.endpoint, data);
		} catch (error) {
			console.error('Failed to create map:', error);
			return {
				success: false,
				error: {
					code: 'CREATE_ERROR',
					message: '맵 생성에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 맵 수정
	 */
	async update(id: string, data: MapUpdateInput): Promise<ApiResponse<Map>> {
		try {
			return await apiService.put<Map>(`${this.endpoint}/${id}`, data);
		} catch (error) {
			console.error('Failed to update map:', error);
			return {
				success: false,
				error: {
					code: 'UPDATE_ERROR',
					message: '맵 수정에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 맵 삭제
	 */
	async delete(id: string): Promise<ApiResponse<void>> {
		try {
			return await apiService.delete<void>(`${this.endpoint}/${id}`);
		} catch (error) {
			console.error('Failed to delete map:', error);
			return {
				success: false,
				error: {
					code: 'DELETE_ERROR',
					message: '맵 삭제에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 이미지 파일 업로드
	 */
	async uploadImageFile(file: File, mapId?: string): Promise<ApiResponse<FileUploadResponse>> {
		try {
			const formData = new FormData();
			formData.append('image', file);
			if (mapId) formData.append('mapId', mapId);

			return await apiService.post<FileUploadResponse>(`${this.endpoint}/upload-image`, formData);
		} catch (error) {
			console.error('Failed to upload image:', error);
			return {
				success: false,
				error: {
					code: 'UPLOAD_ERROR',
					message: '이미지 업로드에 실패했습니다.'
				}
			};
		}
	}

	/**
	 * 메타데이터 폴더 업로드
	 */
	async uploadMetadataFolder(files: File[], mapId?: string): Promise<ApiResponse<MetadataUploadResponse>> {
		try {
			const formData = new FormData();
			
			// 폴더 내 모든 파일을 FormData에 추가
			files.forEach((file, index) => {
				// 폴더 구조가 있는 경우 webkitRelativePath를 파일명으로 사용
				const fileWithPath = new File([file], file.webkitRelativePath || file.name, {
					type: file.type,
					lastModified: file.lastModified
				});
				
				formData.append('metadata_files', fileWithPath);
				console.log(`파일 ${index}: ${file.name} -> ${file.webkitRelativePath || file.name}`);
			});
			
			if (mapId) formData.append('mapId', mapId);

			return await apiService.post<MetadataUploadResponse>(`${this.endpoint}/upload-metadata`, formData);
		} catch (error) {
			console.error('Failed to upload metadata:', error);
			return {
				success: false,
				error: {
					code: 'UPLOAD_ERROR',
					message: '메타데이터 업로드에 실패했습니다.'
				}
			};
		}
	}
}

// 싱글톤 인스턴스 생성 및 내보내기
export const mapService = new MapService();