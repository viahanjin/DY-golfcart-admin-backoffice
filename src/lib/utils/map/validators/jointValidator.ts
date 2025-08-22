import type {
  GolfCourseMapData,
  NodeFeature,
  RouteFeature,
} from "$lib/types/map";

/**
 * Joint 연결 구조 검증 함수
 */
export const validateJointConnection = (
  geoJsonData: GolfCourseMapData
): {
  isValid: boolean;
  issues: string[];
  connectionFlow: string[];
  jointStats: {
    totalJoints: number;
    jointsPerHoleGap: number[];
    averageJointsPerGap: number;
  };
} => {
  const issues: string[] = [];
  const connectionFlow: string[] = [];
  const jointStats = {
    totalJoints: 0,
    jointsPerHoleGap: [] as number[],
    averageJointsPerGap: 0,
  };

  try {
    const nodes = geoJsonData.features.filter(
      (f) =>
        f.geometry?.type === "Point" &&
        f.properties &&
        "node_id" in f.properties
    ) as NodeFeature[];

    const routes = geoJsonData.features.filter(
      (f) => f.geometry?.type === "LineString"
    ) as RouteFeature[];

    const sortedNodes = nodes.sort((a, b) => {
      const orderA = (a.properties as any).order || 0;
      const orderB = (b.properties as any).order || 0;
      return orderA - orderB;
    });

    if (sortedNodes.length === 0) {
      issues.push("No nodes found");
      return { isValid: false, issues, connectionFlow, jointStats };
    }

    const firstNode = sortedNodes[0];
    if (firstNode.properties.node_type !== "terminal") {
      issues.push("First node must be terminal");
    }

    const lastNode = sortedNodes[sortedNodes.length - 1];
    if (lastNode.properties.node_type !== "terminal") {
      issues.push("Last node must be terminal");
    }

    const jointNodes = sortedNodes.filter(
      (n) => n.properties.node_type === "joint"
    );
    jointStats.totalJoints = jointNodes.length;

    let currentJointCount = 0;
    sortedNodes.forEach((node) => {
      if (node.properties.node_type === "joint") {
        currentJointCount++;
      } else if (
        node.properties.node_type === "terminal" &&
        currentJointCount > 0
      ) {
        jointStats.jointsPerHoleGap.push(currentJointCount);
        currentJointCount = 0;
      }
    });

    if (jointStats.jointsPerHoleGap.length > 0) {
      jointStats.averageJointsPerGap =
        jointStats.jointsPerHoleGap.reduce((sum, count) => sum + count, 0) /
        jointStats.jointsPerHoleGap.length;
    }

    connectionFlow.push(firstNode.properties.node_id);

    const sortedRoutes = routes.sort((a, b) => {
      const orderA = (a.properties as any).order || 0;
      const orderB = (b.properties as any).order || 0;
      return orderA - orderB;
    });

    for (let i = 0; i < sortedRoutes.length; i++) {
      const route = sortedRoutes[i];
      const fromNode = nodes.find(
        (n) => n.properties.node_id === route.properties.from_node
      );
      const toNode = nodes.find(
        (n) => n.properties.node_id === route.properties.to_node
      );

      if (!fromNode || !toNode) {
        issues.push(`Route ${route.properties.route_id}: node not found`);
        continue;
      }

      connectionFlow.push(`→ ${route.properties.route_id} →`);
      connectionFlow.push(toNode.properties.node_id);

      if (!fromNode.properties.outgoing.includes(route.properties.route_id)) {
        issues.push(
          `Node ${fromNode.properties.node_id}: missing outgoing route`
        );
      }

      if (!toNode.properties.incoming.includes(route.properties.route_id)) {
        issues.push(
          `Node ${toNode.properties.node_id}: missing incoming route`
        );
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      connectionFlow,
      jointStats,
    };
  } catch (error) {
    issues.push(
      `Validation error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return { isValid: false, issues, connectionFlow, jointStats };
  }
};

/**
 * Joint 연결 구조 시각화
 */
export const visualizeJointConnection = (
  geoJsonData: GolfCourseMapData
): string => {
  const validation = validateJointConnection(geoJsonData);

  let output = "=== Joint Connection Structure ===\n\n";

  if (validation.isValid) {
    output += "✅ Connection is valid!\n\n";
  } else {
    output += "❌ Connection issues found:\n";
    validation.issues.forEach((issue) => {
      output += `  - ${issue}\n`;
    });
    output += "\n";
  }

  output += "Joint Statistics:\n";
  output += `  - Total Joints: ${validation.jointStats.totalJoints}\n`;
  output += `  - Joints per hole gap: [${validation.jointStats.jointsPerHoleGap.join(
    ", "
  )}]\n`;
  output += `  - Average joints per gap: ${validation.jointStats.averageJointsPerGap.toFixed(
    2
  )}\n\n`;

  output += "Connection Flow:\n";
  validation.connectionFlow.forEach((step) => {
    const indent = step.startsWith("→") ? "  " : "";
    output += `${indent}${step}\n`;
  });

  return output;
};
