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
        state.maximized ? "inset-0 bottom-[52px]" : "rounded-lg"
      }`}
      style={
        state.maximized
          ? { zIndex: state.zIndex }
          : { top: state.y, left: state.x, width: state.width, zIndex: state.zIndex }
      }
      onMouseDown={onFocus}
    >
      <div
        className={`flex h-9 items-stretch justify-between bg-gradient-to-b from-[#3f4a70] to-winbar text-sm font-semibold text-white ${
          state.maximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
        onPointerDown={(e) => !state.maximized && onPointerDown(e, { x: state.x, y: state.y })}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2 px-3.5">
          <span>{state.icon}</span>
          <span className="tracking-tight">{state.title}</span>
        </div>
        <div className="flex items-stretch">
          <button
            className="flex w-11 items-center justify-center text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onMinimize}
            aria-label="minimize"
          >
            <span className="block h-px w-2.5 bg-current" />
          </button>
          <button
            className="flex w-11 items-center justify-center text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onMaximize}
            aria-label="maximize"
          >
            <span className="text-[11px] leading-none">{state.maximized ? "❐" : "□"}</span>
          </button>
          <button
            className="flex w-11 items-center justify-center text-white/80 transition-colors hover:bg-red-600 hover:text-white"
            onClick={onClose}
            aria-label="close"
          >
            <span className="text-sm leading-none">×</span>
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
