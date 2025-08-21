import type { FileNode } from './folder-tree';

export interface GeoJSONFeature {
	type: 'Feature';
	geometry: {
		type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
		coordinates: any;
	};
	properties: Record<string, any>;
}

export interface GeoJSONData {
	type: 'FeatureCollection';
	features: GeoJSONFeature[];
}

export interface GeoJSONBounds {
	north: number;
	south: number;
	east: number;
	west: number;
}

export interface GeoJSONPreviewData {
	fileName: string;
	data: GeoJSONData;
	bounds: GeoJSONBounds;
	featureCount: number;
	geometryTypes: string[];
}

/**
 * 파일에서 GeoJSON 데이터를 파싱합니다.
 */
export async function parseGeoJSONFile(file: File): Promise<GeoJSONPreviewData | null> {
	console.log(`GeoJSON 파일 파싱 시작: ${file.name} (${file.size} bytes)`);
	
	try {
		const text = await file.text();
		console.log(`파일 내용 읽기 완료: ${file.name}, 길이: ${text.length}`);
		
		if (!text || text.trim().length === 0) {
			console.warn(`파일이 비어있습니다: ${file.name}`);
			return null;
		}

		// JSON 파싱 전에 간단한 문법 수정 시도
		console.log('=== 파일 내용 분석 ===');
		console.log('파일 크기:', text.length, '바이트');
		console.log('파일 내용 시작:', text.substring(0, 200));
		
		// 가장 일반적인 문제부터 수정
		let cleanText = text
			.trim() // 앞뒤 공백 제거
			.replace(/'/g, '"') // 단일 따옴표를 쌍따옴표로 변경
			.replace(/,(\s*[}\]])/g, '$1') // 마지막 쉼표 제거
			.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":'); // 따옴표 없는 키에 따옴표 추가

		console.log('수정된 내용 시작:', cleanText.substring(0, 200));

		const data = JSON.parse(cleanText) as any;
		console.log(`JSON 파싱 완료: ${file.name}`, data);
		
		// 단일 Feature인 경우 FeatureCollection으로 감싸기
		let geoJsonData: GeoJSONData;
		if (data.type === 'Feature') {
			geoJsonData = {
				type: 'FeatureCollection',
				features: [data as GeoJSONFeature]
			};
			console.log(`단일 Feature를 FeatureCollection으로 변환: ${file.name}`);
		} else if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
			geoJsonData = data as GeoJSONData;
		} else {
			console.warn('올바른 GeoJSON 형식이 아닙니다:', file.name, {
				type: data?.type,
				hasFeatures: Array.isArray(data?.features)
			});
			return null;
		}

		if (geoJsonData.features.length === 0) {
			console.warn(`피처가 없습니다: ${file.name}`);
			return null;
		}

		console.log(`피처 분석 시작: ${file.name}, 피처 개수: ${geoJsonData.features.length}`);
		const bounds = calculateBounds(geoJsonData.features);
		const geometryTypes = getUniqueGeometryTypes(geoJsonData.features);

		console.log(`분석 완료: ${file.name}`, { bounds, geometryTypes });

		return {
			fileName: file.name,
			data: geoJsonData,
			bounds,
			featureCount: geoJsonData.features.length,
			geometryTypes
		};
	} catch (error) {
		console.error('GeoJSON 파일 파싱 오류:', file.name, error);
		
		if (error instanceof SyntaxError) {
			console.error('JSON 문법 오류 세부 정보:', {
				message: error.message,
				name: error.name,
				stack: error.stack
			});
			
			// JSON 문법 오류 복구 시도
			try {
				const text = await file.text();
				console.log('JSON 문법 오류 복구 시도...');
				const errorPos = 411; // 오류 위치
				
				// 일반적인 JSON 문법 오류들 수정 시도
				let fixedText = text
					.replace(/'/g, '"')  // 단일 따옴표를 쌍따옴표로
					.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')  // 따옴표 없는 속성명에 따옴표 추가
					.replace(/,(\s*[}\]])/g, '$1')  // 마지막 쉼표 제거
					.replace(/\s+/g, ' ')  // 불필요한 공백 제거
					.replace(/"\s*:\s*"/g, '":"')  // 불필요한 공백 제거
					.replace(/,\s*,/g, ',');  // 연속된 쉼표 제거
				
				console.log('수정 전 오류 지점:');
				console.log(text.substring(errorPos - 30, errorPos + 30));
				console.log('수정 후 동일 지점:');
				console.log(fixedText.substring(errorPos - 30, errorPos + 30));
				
				console.log('수정된 텍스트로 재시도');
				const data = JSON.parse(fixedText) as any;
				console.log('복구 성공!', data);
				
				// 복구 성공시 원래 로직 계속
				let geoJsonData: GeoJSONData;
				if (data.type === 'Feature') {
					geoJsonData = {
						type: 'FeatureCollection',
						features: [data as GeoJSONFeature]
					};
				} else if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
					geoJsonData = data as GeoJSONData;
				} else {
					console.warn('복구된 데이터도 올바른 GeoJSON 형식이 아닙니다:', file.name);
					return null;
				}

				if (geoJsonData.features.length === 0) {
					console.warn(`복구된 데이터에 피처가 없습니다: ${file.name}`);
					return null;
				}

				const bounds = calculateBounds(geoJsonData.features);
				const geometryTypes = getUniqueGeometryTypes(geoJsonData.features);

				return {
					fileName: file.name,
					data: geoJsonData,
					bounds,
					featureCount: geoJsonData.features.length,
					geometryTypes
				};
				
			} catch (fixError) {
				console.error('JSON 문법 오류 복구 실패:', fixError);
				return null;
			}
		}
		
		return null;
	}
}

