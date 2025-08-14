// 🚨 이 파일은 기존 import 호환성을 위해 유지됩니다.
// 새로운 코드에서는 분리된 모듈을 직접 import 해주세요.
// 
// 예시:
// import { loadJsonData } from './map/loaders/fileLoader';
// import { generateGeoJsonFile } from './map/generators/geoJsonGenerator';

// 모든 기능을 re-export
export * from "./map";

// 기존 코드와의 완벽한 호환성을 위해 모든 함수를 다시 export
export {
  // 파일 로더
  loadJsonData,
  isGeoJsonData,
  parseTransformedCourseData,
  arrayToRecord,
  
  // 변환기
  transformGeoJsonToCourseData,
  transformFileDataToCourseData,
  
  // 생성기
  generateCourseJsonFile,
  generateGeoJsonFile,
  
  // 계산기
  calculateBounds,
  calculateZoomLevel,
  calculateDataBounds,
  
  // 검증기
  validateLinearConnection,
  visualizeLinearConnection,
  validateJointConnection,
  visualizeJointConnection,
  
  // 네비게이션
  getNextRoute,
  getPreviousRoute,
  getNextRouteInJointSystem,
  extractJointSegments,
  findPathBetween,
  findNearestPointIndex,
  
  // 입출력
  downloadToLocal,
  saveFileWithPicker
} from "./map";
