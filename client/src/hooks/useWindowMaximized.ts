import { createContext, useContext } from "react";

export const WindowMaximizedContext = createContext(false);

/** Whether the window currently rendering this content is maximized. */
export function useWindowMaximized(): boolean {
  return useContext(WindowMaximizedContext);
}
