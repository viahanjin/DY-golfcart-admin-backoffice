// 파일 로더
export { loadJsonData, isGeoJsonData } from "./loaders/fileLoader";
export { 
  parseTransformedCourseData, 
  arrayToRecord 
} from "./loaders/dataParser";

// 변환기
export { transformGeoJsonToCourseData } from "./transformers/geoJsonTransformer";
export { transformFileDataToCourseData } from "./transformers/formatConverter";

// 생성기
export { generateCourseJsonFile } from "./generators/courseJsonGenerator";
export { generateGeoJsonFile } from "./generators/geoJsonGenerator";

// 계산기
export { calculateBounds, calculateZoomLevel } from "./calculators/boundsCalculator";
export { calculateDataBounds } from "./calculators/dataCalculator";

// 검증기
export { 
  validateLinearConnection, 
  visualizeLinearConnection 
} from "./validators/connectionValidator";
export { 
  validateJointConnection, 
  visualizeJointConnection 
} from "./validators/jointValidator";

// 네비게이션
export { 
  getNextRoute, 
  getPreviousRoute, 
  getNextRouteInJointSystem 
} from "./navigation/routeFinder";
export { 
  extractJointSegments, 
  findPathBetween, 
  findNearestPointIndex 
} from "./navigation/jointExtractor";

// 입출력
export { downloadToLocal, saveFileWithPicker } from "./io/filePicker";

// 기존 함수들과의 호환성을 위한 re-export (기존 import를 깨지 않도록)
export { transformFileDataToCourseData as transformFileDataToCourseData } from "./transformers/formatConverter";
