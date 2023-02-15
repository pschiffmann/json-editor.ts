import { createNode, NodeType } from "../util.js";

export type Node = ObjectNode | ArrayNode | string | number | boolean;

export interface ObjectNode {
  readonly [K: string]: string;
}

export type ArrayNode = readonly string[];

export class NodeRepository {
  constructor(initialNodes: Readonly<Record<string, Node>>) {
    this.#nodes = initialNodes;
  }

  #nodes: Record<string, Node>;

  getNode(id: string): Node {
    return this.#nodes[id];
  }

  insertObjectKey(id: string, key: string, nodeType: NodeType): void {
    const childId = crypto.randomUUID();
    this.#nodes[id] = { ...(this.#nodes[id] as ObjectNode), [key]: childId };
    this.#nodes[childId] = createNode(nodeType);
    this.#notifyListeners();
  }

  deleteObjectKey(id: string, key: string): void {
    const parent = (this.#nodes[id] = { ...(this.#nodes[id] as ObjectNode) });
    delete this.#nodes[parent[key]];
    delete parent[key];
    this.#notifyListeners();
  }

  appendArrayIndex(id: string, nodeType: NodeType): void {
    const childId = crypto.randomUUID();
    this.#nodes[id] = [...(this.#nodes[id] as ArrayNode), childId];
    this.#nodes[childId] = createNode(nodeType);
    this.#notifyListeners();
  }

  deleteArrayIndex(id: string, index: number): void {
    const parent = (this.#nodes[id] = [...(this.#nodes[id] as ArrayNode)]);
    const [childId] = parent.splice(index, 1);
    delete this.#nodes[childId];
    this.#notifyListeners();
  }

  replaceValue(id: string, value: string | number | boolean): void {
    this.#nodes[id] = value;
    this.#notifyListeners();
  }

  #listeners = new Set<() => void>();

  #notifyListeners() {
    for (const listener of this.#listeners) {
      listener();
    }
  }

  /**
   * Calls `onStoreChange` whenever a node changes. Returns an unsubscribe
   * function.
   */
  subscribe(onStoreChange: () => void): () => void {
    this.#listeners.add(onStoreChange);
    return () => this.#listeners.delete(onStoreChange);
  }
}
