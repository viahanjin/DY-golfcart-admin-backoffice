import type {
  CourseJsonData,
  GolfCourseMapData,
  PointCoordinates,
  LineStringCoordinates,
  PolygonCoordinates,
} from "../../types/map";
import type { Coordinate } from "../../types/protocol";
import { calculateBounds } from "./boundsCalculator";

/**
 * GeoJSON 또는 CourseJsonData에서 모든 좌표를 추출하여 바운딩 계산
 */
export const calculateDataBounds = (
  data: CourseJsonData | GolfCourseMapData
): {
  southwest: Coordinate;
  northeast: Coordinate;
  center: Coordinate;
} => {
  const allCoordinates: Coordinate[] = [];

  if ("type" in data && data.type === "FeatureCollection") {
    // GeoJSON 데이터
    const geoJsonData = data as GolfCourseMapData;
    geoJsonData.features.forEach((feature) => {
      if (!feature.geometry) return;

      switch (feature.geometry.type) {
        case "Point":
          const pointCoords = feature.geometry.coordinates as PointCoordinates;
          allCoordinates.push({ lat: pointCoords[1], lng: pointCoords[0] });
          break;
        case "LineString":
          const lineCoords = feature.geometry
            .coordinates as LineStringCoordinates;
          lineCoords.forEach((coord) => {
            allCoordinates.push({ lat: coord[1], lng: coord[0] });
          });
          break;
        case "Polygon":
          const polygonCoords = feature.geometry
            .coordinates as PolygonCoordinates;
          polygonCoords[0].forEach((coord) => {
            allCoordinates.push({ lat: coord[1], lng: coord[0] });
          });
          break;
      }
    });
  } else {
    // 기존 JSON 데이터
    const courseData = data as CourseJsonData;

    // 메인 경로
    if (courseData.route && courseData.route.path) {
      allCoordinates.push(...courseData.route.path);
    }

    // 홀 경로
    if (courseData.holes) {
      courseData.holes.forEach((hole) => {
        if (hole.path) {
          allCoordinates.push(...hole.path);
        }
      });
    }

    // 섹션 경로
    if (courseData.sections) {
      courseData.sections.forEach((section) => {
        if (section.path) {
          allCoordinates.push(...section.path);
        }
      });
    }

    // 포인트
    if (courseData.points) {
      courseData.points.forEach((point) => {
        allCoordinates.push(point.coordinate);
      });
    }

    // 영역
    if (courseData.areas) {
      courseData.areas.forEach((area) => {
        if (area.coordinates) {
          allCoordinates.push(...area.coordinates);
        }
      });
    }
  }

  return calculateBounds(allCoordinates);
};
