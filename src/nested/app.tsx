import { NodeEditor } from "./node-editor.js";
import { EditNodeContext } from "./use-edit-node.js";
import { Node, useNodeReducer } from "./use-node-reducer.js";

export function App() {
  const [rootDocument, dispatch] = useNodeReducer(initialNode);

  return (
    <div className="app">
      <EditNodeContext.Provider value={dispatch}>
        <NodeEditor path={[]} node={rootDocument} />
      </EditNodeContext.Provider>
    </div>
  );
}

const initialNode: Node = {
  stringProp: "hello world",
  numberProp: 4,
  boolProp: true,
  arrayProp: ["string in array", 12345, [{ "prop with spaces": false }]],
  objectProp: {
    nested1: "works",
    nested2: {},
  },
};
