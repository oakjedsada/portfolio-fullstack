const focusTags = ["Backend", "PHP / MySQL", "Data Pipeline", "Dashboards"];

export function AboutWindow() {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#2b3550] text-2xl shadow-md">
          🧑‍💻
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">เจษฎาพร</h2>
          <div className="text-xs text-neutral-500">Frontend / Backend Developer</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {focusTags.map((tag) => (
          <span key={tag} className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
            {tag}
          </span>
        ))}
      </div>

      <p className="mb-3 leading-relaxed text-neutral-700">
        ทำงานสายพัฒนาเว็บไซต์ทั้ง Frontend และ Backend โดยใช้ React, Next.js, Node.js, PHP และ MySQL
        มีประสบการณ์ทำงานกับระบบฐานข้อมูลขนาดใหญ่และการสร้าง Dashboard สำหรับวิเคราะห์ข้อมูล 
      </p>
      <p className="leading-relaxed text-neutral-700">
        นอกเวลางานชอบเล่นกับ AI video content และเรียนรู้เรื่องการเงินส่วนบุคคล
        ผ่าน SET e-Learning
      </p>
    </div>
  );
}
