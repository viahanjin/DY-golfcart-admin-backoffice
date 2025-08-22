import type {
  GolfCourseMapData,
  NodeFeature,
  RouteFeature,
} from "$lib/types/map";

/**
 * 선형 연결 구조 검증 함수
 */
export const validateLinearConnection = (
  geoJsonData: GolfCourseMapData
): {
  isValid: boolean;
  issues: string[];
  connectionFlow: string[];
} => {
  const issues: string[] = [];
  const connectionFlow: string[] = [];

  try {
    // 노드와 루트 분리
    const nodes = geoJsonData.features.filter(
      (f) =>
        f.geometry?.type === "Point" &&
        f.properties &&
        "node_id" in f.properties
    ) as NodeFeature[];

    const routes = geoJsonData.features.filter(
      (f) => f.geometry?.type === "LineString"
    ) as RouteFeature[];

    // 연결 순서대로 정렬
    const sortedNodes = nodes.sort((a, b) => {
      const orderA = (a.properties as any).order || 0;
      const orderB = (b.properties as any).order || 0;
      return orderA - orderB;
    });

    const sortedRoutes = routes.sort((a, b) => {
      const orderA = (a.properties as any).order || 0;
      const orderB = (b.properties as any).order || 0;
      return orderA - orderB;
    });

    // 1. 시작이 terminal인지 확인
    if (sortedNodes.length === 0) {
      issues.push("No nodes found");
      return { isValid: false, issues, connectionFlow };
    }

    const firstNode = sortedNodes[0];
    if (firstNode.properties.node_type !== "terminal") {
      issues.push("First node must be terminal");
    }

    // 2. 끝이 terminal인지 확인
    const lastNode = sortedNodes[sortedNodes.length - 1];
    if (lastNode.properties.node_type !== "terminal") {
      issues.push("Last node must be terminal");
    }

    // 3. 연결 구조 검증
    connectionFlow.push(firstNode.properties.node_id);

    for (let i = 0; i < sortedRoutes.length; i++) {
      const route = sortedRoutes[i];
      const fromNode = nodes.find(
        (n) => n.properties.node_id === route.properties.from_node
      );
      const toNode = nodes.find(
        (n) => n.properties.node_id === route.properties.to_node
      );

      if (!fromNode) {
        issues.push(`Route ${route.properties.route_id}: from_node not found`);
        continue;
      }

      if (!toNode) {
        issues.push(`Route ${route.properties.route_id}: to_node not found`);
        continue;
      }

      // 연결 흐름 기록
      connectionFlow.push(`→ ${route.properties.route_id} →`);
      connectionFlow.push(toNode.properties.node_id);

      // 노드의 incoming/outgoing 검증
      if (!fromNode.properties.outgoing.includes(route.properties.route_id)) {
        issues.push(
          `Node ${fromNode.properties.node_id}: missing outgoing route ${route.properties.route_id}`
        );
      }

      if (!toNode.properties.incoming.includes(route.properties.route_id)) {
        issues.push(
          `Node ${toNode.properties.node_id}: missing incoming route ${route.properties.route_id}`
        );
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      connectionFlow,
    };
  } catch (error) {
    issues.push(
      `Validation error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return { isValid: false, issues, connectionFlow };
  }
};

/**
 * 연결 구조 시각화 (디버깅용)
 */
export const visualizeLinearConnection = (
  geoJsonData: GolfCourseMapData
): string => {
  const validation = validateLinearConnection(geoJsonData);

  let output = "=== Linear Connection Structure ===\n\n";

  if (validation.isValid) {
    output += "✅ Connection is valid!\n\n";
  } else {
    output += "❌ Connection issues found:\n";
    validation.issues.forEach((issue) => {
      output += `  - ${issue}\n`;
    });
    output += "\n";
  }

  output += "Connection Flow:\n";
  validation.connectionFlow.forEach((step, index) => {
    const indent = step.startsWith("→") ? "  " : "";
    output += `${indent}${step}\n`;
  });

  return output;
};
