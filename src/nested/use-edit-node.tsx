import { createContext, Dispatch } from "react";
import { Action } from "./use-node-reducer.js";

export const EditNodeContext = createContext<Dispatch<Action>>(null!);
