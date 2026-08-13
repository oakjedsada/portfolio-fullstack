import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface HueSatPickerProps {
  onChange: (hex: string) => void;
}

/** A hue slider + saturation/value square, for picking any color without knowing its hex code. */
export function HueSatPicker({ onChange }: HueSatPickerProps) {
  const [hue, setHue] = useState(213);
  const [sat, setSat] = useState(0.45);
  const [val, setVal] = useState(0.6);
  const squareRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  function dragSquare(e: ReactPointerEvent) {
    const rect = squareRef.current?.getBoundingClientRect();
    if (!rect) return;

    function apply(clientX: number, clientY: number) {
      const s = Math.min(1, Math.max(0, (clientX - rect!.left) / rect!.width));
      const v = 1 - Math.min(1, Math.max(0, (clientY - rect!.top) / rect!.height));
      setSat(s);
      setVal(v);
      onChange(hsvToHex(hue, s, v));
    }

    apply(e.clientX, e.clientY);
    const onMove = (ev: PointerEvent) => apply(ev.clientX, ev.clientY);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function dragHue(e: ReactPointerEvent) {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;

    function apply(clientX: number) {
      const h = Math.min(1, Math.max(0, (clientX - rect!.left) / rect!.width)) * 360;
      setHue(h);
      onChange(hsvToHex(h, sat, val));
    }

    apply(e.clientX);
    const onMove = (ev: PointerEvent) => apply(ev.clientX);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const pureHue = hsvToHex(hue, 1, 1);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={squareRef}
        onPointerDown={dragSquare}
        className="relative h-28 w-full cursor-crosshair touch-none rounded-md"
        style={{
          backgroundColor: pureHue,
          backgroundImage: "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
        }}
      >
        <div
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{ left: `${sat * 100}%`, top: `${(1 - val) * 100}%` }}
        />
      </div>
      <div
        ref={hueRef}
        onPointerDown={dragHue}
        className="relative h-3 w-full cursor-pointer touch-none rounded-full"
        style={{ background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" }}
      >
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{ left: `${(hue / 360) * 100}%`, background: pureHue }}
        />
      </div>
    </div>
  );
}
