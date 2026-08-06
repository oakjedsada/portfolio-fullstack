import { useCallback, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

/**
 * Drag a window by its title bar using pointer events.
 * onMove is called continuously with the new top-left position.
 */
export function useDraggable(onMove: (pos: Position) => void) {
  const offset = useRef<Position>({ x: 0, y: 0 });
  const dragging = useRef(false);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current) return;
      onMove({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    },
    [onMove]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, currentPos: Position) => {
      dragging.current = true;
      offset.current = {
        x: e.clientX - currentPos.x,
        y: e.clientY - currentPos.y,
      };
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [handlePointerMove, handlePointerUp]
  );

  return { onPointerDown };
}
