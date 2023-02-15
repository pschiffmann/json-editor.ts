import { useReducer } from "react";
import { createNode, NodeType } from "../util.js";

export type Node = ObjectNode | ArrayNode | string | number | boolean;

export interface ObjectNode {
  readonly [K: string]: Node;
}

export type ArrayNode = readonly Node[];

export type NodePath = readonly (string | number)[];

export function useNodeReducer(initialNode: Node) {
  return useReducer(reduce, initialNode);
}

export type Action =
  | {
      readonly type: "insert-object-key";
      readonly objectPath: NodePath;
      readonly objectKey: string;
      readonly nodeType: NodeType;
    }
  | {
      readonly type: "append-array-index";
      readonly arrayPath: NodePath;
      readonly nodeType: NodeType;
    }
  | {
      readonly type: "delete-object-key";
      readonly objectPath: NodePath;
      readonly objectKey: string;
    }
  | {
      readonly type: "delete-array-index";
      readonly arrayPath: NodePath;
      readonly arrayIndex: number;
    }
  | {
      readonly type: "set-value";
      readonly path: NodePath;
      readonly value: string | number | boolean;
    };

function reduce(rootNode: Node, action: Action): Node {
  switch (action.type) {
    case "insert-object-key":
      return rebuildAtPath(rootNode, action.objectPath, (object) => ({
        ...(object as ObjectNode),
        [action.objectKey]: createNode(action.nodeType),
      }));
    case "append-array-index":
      return rebuildAtPath(rootNode, action.arrayPath, (array) => [
        ...(array as ArrayNode),
        createNode(action.nodeType),
      ]);
    case "delete-object-key":
      return rebuildAtPath(rootNode, action.objectPath, (object) => {
        const result = { ...(object as ObjectNode) };
        delete result[action.objectKey];
        return result;
      });
    case "delete-array-index":
      return rebuildAtPath(rootNode, action.arrayPath, (array) => {
        const result = [...(array as ArrayNode)];
        result.splice(action.arrayIndex, 1);
        return result;
      });
    case "set-value":
      return rebuildAtPath(rootNode, action.path, () => action.value);
  }
}

function rebuildAtPath(
  node: Node,
  path: NodePath,
  rebuild: (node: Node) => Node
): Node {
  if (path.length === 0) return rebuild(node);

  const [head, ...tail] = path;
  if (Array.isArray(node) && typeof head === "number") {
    const result = [...node];
    result[head] = rebuildAtPath((node as any)[head], tail, rebuild);
    return result;
  }
  if (typeof node === "object" && typeof head === "string") {
    const result = { ...(node as ObjectNode) };
    result[head] = rebuildAtPath((node as any)[head], tail, rebuild);
    return result;
  }
  throw new Error("Invalid path.");
}
