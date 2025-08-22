import type {
  GolfCourseMapData,
  NodeFeature,
  RouteFeature,
} from "$lib/types/map";

/**
 * 골프카트 네비게이션에서 다음 루트 찾기
 */
export const getNextRoute = (
  currentNodeId: string,
  geoJsonData: GolfCourseMapData
): string | null => {
  const currentNode = geoJsonData.features.find(
    (f: any) => f.properties?.node_id === currentNodeId
  ) as NodeFeature | undefined;

  if (!currentNode?.properties?.outgoing?.length) {
    return null; // 종료점 도달
  }

  return currentNode.properties.outgoing[0]; // 다음 루트 ID 반환
};

/**
 * 골프카트 네비게이션에서 이전 루트 찾기
 */
export const getPreviousRoute = (
  currentNodeId: string,
  geoJsonData: GolfCourseMapData
): string | null => {
  const currentNode = geoJsonData.features.find(
    (f: any) => f.properties?.node_id === currentNodeId
  ) as NodeFeature | undefined;

  if (!currentNode?.properties?.incoming?.length) {
    return null; // 시작점 도달
  }

  return currentNode.properties.incoming[0]; // 이전 루트 ID 반환
};

/**
 * Joint 네비게이션에서 다음 루트 찾기
 */
export const getNextRouteInJointSystem = (
  currentNodeId: string,
  geoJsonData: GolfCourseMapData
): {
  routeId: string | null;
  routeType: "hole" | "joint_transfer" | null;
  nextNodeType: "terminal" | "joint" | null;
  progress: {
    currentStep: number;
    totalSteps: number;
    isAtJoint: boolean;
    jointInfo?: {
      jointIndex: number;
      totalJoints: number;
      description: string;
    };
  };
} => {
  const currentNode = geoJsonData.features.find(
    (f: any) => f.properties?.node_id === currentNodeId
  ) as NodeFeature | undefined;

  if (!currentNode?.properties?.outgoing?.length) {
    return {
      routeId: null,
      routeType: null,
      nextNodeType: null,
      progress: {
        currentStep: 0,
        totalSteps: 0,
        isAtJoint: false,
      },
    };
  }

  const routeId = currentNode.properties.outgoing[0];

  const route = geoJsonData.features.find(
    (f: any) => f.properties?.route_id === routeId
  ) as RouteFeature | undefined;

  const routeType =
    (route?.properties?.route_type as "hole" | "joint_transfer") || null;

  const nextNode = geoJsonData.features.find(
    (f: any) => f.properties?.node_id === route?.properties?.to_node
  ) as NodeFeature | undefined;

  const nextNodeType =
    (nextNode?.properties?.node_type as "terminal" | "joint") || null;

  const allNodes = geoJsonData.features.filter(
    (f) =>
      f.geometry?.type === "Point" && f.properties && "node_id" in f.properties
  ) as NodeFeature[];

  const sortedNodes = allNodes.sort((a, b) => {
    const orderA = (a.properties as any).order || 0;
    const orderB = (b.properties as any).order || 0;
    return orderA - orderB;
  });

  const currentIndex = sortedNodes.findIndex(
    (n) => n.properties.node_id === currentNodeId
  );

  const progress = {
    currentStep: currentIndex + 1,
    totalSteps: sortedNodes.length,
    isAtJoint: currentNode.properties.node_type === "joint",
    jointInfo:
      currentNode.properties.node_type === "joint"
        ? {
            jointIndex: (currentNode.properties as any).joint_index || 0,
            totalJoints: (currentNode.properties as any).total_joints || 0,
            description: (currentNode.properties as any).description || "",
          }
        : undefined,
  };

  return { routeId, routeType, nextNodeType, progress };
};
