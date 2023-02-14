import { useReducer } from "react";

export type DocumentNode = ObjectNode | ArrayNode | string | number | boolean;

export interface ObjectNode {
  readonly [K: string]: DocumentNode;
}

export type ArrayNode = readonly DocumentNode[];

export type DocumentPath = readonly (string | number)[];

export type NodeType = "object" | "array" | "string" | "number" | "boolean";

export function useDocumentReducer() {
  return useReducer(reduce, {
    stringProp: "hello world",
    numberProp: 4,
    boolProp: true,
    arrayProp: ["string in array", 12345, [{ "prop with spaces": false }]],
    objectProp: {
      nested1: "works",
      nested2: {},
    },
  });
}

export type Action =
  | {
      readonly type: "insert-object-key";
      readonly objectPath: DocumentPath;
      readonly objectKey: string;
      readonly nodeType: NodeType;
    }
  | {
      readonly type: "append-array-index";
      readonly arrayPath: DocumentPath;
      readonly nodeType: NodeType;
    }
  | {
      readonly type: "delete-object-key";
      readonly objectPath: DocumentPath;
      readonly objectKey: string;
    }
  | {
      readonly type: "delete-array-index";
      readonly arrayPath: DocumentPath;
      readonly arrayIndex: number;
    }
  | {
      readonly type: "set-value";
      readonly path: DocumentPath;
      readonly value: string | number | boolean;
    };

function reduce(rootDocument: DocumentNode, action: Action): DocumentNode {
  switch (action.type) {
    case "insert-object-key":
      return rebuildAtPath(rootDocument, action.objectPath, (object) => ({
        ...(object as ObjectNode),
        [action.objectKey]: createNode(action.nodeType),
      }));
    case "append-array-index":
      return rebuildAtPath(rootDocument, action.arrayPath, (array) => [
        ...(array as ArrayNode),
        createNode(action.nodeType),
      ]);
    case "delete-object-key":
      return rebuildAtPath(rootDocument, action.objectPath, (object) => {
        const result = { ...(object as ObjectNode) };
        delete result[action.objectKey];
        return result;
      });
    case "delete-array-index":
      return rebuildAtPath(rootDocument, action.arrayPath, (array) => {
        const result = [...(array as ArrayNode)];
        result.splice(action.arrayIndex, 1);
        return result;
      });
    case "set-value":
      return rebuildAtPath(rootDocument, action.path, () => action.value);
  }
}

function rebuildAtPath(
  node: DocumentNode,
  path: DocumentPath,
  rebuild: (node: DocumentNode) => DocumentNode
): DocumentNode {
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

function createNode(nodeType: NodeType): DocumentNode {
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
