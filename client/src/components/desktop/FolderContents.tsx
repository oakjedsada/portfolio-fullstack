import type { MouseEvent } from "react";
import type { FolderState, TextFileState } from "../../types";
import { DesktopIcon } from "./DesktopIcon";
import type { IconSize } from "./DesktopIcon";
import { ICON_BOX_WIDTH } from "./DesktopIcon";
import type { ContextMenuItem } from "./ContextMenu";
import { useWindowMaximized } from "../../hooks/useWindowMaximized";

interface FolderContentsProps {
  folderId: string;
  folders: FolderState[];
  textFiles: TextFileState[];
  renamingItemId: string | null;
  iconSize: IconSize;
  onOpenFolder: (id: string) => void;
  onOpenTextFile: (id: string) => void;
  onRenameStart: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onRenameTextFile: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteTextFile: (id: string, name: string) => void;
  onCreateFolder: (parentId: string) => void;
  onCreateTextFile: (parentId: string) => void;
  setContextMenu: (menu: { x: number; y: number; items: ContextMenuItem[] } | null) => void;
}

export function FolderContents({
  folderId,
  folders,
  textFiles,
  renamingItemId,
  iconSize,
  onOpenFolder,
  onOpenTextFile,
  onRenameStart,
  onRenameFolder,
  onRenameTextFile,
  onDeleteFolder,
  onDeleteTextFile,
  onCreateFolder,
  onCreateTextFile,
  setContextMenu,
}: FolderContentsProps) {
  const maximized = useWindowMaximized();
  const childFolders = folders.filter((f) => f.parentId === folderId);
  const childTextFiles = textFiles.filter((f) => f.parentId === folderId);
  const sizeClass = maximized ? "flex-1" : "h-[280px]";

  function openMenu(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: "New Folder", onClick: () => onCreateFolder(folderId) },
        { label: "New Text File", onClick: () => onCreateTextFile(folderId) },
      ],
    });
  }

  if (childFolders.length === 0 && childTextFiles.length === 0) {
    return (
      <div className={`-mx-5 -my-4 flex items-center justify-center p-4 ${sizeClass}`} onContextMenu={openMenu}>
        <p className="text-center text-neutral-400">โฟลเดอร์นี้ว่างเปล่า</p>
      </div>
    );
  }

  return (
    <div
      className={`-mx-5 -my-4 grid content-start gap-3 overflow-y-auto p-4 ${sizeClass}`}
      style={{ gridTemplateColumns: `repeat(auto-fill, ${ICON_BOX_WIDTH[iconSize]}px)` }}
      onContextMenu={openMenu}
    >
      {childFolders.map((f) => (
        <DesktopIcon
          key={f.id}
          icon={f.icon}
          label={f.title}
          size={iconSize}
          onOpen={() => onOpenFolder(f.id)}
          editing={renamingItemId === f.id}
          onRenameCommit={(name) => onRenameFolder(f.id, name)}
          onContextMenu={(e) =>
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              items: [
                { label: "Rename", onClick: () => onRenameStart(f.id) },
                { label: "Delete", danger: true, onClick: () => onDeleteFolder(f.id) },
              ],
            })
          }
        />
      ))}
      {childTextFiles.map((f) => (
        <DesktopIcon
          key={f.id}
          icon={f.icon}
          label={f.title}
          size={iconSize}
          onOpen={() => onOpenTextFile(f.id)}
          editing={renamingItemId === f.id}
          onRenameCommit={(name) => onRenameTextFile(f.id, name)}
          onContextMenu={(e) =>
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              items: [
                { label: "Rename", onClick: () => onRenameStart(f.id) },
                { label: "Delete", danger: true, onClick: () => onDeleteTextFile(f.id, f.title) },
              ],
            })
          }
        />
      ))}
    </div>
  );
}
