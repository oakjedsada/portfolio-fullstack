import { useCallback, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

/**
 * Drag a window by its title bar using pointer events.
 * onMove is called continuously with the new top-left position; onEnd (optional)
 * is called once with the final position when the drag is released — e.g. to
 * snap-to-grid only on drop instead of jumping between cells during the drag.
 */
export function useDraggable(onMove: (pos: Position) => void, onEnd?: (pos: Position) => void) {
  const offset = useRef<Position>({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef<Position>({ x: 0, y: 0 });

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current) return;
      const pos = {
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      };
      lastPos.current = pos;
      onMove(pos);
    },
    [onMove]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    onEnd?.(lastPos.current);
  }, [handlePointerMove, onEnd]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, currentPos: Position) => {
      dragging.current = true;
      offset.current = {
        x: e.clientX - currentPos.x,
        y: e.clientY - currentPos.y,
      };
      lastPos.current = currentPos;
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [handlePointerMove, handlePointerUp]
  );

  return { onPointerDown };
}
