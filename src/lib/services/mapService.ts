import { apiRequest, apiUpload } from './api';

// 맵 관련 API 서비스
export const mapService = {
	// 맵 목록 조회
	async getMaps() {
		// TODO: API 엔드포인트 연결
		// return await apiRequest('/maps');
		
		// 임시로 mock 데이터 반환
		const mockMaps = await import('$lib/mock/maps.json');
		return mockMaps.default;
	},

	// 맵 상세 조회
	async getMap(mapId: string) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/maps/${mapId}`);
		
		console.log('TODO: 맵 상세 조회 API 연결 - mapId:', mapId);
		return null;
	},

	// 맵 생성
	async createMap(mapData: any) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest('/maps', {
		//     method: 'POST',
		//     body: JSON.stringify(mapData)
		// });
		
		console.log('TODO: 맵 생성 API 연결 - mapData:', mapData);
		return { success: true, id: `MAP-${Date.now()}` };
	},

	// 맵 수정
	async updateMap(mapId: string, mapData: any) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/maps/${mapId}`, {
		//     method: 'PUT',
		//     body: JSON.stringify(mapData)
		// });
		
		console.log('TODO: 맵 수정 API 연결 - mapId:', mapId, 'mapData:', mapData);
		return { success: true };
	},

	// 맵 삭제
	async deleteMap(mapId: string) {
		// TODO: API 엔드포인트 연결
		// return await apiRequest(`/maps/${mapId}`, {
		//     method: 'DELETE'
		// });
		
		console.log('TODO: 맵 삭제 API 연결 - mapId:', mapId);
		return { success: true };
	},

	// 이미지 파일 업로드
	async uploadImageFile(file: File, mapId?: string) {
		// TODO: API 엔드포인트 연결
		const formData = new FormData();
		formData.append('image', file);
		if (mapId) formData.append('mapId', mapId);
		
		// return await apiUpload('/maps/upload-image', formData);
		
		console.log('TODO: 이미지 파일 업로드 API 연결');
		console.log('파일명:', file.name, '크기:', file.size, 'mapId:', mapId);
		
		// 임시 응답
		return { 
			success: true, 
			url: `/uploads/maps/images/${file.name}`,
			filename: file.name 
		};
	},

	// 메타데이터 폴더 업로드
	async uploadMetadataFolder(files: File[], mapId?: string) {
		// TODO: API 엔드포인트 연결
		const formData = new FormData();
		
		// 폴더 내 모든 파일을 FormData에 추가
		files.forEach((file, index) => {
			formData.append(`metadata_files`, file);
			formData.append(`file_paths_${index}`, file.webkitRelativePath);
		});
		
		if (mapId) formData.append('mapId', mapId);
		
		// return await apiUpload('/maps/upload-metadata', formData);
		
		console.log('TODO: 메타데이터 폴더 업로드 API 연결');
		console.log('파일 개수:', files.length, 'mapId:', mapId);
		console.log('폴더 구조:', files.map(f => f.webkitRelativePath));
		
		// 임시 응답
		return { 
			success: true, 
			folderPath: files[0]?.webkitRelativePath.split('/')[0] || '',
			fileCount: files.length,
			jsonFileCount: files.filter(f => f.name.endsWith('.json')).length
		};
	}
};