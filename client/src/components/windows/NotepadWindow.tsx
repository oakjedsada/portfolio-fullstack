import { useWindowMaximized } from "../../hooks/useWindowMaximized";

interface NotepadWindowProps {
  content: string;
  onChange: (content: string) => void;
}

export function NotepadWindow({ content, onChange }: NotepadWindowProps) {
  const maximized = useWindowMaximized();

  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      placeholder="พิมพ์ข้อความที่นี่..."
      className={`w-full resize-none rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-800 outline-none focus:border-accent ${
        maximized ? "flex-1" : "h-[280px]"
      }`}
    />
  );
}
