import { useEffect, useState } from "react";
import type { WindowId, WindowState, FolderState, TextFileState } from "../../types";
import { DesktopIcon } from "./DesktopIcon";
import type { IconSize } from "./DesktopIcon";
import { Window } from "./Window";
import { Taskbar } from "./Taskbar";
import type { TaskbarItem, TaskbarIcon } from "./Taskbar";
import { StartMenu } from "./StartMenu";
import { ContextMenu } from "./ContextMenu";
import type { ContextMenuItem } from "./ContextMenu";
import { FolderContents } from "./FolderContents";
import { BackgroundPicker } from "./BackgroundPicker";
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

function snapToGrid(x: number, y: number): { iconX: number; iconY: number } {
  const col = Math.max(0, Math.round((x - 20) / ICON_COL_GAP));
  const row = Math.max(0, Math.round((y - 20) / ICON_ROW_GAP));
  return { iconX: 20 + col * ICON_COL_GAP, iconY: 20 + row * ICON_ROW_GAP };
}

const initialWindows: WindowState[] = [
  { id: "about", title: "About Me", icon: "🧑‍💻", open: false, minimized: false, maximized: false, x: 120, y: 70, width: 480, zIndex: 10, ...defaultIconPos(0) },
  { id: "projects", title: "Projects", icon: "💼", open: false, minimized: false, maximized: false, x: 220, y: 100, width: 520, zIndex: 10, ...defaultIconPos(1) },
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
const BG_COLOR_STORAGE_KEY = "jedos-bg-color";

const ICON_SIZE_STORAGE_KEY = "jedos-icon-size";

function loadIconSize(): IconSize {
  const raw = localStorage.getItem(ICON_SIZE_STORAGE_KEY);
  return raw === "small" || raw === "medium" || raw === "large" ? raw : "medium";
}

const ALIGN_TO_GRID_STORAGE_KEY = "jedos-align-to-grid";
const AUTO_ARRANGE_STORAGE_KEY = "jedos-auto-arrange";

const PINNED_TASKBAR_STORAGE_KEY = "jedos-pinned-taskbar";

function loadPinnedTaskbar(): string[] {
  try {
    const raw = localStorage.getItem(PINNED_TASKBAR_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

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
  modifiedAt?: number;
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
      modifiedAt: f.modifiedAt ?? 0,
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
    modifiedAt: f.modifiedAt,
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
  modifiedAt?: number;
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
      modifiedAt: f.modifiedAt ?? 0,
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
    modifiedAt: f.modifiedAt,
  }));
  localStorage.setItem(TEXTFILES_STORAGE_KEY, JSON.stringify(payload));
}

// Sortable metadata for "Sort by": item type groups (apps, then folders,
// then files) and a folder's "size" is how many items it contains (recursively).
type SortBy = "name" | "type" | "size" | "date";
const SORT_STORAGE_KEY = "jedos-sort-by";

function folderItemCount(folderId: string, folders: FolderState[], textFiles: TextFileState[]): number {
  const childFolders = folders.filter((f) => f.parentId === folderId);
  const childFiles = textFiles.filter((f) => f.parentId === folderId);
  const nested = childFolders.reduce((sum, cf) => sum + folderItemCount(cf.id, folders, textFiles), 0);
  return childFolders.length + childFiles.length + nested;
}

interface SortableItem {
  id: string;
  name: string;
  kind: number; // 0 = app, 1 = folder, 2 = text file
  size: number;
  modifiedAt: number;
}

function sortItems(items: SortableItem[], sortBy: SortBy | null): SortableItem[] {
  if (!sortBy) return items;
  const sorted = [...items];
  switch (sortBy) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "type":
      sorted.sort((a, b) => a.kind - b.kind || a.name.localeCompare(b.name));
      break;
    case "size":
      sorted.sort((a, b) => a.size - b.size || a.name.localeCompare(b.name));
      break;
    case "date":
      sorted.sort((a, b) => b.modifiedAt - a.modifiedAt || a.name.localeCompare(b.name));
      break;
  }
  return sorted;
}

