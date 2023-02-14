import { createContext, Dispatch } from "react";
import { Action } from "./use-document-reducer.js";

export const EditNodeContext = createContext<Dispatch<Action>>(null!);
