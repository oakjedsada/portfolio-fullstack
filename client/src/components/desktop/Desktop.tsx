import { useEffect, useState } from "react";
import type { WindowId, WindowState, FolderState, TextFileState } from "../../types";
import { DesktopIcon } from "./DesktopIcon";
import { Window } from "./Window";
import { Taskbar } from "./Taskbar";
import type { TaskbarItem } from "./Taskbar";
import { StartMenu } from "./StartMenu";
import { ContextMenu } from "./ContextMenu";
import type { ContextMenuItem } from "./ContextMenu";
import { FolderContents } from "./FolderContents";
import { AboutWindow } from "../windows/AboutWindow";
import { ProjectsWindow } from "../windows/ProjectsWindow";
import { SkillsWindow } from "../windows/SkillsWindow";
import { TerminalWindow } from "../windows/TerminalWindow";
import { ResumeWindow } from "../windows/ResumeWindow";
import { ContactWindow } from "../windows/ContactWindow";
import { CVWindow } from "../windows/CVWindow";
import { FarmWindow } from "../windows/FarmWindow";
import { NotepadWindow } from "../windows/NotepadWindow";

// Default icon layout: column-major grid (top-to-bottom, wraps to the next
// column), matching the classic desktop-icon arrangement.
const ICON_COL_GAP = 96; // icon width (90px) + gap
const ICON_ROW_GAP = 102; // icon height (96px) + gap
const ICONS_PER_COL = 6;
function defaultIconPos(index: number): { iconX: number; iconY: number } {
  const col = Math.floor(index / ICONS_PER_COL);
  const row = index % ICONS_PER_COL;
  return { iconX: 20 + col * ICON_COL_GAP, iconY: 20 + row * ICON_ROW_GAP };
}

const initialWindows: WindowState[] = [
  { id: "about", title: "About Me", icon: "🧑‍💻", open: false, minimized: false, maximized: false, x: 120, y: 70, width: 480, zIndex: 10, ...defaultIconPos(0) },
  { id: "projects", title: "Projects", icon: "📁", open: false, minimized: false, maximized: false, x: 220, y: 100, width: 520, zIndex: 10, ...defaultIconPos(1) },
  { id: "skills", title: "Skills.exe", icon: "📊", open: false, minimized: false, maximized: false, x: 340, y: 130, width: 460, zIndex: 10, ...defaultIconPos(2) },
  { id: "terminal", title: "Terminal", icon: "⬛", open: false, minimized: false, maximized: false, x: 460, y: 160, width: 460, zIndex: 10, ...defaultIconPos(3) },
  { id: "resume", title: "Resume.pdf", icon: "📄", open: false, minimized: false, maximized: false, x: 180, y: 90, width: 380, zIndex: 10, ...defaultIconPos(4) },
  { id: "contact", title: "Contact", icon: "✉️", open: false, minimized: false, maximized: false, x: 260, y: 120, width: 380, zIndex: 10, ...defaultIconPos(5) },
  { id: "cv", title: "CV.pdf", icon: "📄", open: false, minimized: false, maximized: false, x: 300, y: 150, width: 1000, zIndex: 10, ...defaultIconPos(6) },
  { id: "farm", title: "Mini Farm.exe", icon: "🌾", open: false, minimized: false, maximized: false, x: 380, y: 180, width: 380, zIndex: 10, ...defaultIconPos(7) },
];

// Only the built-in apps' desktop-icon positions persist (open/minimized/
// window position always start fresh, same as folders/text files).
interface SavedWindowIcon {
  id: WindowId;
  iconX: number;
  iconY: number;
}

const WINDOW_ICONS_STORAGE_KEY = "jedos-window-icons";

function loadInitialWindows(): WindowState[] {
  try {
    const raw = localStorage.getItem(WINDOW_ICONS_STORAGE_KEY);
    if (!raw) return initialWindows;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return initialWindows;
    const savedPositions = new Map<WindowId, { iconX: number; iconY: number }>(
      (parsed as SavedWindowIcon[]).map((p) => [p.id, { iconX: p.iconX, iconY: p.iconY }])
    );
    return initialWindows.map((w) => {
      const pos = savedPositions.get(w.id);
      return pos ? { ...w, iconX: pos.iconX, iconY: pos.iconY } : w;
    });
  } catch {
    return initialWindows;
  }
}

function saveWindowIconPositions(windows: WindowState[]) {
  const payload: SavedWindowIcon[] = windows.map((w) => ({ id: w.id, iconX: w.iconX, iconY: w.iconY }));
  localStorage.setItem(WINDOW_ICONS_STORAGE_KEY, JSON.stringify(payload));
}

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

