import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Project } from "../../types";

const statusStyles: Record<Project["status"], string> = {
  Live: "bg-emerald-50 text-emerald-600",
  Done: "bg-blue-50 text-blue-600",
  "R&D": "bg-purple-50 text-purple-600",
  Creative: "bg-amber-50 text-amber-600",
};

export function ProjectsWindow() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getProjects()
      .then(setProjects)
      .catch(() => setError("โหลดข้อมูลผลงานไม่สำเร็จ ลองใหม่อีกครั้ง"));
  }, []);

  if (error) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
        ⚠️ {error}
      </div>
    );
  }
  if (!projects) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-neutral-400">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-accent" />
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {projects.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3.5 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
        >
          <div>
            <div className="text-sm font-semibold text-neutral-800">
              {p.icon} {p.name}
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">{p.description}</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {p.techStack.map((t) => (
                <span key={t} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[p.status]}`}>
            {p.status}
          </span>
        </div>
      ))}
    </div>
  );
}
