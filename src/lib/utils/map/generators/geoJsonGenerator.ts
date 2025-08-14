import type {
  Course,
  CoursePoint,
  CoursePolygon,
  SegmentCourse,
  GolfCourseMapData,
  MetadataFeature,
  NodeFeature,
  RouteFeature,
  PointFeature,
  AreaFeature,
  PointCoordinates,
  LineStringCoordinates,
} from "../../types/map";

/**
 * 맵 에디터 데이터를 GeoJSON 형식으로 변환 (선형 노드 연결 구조)
 * 구조: terminal → hole1 → joint → hole2 → joint → hole3 → ... → terminal
 * @param course 전체 코스
 * @param courseHoles 코스 내 홀 구간
 * @param courseSections 코스 내 구간
 * @param coursePoints 코스 내 포인트
 * @param courseAreas 코스 내 영역
 * @returns GeoJSON FeatureCollection 문자열
 */
export const generateGeoJsonFile = async (
  course: Course | null,
  courseHoles: Record<string, SegmentCourse> | null,
  courseSections: Record<string, SegmentCourse> | null,
  coursePoints: Record<string, CoursePoint> | null,
  courseAreas: Record<string, CoursePolygon> | null
): Promise<string> => {
  const features: (
    | MetadataFeature
    | NodeFeature
    | RouteFeature
    | PointFeature
    | AreaFeature
  )[] = [];

  // 1. 메타데이터 추가
  const metadataFeature: MetadataFeature = {
    type: "Feature",
    geometry: null,
    properties: {
      _type: "metadata",
      version: "2.0.0",
      created_by: "dy_linear_golf_system",
      last_updated: new Date().toISOString().split("T")[0],
      coordinate_system: "WGS84",
      schema: {
        route_id: "string",
        node_id: "string",
        speed_limit: "number",
      },
    },
  };
  features.push(metadataFeature);

  // 2. 홀 데이터 정렬 (hole_number 기준)
  const sortedHoles: Array<{ id: string; data: SegmentCourse }> = [];

  if (courseHoles) {
    Object.entries(courseHoles)
      .sort(([, a], [, b]) => {
        const holeA = parseInt(a.hole_number || "0");
        const holeB = parseInt(b.hole_number || "0");
        return holeA - holeB;
      })
      .forEach(([id, data]) => {
        if (data.path && data.path.length > 0) {
          sortedHoles.push({ id, data });
        }
      });
  }

  if (sortedHoles.length === 0) {
    // 홀이 없으면 빈 FeatureCollection 반환
    return JSON.stringify(
      {
        type: "FeatureCollection",
        features: [metadataFeature],
      },
      null,
      2
    );
  }

  let routeCounter = 1;
  let nodeCounter = 1;

  // 3. 시작 터미널 노드 생성
  const firstHole = sortedHoles[0];
  const startTerminalNode: NodeFeature = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        firstHole.data.path[0].lng,
        firstHole.data.path[0].lat,
      ] as PointCoordinates,
    },
    properties: {
      node_id: `terminal_start`,
      node_type: "terminal",
      incoming: [],
      outgoing: [`route_${routeCounter.toString().padStart(3, "0")}`],
      order: nodeCounter++,
    },
  };
  features.push(startTerminalNode);

  // 4. 각 홀과 연결 노드들 생성
  sortedHoles.forEach((hole, index) => {
    const isLastHole = index === sortedHoles.length - 1;
    const routeId = `route_${routeCounter.toString().padStart(3, "0")}`;

    // 4-1. 현재 홀의 루트 생성
    const holeRoute: RouteFeature = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: hole.data.path.map(
          (coord) => [coord.lng, coord.lat] as PointCoordinates
        ) as LineStringCoordinates,
      },
      properties: {
        route_id: routeId,
        from_node: index === 0 ? "terminal_start" : `joint_${index}`,
        to_node: isLastHole ? "terminal_end" : `joint_${index + 1}`,
        speed_limit: parseInt(hole.data.speed) || 30,
        route_type: "hole",
        hole_number: hole.data.hole_number,
        section_name: hole.data.section_name,
        section_type: hole.data.section_type || "Hole",
        mode: hole.data.mode || "auto",
        order: routeCounter,
      },
    };
    features.push(holeRoute);

    // 4-2. 다음 홀이 있으면 joint 노드 생성 (현재 홀의 끝점에)
    if (!isLastHole) {
      const jointNodeId = `joint_${index + 1}`;

      const jointNode: NodeFeature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            hole.data.path[hole.data.path.length - 1].lng,
            hole.data.path[hole.data.path.length - 1].lat,
          ] as PointCoordinates,
        },
        properties: {
          node_id: jointNodeId,
          node_type: "joint",
          incoming: [routeId],
          outgoing: [`route_${(routeCounter + 1).toString().padStart(3, "0")}`],
          order: nodeCounter++,
        },
      };
      features.push(jointNode);
    }

    routeCounter++;
  });

  // 5. 종료 터미널 노드 생성
  const lastHole = sortedHoles[sortedHoles.length - 1];
  const endTerminalNode: NodeFeature = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        lastHole.data.path[lastHole.data.path.length - 1].lng,
        lastHole.data.path[lastHole.data.path.length - 1].lat,
      ] as PointCoordinates,
    },
    properties: {
      node_id: "terminal_end",
      node_type: "terminal",
      incoming: [`route_${(routeCounter - 1).toString().padStart(3, "0")}`],
      outgoing: [],
      order: nodeCounter++,
    },
  };
  features.push(endTerminalNode);

  // 6. 포인트 Features 추가 (기존 로직 유지)
  if (coursePoints) {
    Object.entries(coursePoints).forEach(([id, point]) => {
      const pointFeature = {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [
            point.coordinate.lng,
            point.coordinate.lat,
          ] as PointCoordinates,
        },
        properties: {
          point_id: id,
          point_name: point.point_name,
          point_major_category: point.point_major_category,
          point_sub_category: point.point_sub_category,
          hole_number: point.hole_number,
        },
      };
      features.push(pointFeature);
    });
  }

  // 7. 영역 Features 추가 (기존 로직 유지)
  if (courseAreas) {
    Object.entries(courseAreas).forEach(([id, area]) => {
      if (area.coordinates && area.coordinates.length > 0) {
        // GeoJSON Polygon은 닫힌 링이어야 하므로 첫 점을 마지막에 추가
        const coordinates = [...area.coordinates];
        if (
          coordinates[0].lat !== coordinates[coordinates.length - 1].lat ||
          coordinates[0].lng !== coordinates[coordinates.length - 1].lng
        ) {
          coordinates.push(coordinates[0]);
        }

        const areaFeature = {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [
              coordinates.map(
                (coord) => [coord.lng, coord.lat] as PointCoordinates
              ),
            ],
          },
          properties: {
            area_id: id,
            polygon_name: area.polygon_name,
            polygon_type: area.polygon_type,
            hole_number: area.hole_number,
          },
        };
        features.push(areaFeature);
      }
    });
  }

  const geoJsonData: GolfCourseMapData = {
    type: "FeatureCollection",
    features,
  };

  return JSON.stringify(geoJsonData, null, 2);
};
