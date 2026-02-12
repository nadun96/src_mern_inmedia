import { createContext } from "react";

export const UserContext = createContext<{
  state: any;
  dispatch: React.Dispatch<any>;
}>({
  state: null,
  dispatch: () => null,
});
