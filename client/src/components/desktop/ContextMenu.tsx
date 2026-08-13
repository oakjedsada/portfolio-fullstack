import { useRef, useState } from "react";

export interface ContextMenuItem {
  label: string;
  onClick?: () => void;
  danger?: boolean;
  checked?: boolean;
  children?: ContextMenuItem[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const itemClass =
  "flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-white/[0.08] hover:text-white active:bg-white/[0.14]";

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  function cancelClose() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    closeTimer.current = window.setTimeout(() => setOpenSubmenu(null), 200);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[9999]"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        className="fixed z-[10000] flex w-[190px] flex-col gap-0.5 rounded-lg border border-[#2b3550] bg-taskbar p-1.5 shadow-window animate-[winopen_0.15s_ease]"
        style={{ left: x, top: y }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="relative"
            onMouseEnter={() => {
              if (item.children) {
                cancelClose();
                setOpenSubmenu(i);
              }
            }}
            onMouseLeave={() => item.children && scheduleClose()}
          >
            <button
              onClick={() => {
                if (item.children) {
                  setOpenSubmenu((v) => (v === i ? null : i));
                  return;
                }
                item.onClick?.();
                onClose();
              }}
              className={`${itemClass} justify-between ${
                item.danger ? "text-red-400 hover:text-red-300" : "text-neutral-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {item.checked && <span className="text-accent">●</span>}
                {item.label}
              </span>
              {item.children && <span className="text-neutral-400">›</span>}
            </button>

            {item.children && openSubmenu === i && (
              <div
                className="absolute left-full top-0 z-[10001] flex w-[170px] flex-col gap-0.5 rounded-lg border border-[#2b3550] bg-taskbar p-1.5 shadow-window"
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              >
                {item.children.map((child, j) => (
                  <button
                    key={j}
                    onClick={() => {
                      child.onClick?.();
                      onClose();
                    }}
                    className={`${itemClass} text-neutral-200`}
                  >
                    <span className="inline-block w-3 text-accent">{child.checked ? "●" : ""}</span>
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
