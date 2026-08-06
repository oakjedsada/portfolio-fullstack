import type { WindowState } from "../../types";

interface StartMenuProps {
  visible: boolean;
  windows: WindowState[];
  onSelect: (id: WindowState["id"]) => void;
}

export function StartMenu({ visible, windows, onSelect }: StartMenuProps) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-14 left-3 z-[60] flex w-[220px] flex-col gap-0.5 rounded-lg border border-[#2b3550] bg-taskbar p-2.5 shadow-window animate-[winopen_0.15s_ease]">
      <div className="mb-1 border-b border-white/10 px-2.5 pb-3 pt-2 text-sm font-semibold text-white">
        JedOS <span className="text-neutral-400">— v1.0</span>
      </div>
      {windows.map((w) => (
        <div
          key={w.id}
          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/[0.08] hover:text-white active:bg-white/[0.14]"
          onClick={() => onSelect(w.id)}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.06] text-sm">
            {w.icon}
          </span>
          <span>{w.title}</span>
        </div>
      ))}
    </div>
  );
}
