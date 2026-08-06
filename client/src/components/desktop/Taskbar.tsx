import { useEffect, useState } from "react";
import type { WindowState } from "../../types";

interface TaskbarProps {
  windows: WindowState[];
  onToggleStart: () => void;
  onSelectWindow: (id: WindowState["id"]) => void;
}

export function Taskbar({ windows, onToggleStart, onSelectWindow }: TaskbarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 flex h-[52px] items-center gap-2.5 border-t border-taskbarEdge bg-gradient-to-b from-[#232b40]/95 to-taskbar/95 px-3 backdrop-blur-md">
      <button
        className="flex items-center gap-2 rounded-md bg-white/[0.06] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.14] active:bg-white/[0.2]"
        onClick={onToggleStart}
      >
        🪟 Start
      </button>
      <div className="h-7 w-px bg-white/10" />

      {windows
        .filter((w) => w.open)
        .map((w) => (
          <button
            key={w.id}
            className="flex items-center gap-1.5 rounded-md bg-white/[0.08] px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/[0.16] active:bg-white/[0.22]"
            onClick={() => onSelectWindow(w.id)}
          >
            {w.icon} {w.title}
          </button>
        ))}

      <div className="ml-auto pr-1.5 text-right text-sm text-white">
        <div className="tabular-nums">{timeStr}</div>
        <div className="text-[10px] text-neutral-400">{dateStr}</div>
      </div>
    </div>
  );
}
