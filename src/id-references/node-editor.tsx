import { ChangeEvent, FC, memo, ReactNode, useContext, useState } from "react";
import { NodeType } from "../util.js";
import { ArrayNode, ObjectNode } from "./node-repository.js";
import { NodeRepositoryContext, useNode } from "./use-node.js";

export interface NodeEditorProps {
  readonly nodeId: string;

  readonly parentId?: string;

  /**
   * Node `nodeId` is stored in the parent at this key (for objects) or index
   * (for arrays). If `nodeId` is the root object, then `parentPath` is
   * `undefined`.
   */
  readonly parentPath?: string | number;
}

export let NodeEditor: FC<NodeEditorProps> = ({ nodeId, ...props }) => {
  console.log(`<NodeEditor nodeId={${nodeId}} /> rendered`);

  const node = useNode(nodeId);
  switch (typeof node) {
    case "object":
      return Array.isArray(node) ? (
        <ArrayEditor nodeId={nodeId} node={node} {...props} />
      ) : (
        <ObjectEditor nodeId={nodeId} node={node as ObjectNode} {...props} />
      );
    case "string":
      return <StringEditor nodeId={nodeId} node={node} {...props} />;
    case "number":
      return <NumberEditor nodeId={nodeId} node={node} {...props} />;
    case "boolean":
      return <BooleanEditor nodeId={nodeId} node={node} {...props} />;
  }
};

NodeEditor = memo(NodeEditor);

interface NodeEditorImplProps<T> extends NodeEditorProps {
  readonly node: T;
}

export function ObjectEditor({
  nodeId,
  parentId,
  parentPath,
  node,
}: NodeEditorImplProps<ObjectNode>) {
  return (
    <div
      className={
        "node-editor node-editor--collection" +
        (parentPath === undefined ? " node-editor--root" : "")
      }
    >
      <Label parentId={parentId} parentPath={parentPath}>
        {"{"}
      </Label>
      {Object.entries(node).map(([key, childId]) => (
        <NodeEditor
          key={childId}
          nodeId={childId}
          parentId={nodeId}
          parentPath={key}
        />
      ))}
      <AddChild nodeId={nodeId} existingObjectKeys={Object.keys(node)} />
      <div className="node-editor__closing-bracket">{"}"}</div>
    </div>
  );
}

export function ArrayEditor({
  nodeId,
  parentId,
  parentPath,
  node,
}: NodeEditorImplProps<ArrayNode>) {
  return (
    <div className="node-editor node-editor--collection">
      <Label parentId={parentId} parentPath={parentPath}>
        [
      </Label>
      {node.map((childId, index) => (
        <NodeEditor
          key={childId}
          nodeId={childId}
          parentId={nodeId}
          parentPath={index}
        />
      ))}
      <AddChild nodeId={nodeId} />
      <div className="node-editor__closing-bracket">]</div>
    </div>
  );
}

export function StringEditor({
  nodeId,
  parentId,
  parentPath,
  node,
}: NodeEditorImplProps<string>) {
  const nodeRepository = useContext(NodeRepositoryContext);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    nodeRepository.replaceValue(nodeId, e.currentTarget.value);
  }

  return (
    <div className="node-editor node-editor--literal">
      <Label parentId={parentId} parentPath={parentPath} />
      <input
        type="text"
        placeholder="text node"
        value={node}
        onChange={onChange}
      />
    </div>
  );
}

export function NumberEditor({
  nodeId,
  parentId,
  parentPath,
  node,
}: NodeEditorImplProps<number>) {
  const nodeRepository = useContext(NodeRepositoryContext);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    nodeRepository.replaceValue(nodeId, Number.parseInt(e.currentTarget.value));
  }

  return (
    <div className="node-editor node-editor--literal">
      <Label parentId={parentId} parentPath={parentPath} />
      <input
        type="number"
        placeholder="12345"
        value={node}
        onChange={onChange}
      />
    </div>
  );
}

export function BooleanEditor({
  nodeId,
  parentId,
  parentPath,
  node,
}: NodeEditorImplProps<boolean>) {
  const nodeRepository = useContext(NodeRepositoryContext);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    nodeRepository.replaceValue(nodeId, e.currentTarget.checked);
  }

  return (
    <div className="node-editor node-editor--literal">
      <Label parentId={parentId} parentPath={parentPath} />
      <input type="checkbox" checked={node} onChange={onChange} />
    </div>
  );
}

interface LabelProps {
  readonly parentId?: string;
  readonly parentPath?: string | number;
  readonly children?: ReactNode;
}

function Label({ parentId, parentPath, children }: LabelProps) {
  const isRootNode = parentPath === undefined;
  const parentType = typeof parentPath === "string" ? "object" : "array";

  const nodeRepository = useContext(NodeRepositoryContext);
  function onDelete() {
    if (parentType === "object") {
      nodeRepository.deleteObjectKey(parentId!, parentPath as string);
    } else {
      nodeRepository.deleteArrayIndex(parentId!, parentPath as number);
    }
  }

  return (
    <div className="node-editor__label">
      {!isRootNode && (
        <>
          <a className="node-editor__delete" onClick={onDelete}>
            ×
          </a>
          {parentType === "object" ? `"${parentPath}": ` : `${parentPath}: `}
        </>
      )}
      {children}
    </div>
  );
}

interface AddChildProps {
  readonly nodeId: string;
  readonly existingObjectKeys?: readonly string[];
}

function AddChild({ nodeId, existingObjectKeys }: AddChildProps) {
  const [showInput, setShowInput] = useState(false);
  const [objectKey, setObjectKey] = useState("");
  const [nodeType, setNodeType] = useState<NodeType>("string");

  const nodeRepository = useContext(NodeRepositoryContext);
  function addChild() {
    if (existingObjectKeys) {
      nodeRepository.insertObjectKey(nodeId, objectKey, nodeType);
    } else {
      nodeRepository.appendArrayIndex(nodeId, nodeType);
    }
    setShowInput(false);
    setObjectKey("");
    setNodeType("string");
  }

  if (!showInput) {
    return (
      <div className="node-editor__add-child">
        <button onClick={() => setShowInput(true)}>Add child</button>
      </div>
    );
  }

  return (
    <div className="node-editor__add-child">
      {existingObjectKeys && (
        <input
          type="text"
          placeholder="new object key"
          value={objectKey}
          onChange={(e) => setObjectKey(e.currentTarget.value)}
        />
      )}
      <select
        value={nodeType}
        onChange={(e) => setNodeType(e.currentTarget.value as NodeType)}
      >
        <option value="object">object</option>
        <option value="array">array</option>
        <option value="string">string</option>
        <option value="number">number</option>
        <option value="boolean">boolean</option>
      </select>
      <button
        disabled={existingObjectKeys?.includes(objectKey)}
        onClick={addChild}
      >
        Add
      </button>
      <button onClick={() => setShowInput(false)}>Cancel</button>
    </div>
  );
}
