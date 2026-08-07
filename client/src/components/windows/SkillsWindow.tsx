import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Skill } from "../../types";

export function SkillsWindow() {
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSkills()
      .then(setSkills)
      .catch(() => setError("โหลดข้อมูลทักษะไม่สำเร็จ"));
  }, []);

  if (error) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
        ⚠️ {error}
      </div>
    );
  }
  if (!skills) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-neutral-400">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-accent" />
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {skills.map((s) => (
        <div key={s.id} className="flex items-center gap-2.5 text-sm">
          <span className="w-24 flex-shrink-0 truncate text-xs font-medium text-neutral-600">{s.name}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
              style={{ width: `${s.proficiency}%` }}
            />
          </div>
          <span className="w-9 text-right text-xs tabular-nums text-neutral-400">{s.proficiency}%</span>
        </div>
      ))}
    </div>
  );
}
