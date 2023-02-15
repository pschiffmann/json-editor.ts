export type NodeType = "object" | "array" | "string" | "number" | "boolean";

export function createNode(
  nodeType: NodeType
): {} | [] | string | number | boolean {
  switch (nodeType) {
    case "object":
      return {};
    case "array":
      return [];
    case "string":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
  }
}
