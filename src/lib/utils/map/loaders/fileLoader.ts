import type { CourseJsonData, GolfCourseMapData } from "$lib/types/map";

/**
 * 지정된 경로의 JSON 데이터 로드 함수
 * @param path 파일 경로
 * @returns JSON 파싱된 데이터를 반환하는 Promise. 에러 발생 시 Undefined 반환.
 */
export const loadJsonData = async (
  path: string
): Promise<CourseJsonData | null> => {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch route data: ${response.status}`);
    }
    const routeJson = await response.json();

    return routeJson;
  } catch (error) {
    console.error(`Failed to fetch json data : ${error}`);
    return null;
  }
};

/**
 * 파일 내용이 GeoJSON인지 확인
 */
export const isGeoJsonData = (data: any): data is GolfCourseMapData => {
  return (
    data && data.type === "FeatureCollection" && Array.isArray(data.features)
  );
};
