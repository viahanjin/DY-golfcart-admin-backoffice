import type { Coordinate } from "../../types/protocol";

/**
 * 좌표 배열에서 바운딩 박스(최소/최대 좌표) 계산
 */
export const calculateBounds = (
  coordinates: Coordinate[]
): {
  southwest: Coordinate;
  northeast: Coordinate;
  center: Coordinate;
} => {
  if (coordinates.length === 0) {
    return {
      southwest: { lat: 0, lng: 0 },
      northeast: { lat: 0, lng: 0 },
      center: { lat: 0, lng: 0 },
    };
  }

  let minLat = coordinates[0].lat;
  let maxLat = coordinates[0].lat;
  let minLng = coordinates[0].lng;
  let maxLng = coordinates[0].lng;

  coordinates.forEach((coord) => {
    if (coord.lat < minLat) minLat = coord.lat;
    if (coord.lat > maxLat) maxLat = coord.lat;
    if (coord.lng < minLng) minLng = coord.lng;
    if (coord.lng > maxLng) maxLng = coord.lng;
  });

  return {
    southwest: { lat: minLat, lng: minLng },
    northeast: { lat: maxLat, lng: maxLng },
    center: {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    },
  };
};

/**
 * 바운딩 박스 크기에 따른 적절한 줄 레벨 계산
 */
export const calculateZoomLevel = (bounds: {
  southwest: Coordinate;
  northeast: Coordinate;
}): number => {
  const latDiff = Math.abs(bounds.northeast.lat - bounds.southwest.lat);
  const lngDiff = Math.abs(bounds.northeast.lng - bounds.southwest.lng);
  const maxDiff = Math.max(latDiff, lngDiff);

  // 거리에 따른 줄 레벨 개산 결정
  if (maxDiff > 0.1) return 21; // 매우 넓은 지역
  if (maxDiff > 0.05) return 21; // 넓은 지역
  if (maxDiff > 0.02) return 21; // 중간 지역
  if (maxDiff > 0.01) return 17; // 좁은 지역
  if (maxDiff > 0.005) return 21; // 매우 좁은 지역
  return 15; // 최소 지역 (기본 골프장 크기)
};
