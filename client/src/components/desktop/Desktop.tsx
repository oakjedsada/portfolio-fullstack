import { useState } from "react";
import type { WindowId, WindowState } from "../../types";
import { DesktopIcon } from "./DesktopIcon";
import { Window } from "./Window";
import { Taskbar } from "./Taskbar";
import { StartMenu } from "./StartMenu";
import { AboutWindow } from "../windows/AboutWindow";
import { ProjectsWindow } from "../windows/ProjectsWindow";
import { SkillsWindow } from "../windows/SkillsWindow";
import { TerminalWindow } from "../windows/TerminalWindow";
import { ResumeWindow } from "../windows/ResumeWindow";
import { ContactWindow } from "../windows/ContactWindow";
import { CVWindow } from "../windows/CVWindow";
import { FarmWindow } from "../windows/FarmWindow";

const initialWindows: WindowState[] = [
  { id: "about", title: "About Me", icon: "🧑‍💻", open: false, minimized: false, x: 120, y: 70, width: 480, zIndex: 10 },
  { id: "projects", title: "Projects", icon: "📁", open: false, minimized: false, x: 220, y: 100, width: 520, zIndex: 10 },
  { id: "skills", title: "Skills.exe", icon: "📊", open: false, minimized: false, x: 340, y: 130, width: 460, zIndex: 10 },
  { id: "terminal", title: "Terminal", icon: "⬛", open: false, minimized: false, x: 460, y: 160, width: 460, zIndex: 10 },
  { id: "resume", title: "Resume.pdf", icon: "📄", open: false, minimized: false, x: 180, y: 90, width: 380, zIndex: 10 },
  { id: "contact", title: "Contact", icon: "✉️", open: false, minimized: false, x: 260, y: 120, width: 380, zIndex: 10 },
  { id: "cv", title: "CV.pdf", icon: "📄", open: false, minimized: false, x: 300, y: 150, width: 1000, zIndex: 10 },
  { id: "farm", title: "Mini Farm.exe", icon: "🌾", open: false, minimized: false, x: 380, y: 180, width: 380, zIndex: 10 },
];

const windowContent: Record<WindowId, JSX.Element> = {
  about: <AboutWindow />,
  projects: <ProjectsWindow />,
  skills: <SkillsWindow />,
  terminal: <TerminalWindow />,
  resume: <ResumeWindow />,
  contact: <ContactWindow />,
  cv: <CVWindow />,
  farm: <FarmWindow />,
};

export function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>(initialWindows);
  const [startOpen, setStartOpen] = useState(false);
  const [zCounter, setZCounter] = useState(100);

  function openWindow(id: WindowId) {
    setZCounter((z) => z + 1);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, open: true, minimized: false, zIndex: zCounter + 1 } : w))
    );
    setStartOpen(false);
  }

  function closeWindow(id: WindowId) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, open: false } : w)));
  }

  function minimizeWindow(id: WindowId) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  }

  function focusWindow(id: WindowId) {
    setZCounter((z) => z + 1);
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: zCounter + 1 } : w)));
  }

  function moveWindow(id: WindowId, x: number, y: number) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-wall1 to-wall2">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.10),transparent_45%)]" />

      {/* Desktop icons */}
      <div className="absolute left-5 right-0 top-5 bottom-[52px] grid grid-cols-[repeat(auto-fill,90px)] auto-rows-[96px] gap-1.5">
        {windows.map((w) => (
          <DesktopIcon key={w.id} icon={w.icon} label={w.title} onOpen={() => openWindow(w.id)} />
        ))}
      </div>

      {/* Windows */}
      {windows.map((w) => (
        <Window
          key={w.id}
          state={w}
          onClose={() => closeWindow(w.id)}
          onMinimize={() => minimizeWindow(w.id)}
          onFocus={() => focusWindow(w.id)}
          onMove={(x, y) => moveWindow(w.id, x, y)}
        >
          {windowContent[w.id]}
        </Window>
      ))}

      <StartMenu visible={startOpen} windows={windows} onSelect={openWindow} />
      <Taskbar windows={windows} onToggleStart={() => setStartOpen((v) => !v)} onSelectWindow={openWindow} />
    </div>
  );
}