export function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>(() => loadInitialWindows());
  const [folders, setFolders] = useState<FolderState[]>(() => loadFolders());
  const [textFiles, setTextFiles] = useState<TextFileState[]>(() => loadTextFiles());
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [zCounter, setZCounter] = useState(100);
  const [bgColor, setBgColor] = useState<string | null>(() => localStorage.getItem(BG_COLOR_STORAGE_KEY));
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [iconSize, setIconSize] = useState<IconSize>(() => loadIconSize());
  const [alignToGrid, setAlignToGrid] = useState(() => localStorage.getItem(ALIGN_TO_GRID_STORAGE_KEY) !== "false");
  const [autoArrange, setAutoArrange] = useState(() => localStorage.getItem(AUTO_ARRANGE_STORAGE_KEY) === "true");
  const [pinnedTaskbarIds, setPinnedTaskbarIds] = useState<string[]>(() => loadPinnedTaskbar());
  const [sortBy, setSortBy] = useState<SortBy | null>(() => {
    const raw = localStorage.getItem(SORT_STORAGE_KEY);
    return raw === "name" || raw === "type" || raw === "size" || raw === "date" ? raw : null;
  });

  function applyBackground(background: string) {
    setBgColor(background);
    localStorage.setItem(BG_COLOR_STORAGE_KEY, background);
  }

  function sortDesktopBy(criterion: SortBy) {
    setSortBy(criterion);
    setAutoArrange(true);
  }

  useEffect(() => {
    localStorage.setItem(ICON_SIZE_STORAGE_KEY, iconSize);
  }, [iconSize]);

  useEffect(() => {
    localStorage.setItem(ALIGN_TO_GRID_STORAGE_KEY, String(alignToGrid));
  }, [alignToGrid]);

  useEffect(() => {
    localStorage.setItem(AUTO_ARRANGE_STORAGE_KEY, String(autoArrange));
  }, [autoArrange]);

  useEffect(() => {
    localStorage.setItem(PINNED_TASKBAR_STORAGE_KEY, JSON.stringify(pinnedTaskbarIds));
  }, [pinnedTaskbarIds]);

  function pinToTaskbar(id: string) {
    setPinnedTaskbarIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function unpinFromTaskbar(id: string) {
    setPinnedTaskbarIds((prev) => prev.filter((pinnedId) => pinnedId !== id));
  }

  useEffect(() => {
    if (sortBy) localStorage.setItem(SORT_STORAGE_KEY, sortBy);
  }, [sortBy]);

  // While auto-arrange is on, every top-level desktop icon's position is
  // computed fresh (apps, then folders, then text files, ordered by sortBy
  // if one is set) instead of using its stored iconX/iconY, and dragging is
  // disabled.
  const autoArrangePositions = autoArrange
    ? new Map<string, { iconX: number; iconY: number }>(
        sortItems(
          [
            ...windows.map((w) => ({ id: w.id as string, name: w.title, kind: 0, size: 0, modifiedAt: 0 })),
            ...folders
              .filter((f) => f.parentId === null)
              .map((f) => ({
                id: f.id,
                name: f.title,
                kind: 1,
                size: folderItemCount(f.id, folders, textFiles),
                modifiedAt: f.modifiedAt,
              })),
            ...textFiles
              .filter((f) => f.parentId === null)
              .map((f) => ({ id: f.id, name: f.title, kind: 2, size: f.content.length, modifiedAt: f.modifiedAt })),
          ],
          sortBy
        ).map((item, i) => [item.id, defaultIconPos(i)])
      )
    : null;

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

  function moveIconEnd(id: WindowId, x: number, y: number) {
    if (!alignToGrid) return;
    const { iconX, iconY } = snapToGrid(x, y);
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
        modifiedAt: Date.now(),
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

  function moveFolderIconEnd(id: string, x: number, y: number) {
    if (!alignToGrid) return;
    const { iconX, iconY } = snapToGrid(x, y);
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, iconX, iconY } : f)));
  }

  function commitFolderRename(id: string, name: string) {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, title: name, modifiedAt: Date.now() } : f)));
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
        modifiedAt: Date.now(),
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

  function moveTextFileIconEnd(id: string, x: number, y: number) {
    if (!alignToGrid) return;
    const { iconX, iconY } = snapToGrid(x, y);
    setTextFiles((prev) => prev.map((f) => (f.id === id ? { ...f, iconX, iconY } : f)));
  }

  function commitTextFileRename(id: string, name: string) {
    setTextFiles((prev) => prev.map((f) => (f.id === id ? { ...f, title: name, modifiedAt: Date.now() } : f)));
    setRenamingItemId(null);
  }

  function updateTextFileContent(id: string, content: string) {
    setTextFiles((prev) => prev.map((f) => (f.id === id ? { ...f, content, modifiedAt: Date.now() } : f)));
  }

  function deleteTextFile(id: string, name: string) {
    if (!window.confirm(`ลบไฟล์ "${name}" ถาวร?`)) return;
    setTextFiles((prev) => prev.filter((f) => f.id !== id));
  }

  // Every window/folder/text file regardless of open state, for the taskbar
  // search box and as a lookup for pinned-but-closed taskbar icons.
  const searchItems: TaskbarItem[] = [
    ...windows.map((w) => ({ id: w.id, icon: w.icon, title: w.title })),
    ...folders.map((f) => ({ id: f.id, icon: f.icon, title: f.title })),
    ...textFiles.map((f) => ({ id: f.id, icon: f.icon, title: f.title })),
  ];
  const itemsById = new Map(searchItems.map((item) => [item.id, item]));

  const openIds = new Set<string>([
    ...windows.filter((w) => w.open).map((w) => w.id as string),
    ...folders.filter((f) => f.open).map((f) => f.id),
    ...textFiles.filter((f) => f.open).map((f) => f.id),
  ]);
  const pinnedSet = new Set(pinnedTaskbarIds);

  // Pinned apps stay in the taskbar even when closed, in pin order, each as
  // its own slot. Windows (built-in apps) are single-instance so each open
  // one also gets its own slot. Folders and text files aren't — like Windows
  // grouping multiple File Explorer windows under one icon, every open,
  // unpinned instance of the same kind collapses into a single slot that
  // opens a small picker when there's more than one.
  const pinnedSlots: TaskbarIcon[] = pinnedTaskbarIds
    .filter((id) => itemsById.has(id))
    .map((id) => {
      const item = itemsById.get(id)!;
      return { ...item, open: openIds.has(id), pinned: true, members: [item] };
    });

  const openWindowSlots: TaskbarIcon[] = windows
    .filter((w) => w.open && !pinnedSet.has(w.id))
    .map((w) => {
      const item = itemsById.get(w.id)!;
      return { ...item, open: true, pinned: false, members: [item] };
    });

  function groupedSlots(ids: string[], icon: string, title: string): TaskbarIcon[] {
    const unpinned = ids.filter((id) => !pinnedSet.has(id));
    if (unpinned.length === 0) return [];
    const members = unpinned.map((id) => itemsById.get(id)!);
    if (members.length === 1) {
      return [{ ...members[0], open: true, pinned: false, members }];
    }
    return [{ id: `group:${title}`, icon, title, open: true, pinned: false, members }];
  }

  const taskbarItems: TaskbarIcon[] = [
    ...pinnedSlots,
    ...openWindowSlots,
    ...groupedSlots(
      folders.filter((f) => f.open).map((f) => f.id),
      "📁",
      "File Explorer"
    ),
    ...groupedSlots(
      textFiles.filter((f) => f.open).map((f) => f.id),
      "📝",
      "Notepad"
    ),
  ];

  function selectTaskbarItem(id: string) {
    if (id.startsWith("folder-")) return openFolder(id);
    if (id.startsWith("file-")) return openTextFile(id);
    return openWindow(id as WindowId);
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-wall1 to-wall2"
      style={bgColor ? { background: bgColor } : undefined}
      onContextMenu={(e) => {
        e.preventDefault();
        const clientX = e.clientX;
        const clientY = e.clientY;
        setContextMenu({
          x: clientX,
          y: clientY,
          items: [
            {
              label: "View",
              children: [
                { label: "Large icons", checked: iconSize === "large", onClick: () => setIconSize("large") },
                { label: "Medium icons", checked: iconSize === "medium", onClick: () => setIconSize("medium") },
                { label: "Small icons", checked: iconSize === "small", onClick: () => setIconSize("small") },
                { label: "Auto arrange icons", checked: autoArrange, onClick: () => setAutoArrange((v) => !v) },
                { label: "Align icons to grid", checked: alignToGrid, onClick: () => setAlignToGrid((v) => !v) },
              ],
            },
            {
              label: "Sort by",
              children: [
                { label: "Name", checked: sortBy === "name", onClick: () => sortDesktopBy("name") },
                { label: "Size", checked: sortBy === "size", onClick: () => sortDesktopBy("size") },
                { label: "Item type", checked: sortBy === "type", onClick: () => sortDesktopBy("type") },
                { label: "Date modified", checked: sortBy === "date", onClick: () => sortDesktopBy("date") },
              ],
            },
            { label: "Refresh", onClick: () => window.location.reload() },
            { label: "New Folder", onClick: () => createFolder(null, clientX, clientY) },
            { label: "New Text File", onClick: () => createTextFile(null, clientX, clientY) },
            { label: "Change Background", onClick: () => setBgPickerOpen(true) },
          ],
        });
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.10),transparent_45%)]" />

      {/* Desktop icons */}
      <div className="absolute left-0 right-0 top-0 bottom-[52px]">
        {windows.map((w) => {
          const pos = autoArrangePositions?.get(w.id) ?? { iconX: w.iconX, iconY: w.iconY };
          return (
            <DesktopIcon
              key={w.id}
              icon={w.icon}
              label={w.title}
              x={pos.iconX}
              y={pos.iconY}
              size={iconSize}
              draggable={!autoArrange}
              onOpen={() => openWindow(w.id)}
              onMove={(x, y) => moveIcon(w.id, x, y)}
              onMoveEnd={(x, y) => moveIconEnd(w.id, x, y)}
            />
          );
        })}
        {folders.filter((f) => f.parentId === null).map((f) => {
          const pos = autoArrangePositions?.get(f.id) ?? { iconX: f.iconX, iconY: f.iconY };
          return (
            <DesktopIcon
              key={f.id}
              icon={f.icon}
              label={f.title}
              x={pos.iconX}
              y={pos.iconY}
              size={iconSize}
              draggable={!autoArrange}
              onOpen={() => openFolder(f.id)}
              onMove={(x, y) => moveFolderIcon(f.id, x, y)}
              onMoveEnd={(x, y) => moveFolderIconEnd(f.id, x, y)}
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
          );
        })}
        {textFiles.filter((f) => f.parentId === null).map((f) => {
          const pos = autoArrangePositions?.get(f.id) ?? { iconX: f.iconX, iconY: f.iconY };
          return (
            <DesktopIcon
              key={f.id}
              icon={f.icon}
              label={f.title}
              x={pos.iconX}
              y={pos.iconY}
              size={iconSize}
              draggable={!autoArrange}
              onOpen={() => openTextFile(f.id)}
              onMove={(x, y) => moveTextFileIcon(f.id, x, y)}
              onMoveEnd={(x, y) => moveTextFileIconEnd(f.id, x, y)}
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
          );
        })}
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
            iconSize={iconSize}
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
      <Taskbar
        items={taskbarItems}
        searchItems={searchItems}
        onToggleStart={() => setStartOpen((v) => !v)}
        onSelectItem={selectTaskbarItem}
        onItemContextMenu={(item, x, y) =>
          setContextMenu({
            x,
            y,
            items: [
              item.pinned
                ? { label: "Unpin from taskbar", onClick: () => unpinFromTaskbar(item.id) }
                : { label: "Pin to taskbar", onClick: () => pinToTaskbar(item.id) },
            ],
          })
        }
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}

      {bgPickerOpen && (
        <BackgroundPicker
          current={bgColor}
          onSelect={(bg) => {
            applyBackground(bg);
            setBgPickerOpen(false);
          }}
          onClose={() => setBgPickerOpen(false)}
        />
      )}
    </div>
  );
}
