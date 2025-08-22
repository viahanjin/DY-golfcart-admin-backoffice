import type { CourseJsonData, GolfCourseMapData } from "$lib/types/map";
import { isGeoJsonData } from "../loaders/fileLoader";
import { transformGeoJsonToCourseData } from "./geoJsonTransformer";

/**
 * JSON 또는 GeoJSON 파일을 기존 CourseJsonData 구조로 변환
 */
export const transformFileDataToCourseData = async (
  parsedData: any
): Promise<CourseJsonData | null> => {
  if (isGeoJsonData(parsedData)) {
    // GeoJSON 파일
    return await transformGeoJsonToCourseData(parsedData);
  } else if (parsedData.route || parsedData.holes) {
    // 기존 JSON 파일
    return parsedData as CourseJsonData;
  } else {
    // 단순 경로 데이터
    return {
      route: parsedData.route || {
        id: "imported_route",
        path: parsedData.path || [],
      },
      holes: [],
      sections: [],
      points: [],
      areas: [],
    };
  }
};
