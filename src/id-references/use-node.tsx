import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import { Node, NodeRepository } from "./node-repository.js";

export const NodeRepositoryContext = createContext<NodeRepository>(null!);

export function useNode(id: string): Node {
  const nodeRepository = useContext(NodeRepositoryContext);
  const subscribe = useCallback(
    (onStoreChange: () => void) => nodeRepository.subscribe(onStoreChange),
    [nodeRepository, id]
  );
  const getSnapshot = useCallback(
    () => nodeRepository.getNode(id),
    [nodeRepository, id]
  );
  return useSyncExternalStore(subscribe, getSnapshot);
}
