import { useEffect, useState } from "react";

export interface TaskbarItem {
  id: string;
  icon: string;
  title: string;
}

interface TaskbarProps {
  items: TaskbarItem[];
  onToggleStart: () => void;
  onSelectItem: (id: string) => void;
}

export function Taskbar({ items, onToggleStart, onSelectItem }: TaskbarProps) {
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

      {items.map((item) => (
        <button
          key={item.id}
          className="flex items-center gap-1.5 rounded-md bg-white/[0.08] px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/[0.16] active:bg-white/[0.22]"
          onClick={() => onSelectItem(item.id)}
        >
          {item.icon} {item.title}
        </button>
      ))}

      <div className="ml-auto pr-1.5 text-right text-sm text-white">
        <div className="tabular-nums">{timeStr}</div>
        <div className="text-[10px] text-neutral-400">{dateStr}</div>
      </div>
    </div>
  );
}
