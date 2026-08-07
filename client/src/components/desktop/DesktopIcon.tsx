import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useDraggable } from "../../hooks/useDraggable";

interface DesktopIconProps {
  icon: string;
  label: string;
  /** Free-positioned + draggable when x/y/onMove are given (desktop). Static grid item otherwise (inside a folder). */
  x?: number;
  y?: number;
  onOpen: () => void;
  onMove?: (x: number, y: number) => void;
  onContextMenu?: (e: MouseEvent) => void;
  editing?: boolean;
  onRenameCommit?: (name: string) => void;
}

export function DesktopIcon({
  icon,
  label,
  x,
  y,
  onOpen,
  onMove,
  onContextMenu,
  editing = false,
  onRenameCommit,
}: DesktopIconProps) {
  const draggable = onMove !== undefined;
  const { onPointerDown } = useDraggable(({ x, y }) => onMove?.(x, y));
  const [draftName, setDraftName] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;
    setDraftName(label);
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  function commit() {
    onRenameCommit?.(draftName.trim() || label);
  }

  return (
    <div
      className={`group flex h-24 w-[90px] cursor-pointer flex-col items-center gap-1.5 rounded-md pt-1.5 transition-colors ${
        draggable ? "absolute hover:bg-white/10 active:bg-white/[0.14]" : "hover:bg-black/5 active:bg-black/10"
      }`}
      style={draggable ? { left: x, top: y } : undefined}
      onPointerDown={(e) => draggable && !editing && onPointerDown(e, { x: x ?? 0, y: y ?? 0 })}
      onDoubleClick={onOpen}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e);
      }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4b6fb0] to-[#26365c] text-xl shadow-md transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:shadow-lg">
        {icon}
      </div>
      {editing ? (
        <input
          ref={inputRef}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            } else if (e.key === "Escape") {
              setDraftName(label);
              e.currentTarget.blur();
            }
          }}
          onBlur={commit}
          className="w-[84px] rounded bg-white px-1 py-0.5 text-center text-xs text-neutral-800 outline-none ring-2 ring-accent"
        />
      ) : (
        <div
          className={`text-center text-xs leading-tight ${
            draggable ? "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]" : "text-neutral-700"
          }`}
        >
          {label}
        </div>
      )}
    </div>
  );
}