// Folders are user-created and deletable, so only their identity (name +
// desktop position) is persisted — window state (open/minimized/position)
// always starts fresh, same as the built-in apps.
interface SavedFolder {
  id: string;
  name: string;
  parentId: string | null;
  iconX: number;
  iconY: number;
}

const FOLDERS_STORAGE_KEY = "jedos-folders";
const FOLDER_WINDOW_WIDTH = 320;

function loadFolders(): FolderState[] {
  try {
    const raw = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as SavedFolder[]).map((f, i) => ({
      id: f.id,
      title: f.name,
      icon: "📁",
      parentId: f.parentId ?? null,
      iconX: f.iconX,
      iconY: f.iconY,
      open: false,
      minimized: false,
      maximized: false,
      x: 200 + i * 24,
      y: 140 + i * 24,
      width: FOLDER_WINDOW_WIDTH,
      zIndex: 10,
    }));
  } catch {
    return [];
  }
}

function saveFolders(folders: FolderState[]) {
  const payload: SavedFolder[] = folders.map((f) => ({
    id: f.id,
    name: f.title,
    parentId: f.parentId,
    iconX: f.iconX,
    iconY: f.iconY,
  }));
  localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(payload));
}

// Text files persist their content too (that's the actual "save"), unlike
// folders which only persist identity/position.
interface SavedTextFile {
  id: string;
  name: string;
  parentId: string | null;
  iconX: number;
  iconY: number;
  content: string;
}

const TEXTFILES_STORAGE_KEY = "jedos-textfiles";
const TEXTFILE_WINDOW_WIDTH = 380;

function loadTextFiles(): TextFileState[] {
  try {
    const raw = localStorage.getItem(TEXTFILES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as SavedTextFile[]).map((f, i) => ({
      id: f.id,
      title: f.name,
      icon: "📝",
      parentId: f.parentId ?? null,
      iconX: f.iconX,
      iconY: f.iconY,
      content: f.content,
      open: false,
      minimized: false,
      maximized: false,
      x: 220 + i * 24,
      y: 160 + i * 24,
      width: TEXTFILE_WINDOW_WIDTH,
      zIndex: 10,
    }));
  } catch {
    return [];
  }
}

function saveTextFiles(textFiles: TextFileState[]) {
  const payload: SavedTextFile[] = textFiles.map((f) => ({
    id: f.id,
    name: f.title,
    parentId: f.parentId,
    iconX: f.iconX,
    iconY: f.iconY,
    content: f.content,
  }));
  localStorage.setItem(TEXTFILES_STORAGE_KEY, JSON.stringify(payload));
}

