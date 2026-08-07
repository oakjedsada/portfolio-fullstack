export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  return (
    <>
      <div
        className="absolute inset-0 z-[9999]"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        className="absolute z-[10000] flex w-[180px] flex-col gap-0.5 rounded-lg border border-[#2b3550] bg-taskbar p-1.5 shadow-window animate-[winopen_0.15s_ease]"
        style={{ left: x, top: y }}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-white/[0.08] active:bg-white/[0.14] ${
              item.danger ? "text-red-400 hover:text-red-300" : "text-neutral-200 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
