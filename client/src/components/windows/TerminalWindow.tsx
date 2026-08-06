import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { api } from "../../api/client";
import { useWindowMaximized } from "../../hooks/useWindowMaximized";

interface Line {
  type: "input" | "output";
  text: string;
}

const WELCOME: Line[] = [
  { type: "output", text: "JedOS Terminal v1.0 — พิมพ์ /help เพื่อดูคำสั่งทั้งหมด" },
];

function help(): string {
  return [
    "/help              แสดงคำสั่งทั้งหมด",
    "/whoami            ข้อมูลตัวเอง",
    "/about             เกี่ยวกับผม",
    "/skills            รายการทักษะ (ดึงจาก API)",
    "/projects          รายการผลงาน (ดึงจาก API)",
    "/contact           ช่องทางติดต่อ",
    "/date              วันเวลาปัจจุบัน",
    "/echo <ข้อความ>    พิมพ์ข้อความกลับ",
    "/clear             ล้างหน้าจอ",
  ].join("\n");
}

async function runCommand(raw: string): Promise<string | null> {
  const [cmd, ...args] = raw.trim().split(/\s+/);

  switch (cmd?.toLowerCase()) {
    case "":
      return "";
    case "/help":
      return help();
    case "/whoami":
      return "เจษฎาพร — backend developer, BlingSMS";
    case "/about":
      return "ทำงานสาย backend เน้น BlingSMS แพลตฟอร์ม bulk SMS เขียน SQL query, สร้าง dashboard วิเคราะห์ข้อมูล และดูแล data pipeline ทั้งระบบ";
    case "/skills":
    case "/cat":
      if (args[0] === "skills.txt" || cmd === "/skills") {
        try {
          const skills = await api.getSkills();
          return skills.map((s) => `${s.name.padEnd(12)} ${s.proficiency}%`).join("\n");
        } catch {
          return "โหลดข้อมูลทักษะไม่สำเร็จ";
        }
      }
      return `cat: ${args[0] ?? ""}: ไม่พบไฟล์`;
    case "/projects":
    case "/ls":
      try {
        const projects = await api.getProjects();
        return projects.map((p) => `[${p.status}] ${p.name}`).join("\n");
      } catch {
        return "โหลดข้อมูลผลงานไม่สำเร็จ";
      }
    case "/contact":
      return "📧 jedsadaporn@example.com  ·  💻 github.com/jedsadaporn";
    case "/date":
      return new Date().toLocaleString("th-TH");
    case "/echo":
      return args.join(" ");
    case "/clear":
    case "/cls":
      return null;
    case "/sudo":
      if (args.join(" ") === "rm -rf /") {
        return "nice try 😅 ระบบนี้ไม่มีวันโดนลบง่ายๆ หรอก";
      }
      return `Permission denied: เจษฎาพรเท่านั้นที่มีสิทธิ์ sudo ในเครื่องนี้`;
    case "/matrix":
      return "Wake up, Neo...\nThe Matrix has you...\nFollow the white rabbit. 🐇";
    case "/vim":
    case "/vi":
      return "-- INSERT --\nพิมพ์ :wq แล้วก็ยังไม่ออกอยู่ดีนะ 😂";
    case "/coffee":
      return "      ) ) )\n     ( ( (\n    ) ) )\n  .........\n  |       |]\n  \\       /\n   `-----'\n☕ กำลังชง... เดี๋ยวเดียวนะ";
    case "/42":
      return "คำตอบของทุกสิ่ง (และ backend bug ทุกตัว) คือ 42";
    default:
      return `command not found: ${cmd}`;
  }
}

export function TerminalWindow() {
  const maximized = useWindowMaximized();
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  async function submit() {
    const command = input;
    setLines((prev) => [...prev, { type: "input", text: command }]);
    setHistory((prev) => [...prev, command]);
    setHistoryIndex(null);
    setInput("");
    setBusy(true);

    const output = await runCommand(command);

    setBusy(false);
    if (output === null) {
      setLines([]);
      return;
    }
    setLines((prev) => (output ? [...prev, { type: "output", text: output }] : prev));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !busy) {
      void submit();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    }
  }

  return (
    <div
      className={`scrollbar-dark -mx-5 -my-4 cursor-text overflow-y-auto bg-[#0e1320] p-4 font-mono text-[13px] text-[#8bff9b] ${
        maximized ? "flex-1" : "h-[280px]"
      }`}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, i) =>
        line.type === "input" ? (
          <div key={i}>
            <span className="text-[#7de3ff]">jed@jedos</span>:~$ {line.text}
          </div>
        ) : (
          <div key={i} className="whitespace-pre-wrap text-[#8bff9b]/90">
            {line.text}
          </div>
        )
      )}
      <div className="flex">
        <span className="text-[#7de3ff]">jed@jedos</span>
        <span>:~$&nbsp;</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent outline-none disabled:opacity-60"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
