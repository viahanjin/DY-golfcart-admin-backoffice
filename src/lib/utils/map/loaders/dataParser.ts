import type {
  CourseJsonData,
  CoursePoint,
  CoursePolygon,
  SegmentCourse,
  ParsedCourseData,
} from "../../types/map";

/**
 * json 데이터를 id 값을 key 값으로 하고 나머지를 value로 저장하는 함수
 */
export const parseTransformedCourseData = async (
  jsonData: CourseJsonData
): Promise<ParsedCourseData | null> => {
  try {
    const route = jsonData.route;

    const holes: Record<string, SegmentCourse> = jsonData.holes
      ? arrayToRecord(jsonData.holes)
      : {};
    const sections: Record<string, SegmentCourse> = jsonData.sections
      ? arrayToRecord(jsonData.sections)
      : {};
    const points: Record<string, CoursePoint> = jsonData.points
      ? arrayToRecord(jsonData.points)
      : {};
    const areas: Record<string, CoursePolygon> = jsonData.areas
      ? arrayToRecord(jsonData.areas)
      : {};

    const paths = {
      route,
      holes,
      sections,
      points,
      areas,
    };
    return paths;
  } catch (error) {
    console.error("Failed to parse course json file : ", error);
    return null;
  }
};

/**
 * 배열을 Record로 변환하는 헬퍼 함수
 */
export const arrayToRecord = <T extends { id: string }>(
  array: T[]
): Record<string, Omit<T, "id">> => {
  const record: Record<string, Omit<T, "id">> = {};

  array.forEach((item) => {
    const { id, ...rest } = item;
    record[id] = rest;
  });

  return record;
};

/**
 * JSON 또는 GeoJSON 파일을 기존 CourseJsonData 구조로 변환
 */
export const transformFileDataToCourseData = async (
  parsedData: any
): Promise<CourseJsonData | null> => {
  // GeoJSON 처리는 transformers/geoJsonTransformer.ts에서 처리
  if (parsedData.route || parsedData.holes) {
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