export function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>(() => loadInitialWindows());
  const [folders, setFolders] = useState<FolderState[]>(() => loadFolders());
  const [textFiles, setTextFiles] = useState<TextFileState[]>(() => loadTextFiles());
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [zCounter, setZCounter] = useState(100);

  useEffect(() => {
    saveWindowIconPositions(windows);
  }, [windows]);

  useEffect(() => {
    saveFolders(folders);
  }, [folders]);

  useEffect(() => {
    saveTextFiles(textFiles);
  }, [textFiles]);

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

  function toggleMaximizeWindow(id: WindowId) {
    setZCounter((z) => z + 1);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized, zIndex: zCounter + 1 } : w))
    );
  }

  function focusWindow(id: WindowId) {
    setZCounter((z) => z + 1);
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: zCounter + 1 } : w)));
  }

  function moveWindow(id: WindowId, x: number, y: number) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }

  function moveIcon(id: WindowId, iconX: number, iconY: number) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, iconX, iconY } : w)));
  }

  function createFolder(parentId: string | null, clientX = 0, clientY = 0) {
    const id = `folder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setZCounter((z) => z + 1);
    setFolders((prev) => [
      ...prev,
      {
        id,
        title: "New Folder",
        icon: "📁",
        parentId,
        iconX: Math.max(0, clientX - 20),
        iconY: Math.max(0, clientY - 10),
        open: false,
        minimized: false,
        maximized: false,
        x: 200 + prev.length * 24,
        y: 140 + prev.length * 24,
        width: FOLDER_WINDOW_WIDTH,
        zIndex: zCounter + 1,
      },
    ]);
    setRenamingItemId(id);
  }

  function openFolder(id: string) {
    setZCounter((z) => z + 1);
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, open: true, minimized: false, zIndex: zCounter + 1 } : f))
    );
  }

  function closeFolder(id: string) {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, open: false } : f)));
  }

  function minimizeFolder(id: string) {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, minimized: true } : f)));
  }

  function toggleMaximizeFolder(id: string) {
    setZCounter((z) => z + 1);
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, maximized: !f.maximized, zIndex: zCounter + 1 } : f))
    );
  }

  function focusFolder(id: string) {
    setZCounter((z) => z + 1);
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, zIndex: zCounter + 1 } : f)));
  }

  function moveFolderWindow(id: string, x: number, y: number) {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, x, y } : f)));
  }

  function moveFolderIcon(id: string, iconX: number, iconY: number) {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, iconX, iconY } : f)));
  }

  function commitFolderRename(id: string, name: string) {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, title: name } : f)));
    setRenamingItemId(null);
  }

  // Deleting a folder also deletes everything nested inside it (folders
  // within folders within folders...), since an orphaned parentId would
  // otherwise point at nothing and the item would become unreachable.
  function deleteFolder(id: string) {
    const hasChildren = folders.some((f) => f.parentId === id) || textFiles.some((f) => f.parentId === id);
    if (hasChildren && !window.confirm("โฟลเดอร์นี้มีไฟล์ข้างในอยู่ ลบทั้งหมดถาวร?")) return;

    const idsToDelete = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const f of folders) {
        if (f.parentId && idsToDelete.has(f.parentId) && !idsToDelete.has(f.id)) {
          idsToDelete.add(f.id);
          changed = true;
        }
      }
    }

    setFolders((prev) => prev.filter((f) => !idsToDelete.has(f.id)));
    setTextFiles((prev) => prev.filter((f) => !f.parentId || !idsToDelete.has(f.parentId)));
  }

  function createTextFile(parentId: string | null, clientX = 0, clientY = 0) {
    const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setZCounter((z) => z + 1);
    setTextFiles((prev) => [
      ...prev,
      {
        id,
        title: "New Text File.txt",
        icon: "📝",
        content: "",
        parentId,
        iconX: Math.max(0, clientX - 20),
        iconY: Math.max(0, clientY - 10),
        open: false,
        minimized: false,
        maximized: false,
        x: 220 + prev.length * 24,
        y: 160 + prev.length * 24,
        width: TEXTFILE_WINDOW_WIDTH,
        zIndex: zCounter + 1,
      },
    ]);
    setRenamingItemId(id);
  }

  function openTextFile(id: string) {
    setZCounter((z) => z + 1);
    setTextFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, open: true, minimized: false, zIndex: zCounter + 1 } : f))
    );
  }

  function closeTextFile(id: string) {
    setTextFiles((prev) => prev.map((f) => (f.id === id ? { ...f, open: false } : f)));
  }

  function minimizeTextFile(id: string) {
    setTextFiles((prev) => prev.map((f) => (f.id === id ? { ...f, minimized: true } : f)));
  }

  function toggleMaximizeTextFile(id: string) {
    setZCounter((z) => z + 1);
    setTextFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, maximized: !f.maximized, zIndex: zCounter + 1 } : f))
    );
  }

  function focusTextFile(id: string) {
    setZCounter((z) => z + 1);
    setTextFiles((prev) => prev.map((f) => (f.id === id ? { ...f, zIndex: zCounter + 1 } : f)));
  }

  function moveTextFileWindow(id: string, x: number, y: number) {
    setTextFiles((prev) => prev.map((f) => (f.id === id ? { ...f, x, y } : f)));
  }

  function moveTextFileIcon(id: string, iconX: number, iconY: number) {
    setTextFiles((prev) => prev.map((f) => (f.id === id ? { ...f, iconX, iconY } : f)));
  }

  function commitTextFileRename(id: string, name: string) {
    setTextFiles((prev) => prev.map((f) => (f.id === id ? { ...f, title: name } : f)));
    setRenamingItemId(null);
  }

  function updateTextFileContent(id: string, content: string) {
    setTextFiles((prev) => prev.map((f) => (f.id === id ? { ...f, content } : f)));
  }

  function deleteTextFile(id: string, name: string) {
    if (!window.confirm(`ลบไฟล์ "${name}" ถาวร?`)) return;
    setTextFiles((prev) => prev.filter((f) => f.id !== id));
  }

  // Every open window — app, folder, or text file — gets a taskbar entry.
  // Folder/text-file ids are prefixed at creation time, so dispatch by prefix
  // instead of searching all three arrays.
  const taskbarItems: TaskbarItem[] = [
    ...windows.filter((w) => w.open).map((w) => ({ id: w.id, icon: w.icon, title: w.title })),
    ...folders.filter((f) => f.open).map((f) => ({ id: f.id, icon: f.icon, title: f.title })),
    ...textFiles.filter((f) => f.open).map((f) => ({ id: f.id, icon: f.icon, title: f.title })),
  ];

  function selectTaskbarItem(id: string) {
    if (id.startsWith("folder-")) return openFolder(id);
    if (id.startsWith("file-")) return openTextFile(id);
    return openWindow(id as WindowId);
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-wall1 to-wall2"
      onContextMenu={(e) => {
        e.preventDefault();
        const clientX = e.clientX;
        const clientY = e.clientY;
        setContextMenu({
          x: clientX,
          y: clientY,
          items: [
            { label: "New Folder", onClick: () => createFolder(null, clientX, clientY) },
            { label: "New Text File", onClick: () => createTextFile(null, clientX, clientY) },
          ],
        });
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.10),transparent_45%)]" />

      {/* Desktop icons */}
      <div className="absolute left-0 right-0 top-0 bottom-[52px]">
        {windows.map((w) => (
          <DesktopIcon
            key={w.id}
            icon={w.icon}
            label={w.title}
            x={w.iconX}
            y={w.iconY}
            onOpen={() => openWindow(w.id)}
            onMove={(x, y) => moveIcon(w.id, x, y)}
          />
        ))}
        {folders.filter((f) => f.parentId === null).map((f) => (
          <DesktopIcon
            key={f.id}
            icon={f.icon}
            label={f.title}
            x={f.iconX}
            y={f.iconY}
            onOpen={() => openFolder(f.id)}
            onMove={(x, y) => moveFolderIcon(f.id, x, y)}
            editing={renamingItemId === f.id}
            onRenameCommit={(name) => commitFolderRename(f.id, name)}
            onContextMenu={(e) =>
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                items: [
                  { label: "Rename", onClick: () => setRenamingItemId(f.id) },
                  { label: "Delete", danger: true, onClick: () => deleteFolder(f.id) },
                ],
              })
            }
          />
        ))}
        {textFiles.filter((f) => f.parentId === null).map((f) => (
          <DesktopIcon
            key={f.id}
            icon={f.icon}
            label={f.title}
            x={f.iconX}
            y={f.iconY}
            onOpen={() => openTextFile(f.id)}
            onMove={(x, y) => moveTextFileIcon(f.id, x, y)}
            editing={renamingItemId === f.id}
            onRenameCommit={(name) => commitTextFileRename(f.id, name)}
            onContextMenu={(e) =>
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                items: [
                  { label: "Rename", onClick: () => setRenamingItemId(f.id) },
                  { label: "Delete", danger: true, onClick: () => deleteTextFile(f.id, f.title) },
                ],
              })
            }
          />
        ))}
      </div>

      {/* Windows */}
      {windows.map((w) => (
        <Window
          key={w.id}
          state={w}
          onClose={() => closeWindow(w.id)}
          onMinimize={() => minimizeWindow(w.id)}
          onMaximize={() => toggleMaximizeWindow(w.id)}
          onFocus={() => focusWindow(w.id)}
          onMove={(x, y) => moveWindow(w.id, x, y)}
        >
          {windowContent[w.id]}
        </Window>
      ))}
      {folders.map((f) => (
        <Window
          key={f.id}
          state={f}
          onClose={() => closeFolder(f.id)}
          onMinimize={() => minimizeFolder(f.id)}
          onMaximize={() => toggleMaximizeFolder(f.id)}
          onFocus={() => focusFolder(f.id)}
          onMove={(x, y) => moveFolderWindow(f.id, x, y)}
        >
          <FolderContents
            folderId={f.id}
            folders={folders}
            textFiles={textFiles}
            renamingItemId={renamingItemId}
            onOpenFolder={openFolder}
            onOpenTextFile={openTextFile}
            onRenameStart={setRenamingItemId}
            onRenameFolder={commitFolderRename}
            onRenameTextFile={commitTextFileRename}
            onDeleteFolder={deleteFolder}
            onDeleteTextFile={deleteTextFile}
            onCreateFolder={(parentId) => createFolder(parentId)}
            onCreateTextFile={(parentId) => createTextFile(parentId)}
            setContextMenu={setContextMenu}
          />
        </Window>
      ))}
      {textFiles.map((f) => (
        <Window
          key={f.id}
          state={f}
          onClose={() => closeTextFile(f.id)}
          onMinimize={() => minimizeTextFile(f.id)}
          onMaximize={() => toggleMaximizeTextFile(f.id)}
          onFocus={() => focusTextFile(f.id)}
          onMove={(x, y) => moveTextFileWindow(f.id, x, y)}
        >
          <NotepadWindow content={f.content} onChange={(content) => updateTextFileContent(f.id, content)} />
        </Window>
      ))}

      <StartMenu visible={startOpen} windows={windows} onSelect={openWindow} />
      <Taskbar items={taskbarItems} onToggleStart={() => setStartOpen((v) => !v)} onSelectItem={selectTaskbarItem} />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
