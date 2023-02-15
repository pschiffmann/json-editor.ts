import { useState } from "react";
import { NodeEditor } from "./node-editor.js";
import { Node, NodeRepository } from "./node-repository.js";
import { NodeRepositoryContext } from "./use-node.js";

export function App() {
  const [nodeRepository] = useState(() => new NodeRepository(initialNodes));

  return (
    <div className="app">
      <NodeRepositoryContext.Provider value={nodeRepository}>
        <NodeEditor nodeId={rootDocumentId} />
      </NodeRepositoryContext.Provider>
    </div>
  );
}

const rootDocumentId = "00000000-0000-0000-0000-000000000000";

const initialNodes: Readonly<Record<string, Node>> = {
  [rootDocumentId]: {
    stringProp: "6cd2ea99-32a2-42de-b47d-93cc7455439f",
    numberProp: "c56c7afe-1e08-49fc-9752-c99400ffbbf5",
    boolProp: "15e2c24e-c98f-4050-97ce-b51585c736ec",
    arrayProp: "a3067682-7b2f-4de1-a915-325422ac2236",
    objectProp: "ae10e89f-3fce-42e5-9283-74b05778332e",
  },
  "6cd2ea99-32a2-42de-b47d-93cc7455439f": "hello world",
  "c56c7afe-1e08-49fc-9752-c99400ffbbf5": 4,
  "15e2c24e-c98f-4050-97ce-b51585c736ec": true,
  "a3067682-7b2f-4de1-a915-325422ac2236": [
    "256d3316-8e66-44a6-87ab-e65ceeb9512a",
    "720f6952-c001-445c-ba1b-68c44bc43fc1",
    "48cf0cb4-a43b-4417-88ca-a7c2da38ea35",
  ],
  "256d3316-8e66-44a6-87ab-e65ceeb9512a": "string in array",
  "720f6952-c001-445c-ba1b-68c44bc43fc1": 12345,
  "48cf0cb4-a43b-4417-88ca-a7c2da38ea35": [
    "ea624547-0240-4c72-8277-557f333e437b",
  ],
  "ea624547-0240-4c72-8277-557f333e437b": {
    "prop with spaces": "580763fa-16e0-4764-8cfc-a32cd2bddb0e",
  },
  "580763fa-16e0-4764-8cfc-a32cd2bddb0e": false,
  "ae10e89f-3fce-42e5-9283-74b05778332e": {
    nested1: "e3f2bc9b-0352-45bc-bc37-044af66dfd92",
    nested2: "8189f550-e82c-47a8-bdf9-9279a9d29302",
  },
  "e3f2bc9b-0352-45bc-bc37-044af66dfd92": "works",
  "8189f550-e82c-47a8-bdf9-9279a9d29302": {},
};