/**
 * GeoJSON features에서 경계 좌표를 계산합니다.
 */
function calculateBounds(features: GeoJSONFeature[]): GeoJSONBounds {
	let north = -90;
	let south = 90;
	let east = -180;
	let west = 180;

	console.log(`경계 좌표 계산 시작, 피처 수: ${features.length}`);

	features.forEach((feature, index) => {
		if (!feature.geometry || !feature.geometry.coordinates) {
			console.warn(`피처 ${index}: geometry 또는 coordinates가 없습니다`, feature);
			return;
		}

		console.log(`피처 ${index}: ${feature.geometry.type}`, feature.geometry.coordinates);
		const coords = extractCoordinates(feature.geometry);
		console.log(`피처 ${index}: 추출된 좌표 개수: ${coords.length}`, coords.slice(0, 3));
		
		coords.forEach(([lng, lat]) => {
			if (typeof lat === 'number' && typeof lng === 'number') {
				north = Math.max(north, lat);
				south = Math.min(south, lat);
				east = Math.max(east, lng);
				west = Math.min(west, lng);
			} else {
				console.warn(`잘못된 좌표 형식:`, { lng, lat });
			}
		});
	});

	const bounds = { north, south, east, west };
	console.log('최종 경계 좌표:', bounds);
	return bounds;
}

/**
 * geometry에서 모든 좌표를 추출합니다.
 */
function extractCoordinates(geometry: GeoJSONFeature['geometry']): [number, number][] {
	const coords: [number, number][] = [];

	switch (geometry.type) {
		case 'Point':
			coords.push(geometry.coordinates as [number, number]);
			break;
		case 'LineString':
			coords.push(...(geometry.coordinates as [number, number][]));
			break;
		case 'Polygon':
			geometry.coordinates.forEach((ring: [number, number][]) => {
				coords.push(...ring);
			});
			break;
		case 'MultiPoint':
			coords.push(...(geometry.coordinates as [number, number][]));
			break;
		case 'MultiLineString':
			geometry.coordinates.forEach((line: [number, number][]) => {
				coords.push(...line);
			});
			break;
		case 'MultiPolygon':
			geometry.coordinates.forEach((polygon: [number, number][][]) => {
				polygon.forEach((ring: [number, number][]) => {
					coords.push(...ring);
				});
			});
			break;
	}

	return coords;
}

/**
 * features에서 고유한 geometry 타입들을 가져옵니다.
 */
function getUniqueGeometryTypes(features: GeoJSONFeature[]): string[] {
	const types = new Set<string>();
	features.forEach(feature => {
		if (feature.geometry) {
			types.add(feature.geometry.type);
		}
	});
	return Array.from(types);
}

/**
 * 선택된 파일들에서 GeoJSON 파일들을 찾아 파싱합니다.
 */
export async function parseGeoJSONFiles(files: File[]): Promise<GeoJSONPreviewData[]> {
	const geoJsonFiles = files.filter(file => 
		file.name.toLowerCase().endsWith('.geojson')
	);

	const results = await Promise.all(
		geoJsonFiles.map(file => parseGeoJSONFile(file))
	);

	return results.filter((result): result is GeoJSONPreviewData => result !== null);
}

/**
 * 경계 좌표가 유효한 범위인지 확인합니다.
 */
export function validateBounds(bounds: GeoJSONBounds): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	// 위도 범위 확인 (-90 ~ 90)
	if (bounds.north > 90 || bounds.north < -90) {
		errors.push(`북쪽 경계 위도가 유효하지 않습니다: ${bounds.north}`);
	}
	if (bounds.south > 90 || bounds.south < -90) {
		errors.push(`남쪽 경계 위도가 유효하지 않습니다: ${bounds.south}`);
	}

	// 경도 범위 확인 (-180 ~ 180)
	if (bounds.east > 180 || bounds.east < -180) {
		errors.push(`동쪽 경계 경도가 유효하지 않습니다: ${bounds.east}`);
	}
	if (bounds.west > 180 || bounds.west < -180) {
		errors.push(`서쪽 경계 경도가 유효하지 않습니다: ${bounds.west}`);
	}

	// 논리적 순서 확인
	if (bounds.north <= bounds.south) {
		errors.push(`북쪽 경계가 남쪽 경계보다 작거나 같습니다: ${bounds.north} <= ${bounds.south}`);
	}
	if (bounds.east <= bounds.west) {
		errors.push(`동쪽 경계가 서쪽 경계보다 작거나 같습니다: ${bounds.east} <= ${bounds.west}`);
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * 좌표를 포맷팅합니다.
 */
export function formatCoordinate(value: number, type: 'lat' | 'lng'): string {
	const direction = type === 'lat' 
		? (value >= 0 ? 'N' : 'S')
		: (value >= 0 ? 'E' : 'W');
	
	return `${Math.abs(value).toFixed(6)}° ${direction}`;
}