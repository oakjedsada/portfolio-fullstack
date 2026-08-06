interface DesktopIconProps {
  icon: string;
  label: string;
  onOpen: () => void;
}

export function DesktopIcon({ icon, label, onOpen }: DesktopIconProps) {
  return (
    <div
      className="group flex h-24 w-[90px] cursor-pointer flex-col items-center gap-1.5 rounded-md pt-1.5 transition-colors hover:bg-white/10 active:bg-white/[0.14]"
      onDoubleClick={onOpen}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4b6fb0] to-[#26365c] text-xl shadow-md transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:shadow-lg">
        {icon}
      </div>
      <div className="text-center text-xs leading-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
        {label}
      </div>
    </div>
  );
}
