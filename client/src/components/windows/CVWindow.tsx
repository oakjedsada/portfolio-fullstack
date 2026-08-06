// client/src/components/windows/CVWindow.tsx

import { useWindowMaximized } from "../../hooks/useWindowMaximized";

const CV_PATH = "/cv-jedsadaporn.pdf";
const CV_PREVIEW_SRC = `${CV_PATH}#toolbar=0&navpanes=0`;

export function CVWindow() {
  const maximized = useWindowMaximized();
  const previewHeight = maximized ? "flex-1" : "h-[360px]";

  return (
    <div className={`flex flex-col gap-3 ${maximized ? "h-full" : ""}`}>
      <object
        data={CV_PREVIEW_SRC}
        type="application/pdf"
        width="100%"
        className={`rounded-lg border border-neutral-200 bg-white ${previewHeight}`}
      >
        <div
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 text-center text-xs text-neutral-500 ${previewHeight}`}
        >
          <span className="text-3xl">📋</span>
          <p>เบราว์เซอร์นี้แสดงตัวอย่าง PDF ไม่ได้</p>
          <p>กดปุ่มดาวน์โหลดด้านล่างแทนได้เลย</p>
        </div>
      </object>

      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">cv-jedsadaporn.pdf</p>
        <a
          href={CV_PATH}
          download
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-accent/90 active:scale-[0.98]"
        >
          ⬇️ ดาวน์โหลด CV
        </a>
      </div>
    </div>
  );
}
