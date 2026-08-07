const focusTags = ["React", "Next.js", "Node.js", "PHP","C#.NET", "MySQL", "PostgreSQL","HeidiSQL","Tailwind CSS", "TypeScript", "JavaScript"];

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
        ทำงานสายพัฒนาเว็บไซต์ทั้ง Frontend (Smarty Template (.tpl) , JavaScript , Tailwind CSS) และ Backend(PHP) และ Database(HeidiSQL)
        โดยมีประสบการณ์ด้านการเขียน React, Next.js, Node.js, C#.NET, MySQL และ PostgreSQL ในระดับนึง เพราะกำลังศึกษาและพยายามพัฒนาตัวเองอยู่ตลอดเวลา และมีความสนใจในเทคโนโลยีใหม่ ๆ อยู่เสมอ
      </p>
      <p className="leading-relaxed text-neutral-700">
        นอกเวลางานชอบเล่นเกม บอร์ดเกม โป๊กเกอร์ และเล่นกีฬา เช่น ฟุตบอล บาสเกตบอล และว่ายน้ำ

      </p>
    </div>
  );
}
