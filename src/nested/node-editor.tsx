import { ChangeEvent, FC, memo, ReactNode, useContext, useState } from "react";
import { NodeType } from "../util.js";
import { EditNodeContext } from "./use-edit-node.js";
import { ArrayNode, Node, NodePath, ObjectNode } from "./use-node-reducer.js";

export interface NodeEditorProps<T> {
  readonly path: NodePath;
  readonly node: T;
}

export let NodeEditor: FC<NodeEditorProps<Node>> = ({ path, node }) => {
  console.log(`<NodeEditor path={[${path}]} /> rendered`);

  switch (typeof node) {
    case "object":
      return Array.isArray(node) ? (
        <ArrayEditor path={path} node={node} />
      ) : (
        <ObjectEditor path={path} node={node as ObjectNode} />
      );
    case "string":
      return <StringEditor path={path} node={node} />;
    case "number":
      return <NumberEditor path={path} node={node} />;
    case "boolean":
      return <BooleanEditor path={path} node={node} />;
  }
};

NodeEditor = memo(
  NodeEditor,
  (prevProps, nextProps) =>
    prevProps.node === nextProps.node &&
    prevProps.path.length === nextProps.path.length &&
    prevProps.path.every((element, index) => element === nextProps.path[index])
);

export function ObjectEditor({ path, node }: NodeEditorProps<ObjectNode>) {
  return (
    <div
      className={
        "node-editor node-editor--collection" +
        (path.length === 0 ? " node-editor--root" : "")
      }
    >
      <Label path={path}>{"{"}</Label>
      {Object.entries(node).map(([key, value]) => (
        <NodeEditor key={key} path={[...path, key]} node={value} />
      ))}
      <AddChild path={path} existingObjectKeys={Object.keys(node)} />
      <div className="node-editor__closing-bracket">{"}"}</div>
    </div>
  );
}

export function ArrayEditor({ path, node }: NodeEditorProps<ArrayNode>) {
  return (
    <div className="node-editor node-editor--collection">
      <Label path={path}>[</Label>
      {node.map((element, index) => (
        <NodeEditor key={index} path={[...path, index]} node={element} />
      ))}
      <AddChild path={path} />
      <div className="node-editor__closing-bracket">]</div>
    </div>
  );
}

export function StringEditor({ path, node }: NodeEditorProps<string>) {
  const editNode = useContext(EditNodeContext);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    editNode({ type: "set-value", path, value: e.currentTarget.value });
  }

  return (
    <div className="node-editor node-editor--literal">
      <Label path={path} />
      <input
        type="text"
        placeholder="text node"
        value={node}
        onChange={onChange}
      />
    </div>
  );
}

export function NumberEditor({ path, node }: NodeEditorProps<number>) {
  const editNode = useContext(EditNodeContext);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    editNode({
      type: "set-value",
      path,
      value: Number.parseInt(e.currentTarget.value),
    });
  }

  return (
    <div className="node-editor node-editor--literal">
      <Label path={path} />
      <input
        type="number"
        placeholder="12345"
        value={node}
        onChange={onChange}
      />
    </div>
  );
}

export function BooleanEditor({ path, node }: NodeEditorProps<boolean>) {
  const editNode = useContext(EditNodeContext);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    editNode({ type: "set-value", path, value: e.currentTarget.checked });
  }

  return (
    <div className="node-editor node-editor--literal">
      <Label path={path} />
      <input type="checkbox" checked={node} onChange={onChange} />
    </div>
  );
}

interface LabelProps {
  readonly path: NodePath;
  readonly children?: ReactNode;
}

function Label({ path, children }: LabelProps) {
  const isRootNode = path.length === 0;
  const lastPathElement = path.at(-1);
  const parentType = typeof lastPathElement === "string" ? "object" : "array";

  const editNode = useContext(EditNodeContext);
  function onDelete() {
    if (parentType === "object") {
      editNode({
        type: "delete-object-key",
        objectPath: path.slice(0, path.length - 1),
        objectKey: lastPathElement as string,
      });
    } else {
      editNode({
        type: "delete-array-index",
        arrayPath: path.slice(0, path.length - 1),
        arrayIndex: lastPathElement as number,
      });
    }
  }

  return (
    <div className="node-editor__label">
      {!isRootNode && (
        <>
          <a className="node-editor__delete" onClick={onDelete}>
            ×
          </a>
          {parentType === "object"
            ? `"${lastPathElement}": `
            : `${lastPathElement}: `}
        </>
      )}
      {children}
    </div>
  );
}

interface AddChildProps {
  readonly path: NodePath;
  readonly existingObjectKeys?: readonly string[];
}

function AddChild({ path, existingObjectKeys }: AddChildProps) {
  const [showInput, setShowInput] = useState(false);
  const [objectKey, setObjectKey] = useState("");
  const [nodeType, setNodeType] = useState<NodeType>("string");

  const editNode = useContext(EditNodeContext);
  function addChild() {
    if (existingObjectKeys) {
      editNode({
        type: "insert-object-key",
        objectPath: path,
        objectKey,
        nodeType,
      });
    } else {
      editNode({
        type: "append-array-index",
        arrayPath: path,
        nodeType,
      });
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
