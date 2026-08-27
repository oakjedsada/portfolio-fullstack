import type { WindowState } from "../../types";

interface StartMenuProps {
  visible: boolean;
  windows: WindowState[];
  onSelect: (id: WindowState["id"]) => void;
}

export function StartMenu({ visible, windows, onSelect }: StartMenuProps) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-16 left-1/2 z-[60] w-[420px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#20263b]/90 p-4 shadow-window backdrop-blur-xl animate-[winopen_0.15s_ease]">
      <div className="mb-3 px-1 text-xs font-semibold text-neutral-300">Windows</div>
      <div className="grid grid-cols-4 gap-2">
        {windows.map((w) => (
          <button
            key={w.id}
            onClick={() => onSelect(w.id)}
            className="flex flex-col items-center gap-1.5 rounded-lg px-2 py-2.5 text-center transition-colors hover:bg-white/[0.08] active:bg-white/[0.14]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/[0.06] text-lg">
              {w.icon}
            </span>
            <span className="line-clamp-1 text-[11px] text-neutral-300">{w.title}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 border-t border-white/10 px-1 pt-2.5 text-[11px] text-neutral-500">JedOS · v1.0</div>
    </div>
  );
}
