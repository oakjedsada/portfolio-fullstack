const RESUME_PATH = "/Portfolio.pdf";
const RESUME_PREVIEW_SRC = `${RESUME_PATH}#toolbar=0&navpanes=0`;

export function ResumeWindow() {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-red-600 text-3xl shadow-md">
        📄
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-800">resume-jedsadaporn.pdf</p>
        <p className="mt-0.5 text-xs text-neutral-400">PDF</p>
      </div>
      <a
        href={RESUME_PREVIEW_SRC}
        download
        className="mt-1 flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-accent/90 active:scale-[0.98]"
      >
        ⬇️ ดาวน์โหลดเรซูเม่ฉบับเต็ม
      </a>
    </div>
  );
}
