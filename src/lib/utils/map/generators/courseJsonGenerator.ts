import type {
  Course,
  CoursePoint,
  CoursePolygon,
  SegmentCourse,
} from "../../types/map";
import { extractJointSegments } from "../navigation/jointExtractor";

/**
 * 맵 에디터로 수정한 모든 내용을 Json으로 변환
 * @param course 전체 코스 (Ex. 1~9)
 * @param courseHoles 코스 내 홀 구간
 * @param courseSections 코스 내 구간 (segment)
 * @param coursePoints 코스 내 포인트
 * @param courseAreas 코스 내 영역
 * @returns
 */
export const generateCourseJsonFile = async (
  course: Course | null,
  courseHoles: Record<string, SegmentCourse> | null,
  courseSections: Record<string, SegmentCourse> | null,
  coursePoints: Record<string, CoursePoint> | null,
  courseAreas: Record<string, CoursePolygon> | null
): Promise<string> => {
  // 🆕 Joint 구간 자동 추출
  const extractedJoints = extractJointSegments(course, courseHoles);

  const jsonData = {
    route: course || null,
    holes: courseHoles
      ? Object.entries(courseHoles).map(([key, value]) => ({
          id: key,
          ...value,
        }))
      : [],
    sections: courseSections
      ? Object.entries(courseSections).map(([key, value]) => ({
          id: key,
          ...value,
        }))
      : [],
    // 🆕 Joint 구간 추가
    joints: Object.entries(extractedJoints).map(([key, value]) => ({
      id: key,
      ...value,
    })),
    points: coursePoints
      ? Object.entries(coursePoints).map(([key, value]) => ({
          id: key,
          ...value,
        }))
      : [],
    areas: courseAreas
      ? Object.entries(courseAreas).map(([key, value]) => ({
          id: key,
          ...value,
        }))
      : [],
  };

  const jsonString = JSON.stringify(jsonData, null, 2);

  return jsonString;
};
