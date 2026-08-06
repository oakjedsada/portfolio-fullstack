import { FormEvent, useState } from "react";
import { api } from "../../api/client";

export function ContactWindow() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.sendContact(form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center animate-[winopen_0.2s_ease]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
          ✅
        </div>
        <p className="text-sm font-medium text-neutral-800">ส่งข้อความแล้ว</p>
        <p className="text-xs text-neutral-500">ขอบคุณที่ติดต่อมาครับ จะรีบตอบกลับโดยเร็วที่สุด</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <a
          href="mailto:oakjedsada@gmail.com"
          className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2 py-1.5 text-xs text-neutral-600 transition-colors hover:bg-accent/10 hover:text-accent"
        >
          📧 oakjedsada@gmail.com
        </a>
        <a
          href="https://github.com/oakjedsada"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2 py-1.5 text-xs text-neutral-600 transition-colors hover:bg-accent/10 hover:text-accent"
        >
          💻 github.com/oakjedsada
        </a>
      </div>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500">ชื่อของคุณ</span>
          <input
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 outline-none transition-all placeholder:text-neutral-400 focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20"
            placeholder="เช่น เจษฎาพร"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500">อีเมล</span>
          <input
            type="email"
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 outline-none transition-all placeholder:text-neutral-400 focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500">ข้อความ</span>
          <textarea
            className="h-24 resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 outline-none transition-all placeholder:text-neutral-400 focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20"
            placeholder="อยากบอกอะไรผมบ้าง..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
        </label>

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
        >
          {status === "sending" && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {status === "sending" ? "กำลังส่ง..." : "ส่งข้อความ"}
        </button>

        {status === "error" && (
          <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            ⚠️ ส่งไม่สำเร็จ ลองใหม่อีกครั้ง
          </div>
        )}
      </form>
    </div>
  );
}
