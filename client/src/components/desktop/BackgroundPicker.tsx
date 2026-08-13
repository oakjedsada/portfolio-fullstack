import { useState } from "react";
import { HueSatPicker } from "./HueSatPicker";

interface Preset {
  name: string;
  value: string;
}

const PRESETS: Preset[] = [
  { name: "Ocean Blue", value: "linear-gradient(to bottom right, #5b7a99, #2c3e50)" },
  { name: "Purple Dusk", value: "linear-gradient(to bottom right, #6d5b99, #2c2c50)" },
  { name: "Forest Green", value: "linear-gradient(to bottom right, #4f8a6d, #1f3a2c)" },
  { name: "Sunset Orange", value: "linear-gradient(to bottom right, #e08a4f, #7a3b1f)" },
  { name: "Midnight", value: "linear-gradient(to bottom right, #2c3350, #0e1320)" },
  { name: "Rose", value: "linear-gradient(to bottom right, #b0668f, #4a2038)" },
  { name: "Teal", value: "linear-gradient(to bottom right, #4fa8a0, #1f4a45)" },
  { name: "Slate", value: "linear-gradient(to bottom right, #6b7280, #1f2937)" },
];

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

interface BackgroundPickerProps {
  current: string | null;
  onSelect: (background: string) => void;
  onClose: () => void;
}

export function BackgroundPicker({ current, onSelect, onClose }: BackgroundPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customHex, setCustomHex] = useState("#5b7a99");
  const validHex = HEX_PATTERN.test(customHex);

  function applyCustom() {
    if (validHex) onSelect(customHex);
  }

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[10000] w-[320px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-neutral-100 shadow-window animate-[winopen_0.15s_ease]">
        <div className="flex items-center justify-between bg-gradient-to-b from-[#3f4a70] to-winbar px-4 py-3 text-sm font-semibold text-white">
          <span>🖼️ Change Background</span>
          <button
            onClick={onClose}
            aria-label="close"
            className="flex h-5 w-5 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                title={p.name}
                onClick={() => onSelect(p.value)}
                className={`h-12 w-12 rounded-lg ring-2 ring-offset-2 ring-offset-neutral-100 transition-transform hover:scale-105 ${
                  current === p.value ? "ring-accent" : "ring-transparent"
                }`}
                style={{ background: p.value }}
              />
            ))}
            <button
              title="เลือกสีเอง"
              onClick={() => setShowCustom((v) => !v)}
              className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed text-lg transition-colors ${
                showCustom ? "border-accent text-accent" : "border-neutral-300 text-neutral-400 hover:border-accent hover:text-accent"
              }`}
            >
              +
            </button>
          </div>

          {showCustom && (
            <div className="mt-3 flex flex-col gap-2">
              <HueSatPicker onChange={setCustomHex} />
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 flex-shrink-0 rounded-md border border-neutral-300"
                  style={{ background: validHex ? customHex : "#ffffff" }}
                />
                <input
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyCustom()}
                  placeholder="#5b7a99"
                  maxLength={7}
                  spellCheck={false}
                  className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm text-neutral-800 outline-none focus:border-accent"
                />
                <button
                  disabled={!validHex}
                  onClick={applyCustom}
                  className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-40"
                >
                  ใช้
                </button>
              </div>
            </div>
          )}

          <p className="mt-3 text-center text-[11px] text-neutral-400">
            เลือกพื้นหลังสำเร็จรูป หรือกด + เพื่อลากเลือกสีเอง
          </p>
        </div>
      </div>
    </>
  );
}
