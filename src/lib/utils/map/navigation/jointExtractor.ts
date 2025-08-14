import type { Course, SegmentCourse } from "../../types/map";
import type { Coordinate } from "../../types/protocol";

/**
 * 전체 경로에서 홀 사이의 Joint 구간을 추출하는 함수
 */
export const extractJointSegments = (
  mainRoute: Course | null,
  holes: Record<string, SegmentCourse> | null
): Record<string, SegmentCourse> => {
  const joints: Record<string, SegmentCourse> = {};

  if (!mainRoute?.path || !holes) {
    return joints;
  }

  // 홀을 번호순으로 정렬
  const sortedHoles = Object.entries(holes)
    .sort(([, a], [, b]) => {
      const holeA = parseInt(a.hole_number || "0");
      const holeB = parseInt(b.hole_number || "0");
      return holeA - holeB;
    })
    .filter(([, hole]) => hole.path && hole.path.length > 0);

  // 연속된 홀 사이의 Joint 구간 추출
  for (let i = 0; i < sortedHoles.length - 1; i++) {
    const currentHole = sortedHoles[i][1];
    const nextHole = sortedHoles[i + 1][1];

    const currentHoleEnd = currentHole.path[currentHole.path.length - 1];
    const nextHoleStart = nextHole.path[0];

    // 전체 경로에서 두 점 사이의 경로 찾기
    const jointPath = findPathBetween(
      mainRoute.path,
      currentHoleEnd,
      nextHoleStart
    );

    if (jointPath.length > 0) {
      const jointId = `joint_${currentHole.hole_number}_to_${nextHole.hole_number}`;
      joints[jointId] = {
        hole_number: `joint_${i + 1}`,
        section_name: `Joint ${currentHole.hole_number} → ${nextHole.hole_number}`,
        section_type: "Joint",
        speed: "15", // Joint는 저속 주행
        mode: "auto",
        path: jointPath,
        startIndex: 0,
        endIndex: jointPath.length - 1,
      };
    }
  }

  return joints;
};

/**
 * 전체 경로에서 두 지점 사이의 경로를 추출
 */
export const findPathBetween = (
  fullPath: Coordinate[],
  startPoint: Coordinate,
  endPoint: Coordinate
): Coordinate[] => {
  const tolerance = 0.00001; // GPS 오차 허용 범위 (약 1m)

  const startIndex = findNearestPointIndex(fullPath, startPoint, tolerance);
  const endIndex = findNearestPointIndex(fullPath, endPoint, tolerance);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    console.warn(
      `Joint path not found: start(${startIndex}) to end(${endIndex})`
    );
    return [];
  }

  // 시작점과 끝점 제외한 중간 경로만 반환
  return fullPath.slice(startIndex + 1, endIndex);
};

/**
 * 가장 가까운 좌표의 인덱스를 찾는 함수
 */
export const findNearestPointIndex = (
  path: Coordinate[],
  targetPoint: Coordinate,
  tolerance: number
): number => {
  let nearestIndex = -1;
  let minDistance = Infinity;

  for (let i = 0; i < path.length; i++) {
    const distance = Math.sqrt(
      Math.pow(path[i].lat - targetPoint.lat, 2) +
        Math.pow(path[i].lng - targetPoint.lng, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }

    // 허용 오차 내에 있으면 바로 반환
    if (distance <= tolerance) {
      return i;
    }
  }

  // 허용 오차 내에 없으면 가장 가까운 점 반환
  return minDistance < tolerance * 10 ? nearestIndex : -1;
};
