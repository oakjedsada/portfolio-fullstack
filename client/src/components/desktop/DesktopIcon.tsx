import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useDraggable } from "../../hooks/useDraggable";

export type IconSize = "small" | "medium" | "large";

const SIZE_STYLES: Record<IconSize, { box: string; icon: string; iconText: string; label: string; input: string }> = {
  small: { box: "h-20 w-[76px]", icon: "h-8 w-8", iconText: "text-base", label: "text-[10px]", input: "w-[70px]" },
  medium: { box: "h-24 w-[90px]", icon: "h-11 w-11", iconText: "text-xl", label: "text-xs", input: "w-[84px]" },
  large: { box: "h-28 w-[104px]", icon: "h-14 w-14", iconText: "text-2xl", label: "text-xs", input: "w-[98px]" },
};

interface DesktopIconProps {
  icon: string;
  label: string;
  /** Free-positioned (absolute, over the wallpaper) when x/y are given. Static grid item otherwise (inside a folder). */
  x?: number;
  y?: number;
  size?: IconSize;
  /** Whether the icon can currently be dragged (e.g. disabled while "Auto arrange" is on). Only relevant when x/y are given. Defaults to true. */
  draggable?: boolean;
  onOpen: () => void;
  onMove?: (x: number, y: number) => void;
  /** Called once with the final position when a drag ends (e.g. to snap-to-grid on drop). */
  onMoveEnd?: (x: number, y: number) => void;
  onContextMenu?: (e: MouseEvent) => void;
  editing?: boolean;
  onRenameCommit?: (name: string) => void;
}

export function DesktopIcon({
  icon,
  label,
  x,
  y,
  size = "medium",
  draggable = true,
  onOpen,
  onMove,
  onMoveEnd,
  onContextMenu,
  editing = false,
  onRenameCommit,
}: DesktopIconProps) {
  const positioned = x !== undefined && y !== undefined;
  const canDrag = positioned && draggable && onMove !== undefined;
  const { onPointerDown } = useDraggable(
    ({ x, y }) => onMove?.(x, y),
    ({ x, y }) => onMoveEnd?.(x, y)
  );
  const [draftName, setDraftName] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const s = SIZE_STYLES[size];

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
      className={`group flex ${s.box} cursor-pointer flex-col items-center gap-1.5 rounded-md pt-1.5 transition-colors ${
        positioned ? "absolute hover:bg-white/10 active:bg-white/[0.14]" : "hover:bg-black/5 active:bg-black/10"
      }`}
      style={positioned ? { left: x, top: y } : undefined}
      onPointerDown={(e) => canDrag && !editing && onPointerDown(e, { x: x ?? 0, y: y ?? 0 })}
      onDoubleClick={onOpen}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e);
      }}
    >
      <div
        className={`flex ${s.icon} ${s.iconText} items-center justify-center rounded-xl bg-gradient-to-br from-[#4b6fb0] to-[#26365c] shadow-md transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:shadow-lg`}
      >
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
          className={`${s.input} rounded bg-white px-1 py-0.5 text-center text-xs text-neutral-800 outline-none ring-2 ring-accent`}
        />
      ) : (
        <div
          className={`text-center ${s.label} leading-tight ${
            positioned ? "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]" : "text-neutral-700"
          }`}
        >
          {label}
        </div>
      )}
    </div>
  );
}
