import { ReactNode } from "react";
import { useDraggable } from "../../hooks/useDraggable";
import { WindowMaximizedContext } from "../../hooks/useWindowMaximized";
import type { WindowLike } from "../../types";

interface WindowProps {
  state: WindowLike;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  children: ReactNode;
}

export function Window({ state, onClose, onMinimize, onMaximize, onFocus, onMove, children }: WindowProps) {
  const { onPointerDown } = useDraggable(({ x, y }) => onMove(x, y));

  if (!state.open || state.minimized) return null;

  return (
    <div
      className={`absolute flex flex-col overflow-hidden bg-neutral-100 shadow-window ring-1 ring-black/5 animate-[winopen_0.18s_ease] ${
        state.maximized ? "inset-0 bottom-[52px]" : "rounded-xl"
      }`}
      style={
        state.maximized
          ? { zIndex: state.zIndex }
          : { top: state.y, left: state.x, width: state.width, zIndex: state.zIndex }
      }
      onMouseDown={onFocus}
    >
      <div
        className={`flex items-center justify-between bg-gradient-to-b from-[#3f4a70] to-winbar px-3.5 py-2.5 text-sm font-semibold text-white ${
          state.maximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
        onPointerDown={(e) => !state.maximized && onPointerDown(e, { x: state.x, y: state.y })}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2">
          <span>{state.icon}</span>
          <span className="tracking-tight">{state.title}</span>
        </div>
        <div className="group/traffic flex gap-1.5">
          <button
            className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-400 leading-none transition hover:brightness-110 active:brightness-95"
            onClick={onMinimize}
            aria-label="minimize"
          >
            <span className="text-[8px] text-yellow-900 opacity-0 group-hover/traffic:opacity-100">−</span>
          </button>
          <button
            className="flex h-3 w-3 items-center justify-center rounded-full bg-green-500 leading-none transition hover:brightness-110 active:brightness-95"
            onClick={onMaximize}
            aria-label="maximize"
          >
            <span className="text-[8px] text-green-900 opacity-0 group-hover/traffic:opacity-100">
              {state.maximized ? "❐" : "+"}
            </span>
          </button>
          <button
            className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500 leading-none transition hover:brightness-110 active:brightness-95"
            onClick={onClose}
            aria-label="close"
          >
            <span className="text-[8px] text-red-900 opacity-0 group-hover/traffic:opacity-100">×</span>
          </button>
        </div>
      </div>
      <div
        className={`scrollbar-thin flex flex-col overflow-y-auto px-5 py-4 text-sm leading-relaxed text-neutral-800 ${
          state.maximized ? "h-full flex-1" : "max-h-[420px]"
        }`}
      >
        <WindowMaximizedContext.Provider value={state.maximized}>{children}</WindowMaximizedContext.Provider>
      </div>
    </div>
  );
}
