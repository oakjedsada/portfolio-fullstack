import { useEffect, useRef, useState } from "react";

export interface TaskbarItem {
  id: string;
  icon: string;
  title: string;
}

export interface TaskbarIcon extends TaskbarItem {
  open: boolean;
  pinned: boolean;
  members: TaskbarItem[];
}

interface TaskbarProps {
  items: TaskbarIcon[];
  searchItems: TaskbarItem[];
  onToggleStart: () => void;
  onSelectItem: (id: string) => void;
  onItemContextMenu: (item: TaskbarIcon, x: number, y: number) => void;
}

function WindowsLogo() {
  return (
    <span className="grid grid-cols-2 gap-[3px]">
      <span className="h-[7px] w-[7px] bg-white" />
      <span className="h-[7px] w-[7px] bg-white" />
      <span className="h-[7px] w-[7px] bg-white" />
      <span className="h-[7px] w-[7px] bg-white" />
    </span>
  );
}

function TaskbarSearch({
  searchItems,
  onSelectItem,
}: {
  searchItems: TaskbarItem[];
  onSelectItem: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const results = q ? searchItems.filter((item) => item.title.toLowerCase().includes(q)).slice(0, 8) : [];

  function select(id: string) {
    onSelectItem(id);
    setQuery("");
    inputRef.current?.blur();
  }

  return (
    <div className="relative">
      {results.length > 0 && (
        <div className="absolute bottom-full left-1/2 mb-2 w-[280px] -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-[#20263b]/95 p-1.5 shadow-window backdrop-blur-xl animate-[winopen_0.12s_ease]">
          {results.map((item) => (
            <button
              key={item.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(item.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-neutral-200 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <span className="flex h-6 w-6 items-center justify-center text-base">{item.icon}</span>
              <span className="truncate">{item.title}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex h-10 w-60 items-center gap-2 rounded-full bg-white/10 px-3.5 text-white/80 transition-colors focus-within:bg-white/[0.14]">
        <span className="text-xs">🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => setQuery("")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) select(results[0].id);
            if (e.key === "Escape") {
              setQuery("");
              inputRef.current?.blur();
            }
          }}
          placeholder="Search"
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
        />
      </div>
    </div>
  );
}

// A single taskbar icon. When it represents more than one open instance of
// the same kind (grouped folders/text files), clicking toggles a small
// picker instead of jumping straight to a window, and right-click (which
// isn't unambiguous for a group) is disabled.
function TaskbarIconButton({
  item,
  onSelectItem,
  onItemContextMenu,
}: {
  item: TaskbarIcon;
  onSelectItem: (id: string) => void;
  onItemContextMenu: (item: TaskbarIcon, x: number, y: number) => void;
}) {
  const isGroup = item.members.length > 1;
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("pointerdown", onOutside);
    return () => window.removeEventListener("pointerdown", onOutside);
  }, [open]);

  function handleClick() {
    if (isGroup) {
      setOpen((v) => !v);
    } else {
      onSelectItem(item.members[0]?.id ?? item.id);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      {isGroup && open && (
        <div className="absolute bottom-full left-1/2 mb-2 w-[220px] -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-[#20263b]/95 p-1.5 shadow-window backdrop-blur-xl animate-[winopen_0.12s_ease]">
          {item.members.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onSelectItem(m.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-neutral-200 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <span className="flex h-6 w-6 items-center justify-center text-base">{m.icon}</span>
              <span className="truncate">{m.title}</span>
            </button>
          ))}
        </div>
      )}
      <button
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-lg text-white transition-colors hover:bg-white/10 active:bg-white/15"
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isGroup) onItemContextMenu(item, e.clientX, e.clientY);
        }}
        title={item.title}
      >
        {item.icon}
        {item.open &&
          (isGroup ? (
            <span className="absolute -bottom-1 flex gap-0.5">
              <span className="h-[3px] w-[7px] rounded-full bg-accent" />
              <span className="h-[3px] w-[7px] rounded-full bg-accent" />
            </span>
          ) : (
            <span className="absolute -bottom-1 h-[3px] w-4 rounded-full bg-accent" />
          ))}
      </button>
    </div>
  );
}

export function Taskbar({ items, searchItems, onToggleStart, onSelectItem, onItemContextMenu }: TaskbarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 grid h-[52px] grid-cols-[1fr_auto_1fr] items-center border-t border-taskbarEdge bg-[#1c2333]/80 px-3 backdrop-blur-xl">
      <div />

      <div className="flex items-center gap-1">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:bg-white/15"
          onClick={onToggleStart}
          aria-label="Start"
        >
          <WindowsLogo />
        </button>

        <TaskbarSearch searchItems={searchItems} onSelectItem={onSelectItem} />

        {items.map((item) => (
          <TaskbarIconButton key={item.id} item={item} onSelectItem={onSelectItem} onItemContextMenu={onItemContextMenu} />
        ))}
      </div>

      <div className="justify-self-end pr-1.5 text-right text-sm text-white">
        <div className="tabular-nums">{timeStr}</div>
        <div className="text-[10px] text-neutral-400">{dateStr}</div>
      </div>
    </div>
  );
}
