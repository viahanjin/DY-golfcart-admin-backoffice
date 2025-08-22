import type {
  CourseJsonData,
  CoursePoint,
  CoursePolygon,
  SegmentCourse,
  GolfCourseMapData,
  RouteFeature,
  PointFeature,
  AreaFeature,
  PointCoordinates,
} from "$lib/types/map";

/**
 * GeoJSON FeatureCollection을 기존 CourseJsonData 구조로 변환
 * @param geoJsonData GeoJSON FeatureCollection
 * @returns CourseJsonData 형식의 데이터
 */
export const transformGeoJsonToCourseData = async (
  geoJsonData: GolfCourseMapData
): Promise<CourseJsonData | null> => {
  try {
    const courseJsonData: CourseJsonData = {
      route: { id: "imported_route", path: [] },
      holes: [],
      sections: [],
      points: [],
      areas: [],
    };

    geoJsonData.features.forEach((feature, index) => {
      // 메타데이터는 무시
      if (feature.geometry === null) {
        return;
      }

      switch (feature.geometry.type) {
        case "LineString":
          const routeFeature = feature as RouteFeature;
          const coordinates = routeFeature.geometry.coordinates.map(
            (coord) => ({
              lat: coord[1],
              lng: coord[0],
            })
          );

          if (
            routeFeature.properties.route_type === "main" ||
            !routeFeature.properties.route_type
          ) {
            // 메인 경로
            courseJsonData.route = {
              id: routeFeature.properties.route_id,
              path: coordinates,
            };
          } else if (routeFeature.properties.route_type === "branch") {
            // 홀 경로
            const segmentCourse: SegmentCourse & { id: string } = {
              id: routeFeature.properties.route_id,
              hole_number: routeFeature.properties.hole_number || "",
              section_name: routeFeature.properties.section_name || "",
              section_type: routeFeature.properties.section_type || "Hole",
              speed: routeFeature.properties.speed_limit?.toString() || "30",
              mode: routeFeature.properties.mode || "auto",
              path: coordinates,
              endIndex: coordinates.length - 1,
              startIndex: 0,
            };

            if (
              routeFeature.properties.section_type === "Hole" ||
              routeFeature.properties.hole_number
            ) {
              courseJsonData.holes.push(segmentCourse);
            } else {
              courseJsonData.sections.push(segmentCourse);
            }
          }
          break;

        case "Point":
          const pointFeature = feature as PointFeature;
          if ("point_id" in pointFeature.properties) {
            // 코스 포인트
            const coursePoint: CoursePoint & { id: string } = {
              id: pointFeature.properties.point_id,
              point_name: pointFeature.properties.point_name,
              point_major_category:
                pointFeature.properties.point_major_category,
              point_sub_category: pointFeature.properties.point_sub_category,
              hole_number: pointFeature.properties.hole_number,
              coordinate: {
                lat: pointFeature.geometry.coordinates[1],
                lng: pointFeature.geometry.coordinates[0],
              },
            };
            courseJsonData.points.push(coursePoint);
          }
          // 노드는 무시 (기존 구조에서는 필요 없음)
          break;

        case "Polygon":
          const areaFeature = feature as AreaFeature;
          const polygonCoords = areaFeature.geometry.coordinates[0].map(
            (coord) => ({
              lat: coord[1],
              lng: coord[0],
            })
          );

          // 마지막 좌표가 첫 번째와 같다면 제거 (기존 구조는 닫힌 폴리곤이 아님)
          if (
            polygonCoords.length > 1 &&
            polygonCoords[0].lat ===
              polygonCoords[polygonCoords.length - 1].lat &&
            polygonCoords[0].lng === polygonCoords[polygonCoords.length - 1].lng
          ) {
            polygonCoords.pop();
          }

          const courseArea: CoursePolygon & { id: string } = {
            id: areaFeature.properties.area_id,
            polygon_name: areaFeature.properties.polygon_name,
            polygon_type: areaFeature.properties.polygon_type,
            hole_number: areaFeature.properties.hole_number,
            coordinates: polygonCoords,
          };
          courseJsonData.areas.push(courseArea);
          break;
      }
    });

    return courseJsonData;
  } catch (error) {
    console.error("Failed to transform GeoJSON to course data:", error);
    return null;
  }
};
