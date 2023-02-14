import { DocumentNodeEditor } from "./node-editor.js";
import { useDocumentReducer } from "./use-document-reducer.js";
import { EditNodeContext } from "./use-edit-node.js";

export function App() {
  const [rootDocument, dispatch] = useDocumentReducer();

  return (
    <div className="app">
      <EditNodeContext.Provider value={dispatch}>
        <DocumentNodeEditor path={[]} node={rootDocument} />
      </EditNodeContext.Provider>
    </div>
  );
}
