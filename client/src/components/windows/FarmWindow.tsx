import { useEffect, useRef, useState } from "react";

type PlotState = "empty" | "growing" | "ready";

interface Plot {
  state: PlotState;
  crop: CropId | null;
  plantedAt: number | null;
}

type CropId = "carrot" | "wheat" | "pumpkin";

interface Crop {
  id: CropId;
  name: string;
  icon: string;
  growMs: number;
  cost: number;
  reward: number;
}

interface Burst {
  id: number;
  plotIndex: number;
  reward: number;
}

interface Point {
  x: number;
  y: number;
}

const CROPS: Crop[] = [
  { id: "carrot", name: "แครอท", icon: "🥕", growMs: 15000, cost: 2, reward: 5 },
  { id: "wheat", name: "ข้าวสาลี", icon: "🌾", growMs: 30000, cost: 4, reward: 12 },
  { id: "pumpkin", name: "ฟักทอง", icon: "🎃", growMs: 60000, cost: 8, reward: 28 },
];

const PLOT_COUNT = 9 ; // number of plots in the farm
const STORAGE_KEY = "jedos-farm-save"; // localStorage key for saving coins and plot states
const BURST_MS = 700; // duration of the sparkle + reward float animation
const WALK_MS = 1000; // time it takes to walk from one plot to another 1000ms -> 1 second

function makeEmptyPlots(): Plot[] {
  return Array.from({ length: PLOT_COUNT }, () => ({ state: "empty", crop: null, plantedAt: null }));
}

function loadSave(): { coins: number; plots: Plot[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { coins: 10, plots: makeEmptyPlots() };
    const parsed = JSON.parse(raw);
    if (typeof parsed.coins !== "number" || !Array.isArray(parsed.plots) || parsed.plots.length !== PLOT_COUNT) {
      return { coins: 10, plots: makeEmptyPlots() };
    }
    return parsed;
  } catch {
    return { coins: 10, plots: makeEmptyPlots() };
  }
}

function feetPos(el: HTMLElement, container: HTMLElement): Point {
  const r = el.getBoundingClientRect();
  const c = container.getBoundingClientRect();
  return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height };
}

export function FarmWindow() {
  const [coins, setCoins] = useState(() => loadSave().coins);
  const [plots, setPlots] = useState<Plot[]>(() => loadSave().plots);
  const [selectedCrop, setSelectedCrop] = useState<CropId>("carrot");
  const [now, setNow] = useState(Date.now());
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstId = useRef(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const spawnRef = useRef<HTMLDivElement>(null);
  const plotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const posRef = useRef<Point | null>(null);
  const [charPos, setCharPos] = useState<Point | null>(null);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [walking, setWalking] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins, plots }));
  }, [coins, plots]);

  useEffect(() => {
    setPlots((prev) =>
      prev.map((plot) => {
        if (plot.state !== "growing" || !plot.crop || !plot.plantedAt) return plot;
        const crop = CROPS.find((c) => c.id === plot.crop)!;
        if (now - plot.plantedAt >= crop.growMs) {
          return { ...plot, state: "ready" };
        }
        return plot;
      })
    );
  }, [now]);

  useEffect(() => {
    const container = wrapperRef.current;
    const spawn = spawnRef.current;
    if (!container || !spawn) return;
    const pos = feetPos(spawn, container);
    posRef.current = pos;
    setCharPos(pos);
  }, []);

  function walkTo(el: HTMLElement | null, after: () => void) {
    const container = wrapperRef.current;
    if (!el || !container) {
      after();
      return;
    }
    const pos = feetPos(el, container);
    if (posRef.current) setFacing(pos.x >= posRef.current.x ? 1 : -1);
    posRef.current = pos;
    setCharPos(pos);
    setWalking(true);
    window.setTimeout(() => {
      setWalking(false);
      after();
    }, WALK_MS);
  }

  function plant(index: number) {
    const crop = CROPS.find((c) => c.id === selectedCrop)!;
    if (coins < crop.cost) return;
    setCoins((c) => c - crop.cost);
    setPlots((prev) =>
      prev.map((plot, i) => (i === index ? { state: "growing", crop: crop.id, plantedAt: Date.now() } : plot))
    );
  }

  function harvest(index: number) {
    setPlots((prev) => {
      const plot = prev[index];
      if (plot.state !== "ready" || !plot.crop) return prev;
      const crop = CROPS.find((c) => c.id === plot.crop)!;
      setCoins((c) => c + crop.reward);

      const id = burstId.current++;
      setBursts((b) => [...b, { id, plotIndex: index, reward: crop.reward }]);
      setTimeout(() => setBursts((b) => b.filter((burst) => burst.id !== id)), BURST_MS);

      return prev.map((p, i) => (i === index ? { state: "empty", crop: null, plantedAt: null } : p));
    });
  }

  function onPlotClick(index: number) {
    if (walking) return;
    const plot = plots[index];
    const el = plotRefs.current[index];
    if (plot.state === "empty") {
      const crop = CROPS.find((c) => c.id === selectedCrop)!;
      if (coins < crop.cost) return;
      walkTo(el, () => plant(index));
    } else if (plot.state === "ready") {
      walkTo(el, () => harvest(index));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">🪙 เหรียญ</span>
        <span key={coins} className="inline-block text-sm font-semibold tabular-nums text-neutral-700 [animation:coinBump_0.4s_ease]">
          {coins}
        </span>
      </div>

      <div className="flex gap-1.5">
        {CROPS.map((crop) => (
          <button
            key={crop.id}
            onClick={() => setSelectedCrop(crop.id)}
            disabled={coins < crop.cost}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              selectedCrop === crop.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            <span className="text-base leading-none">{crop.icon}</span>
            <span className="font-medium">{crop.name}</span>
            <span className="text-[10px] text-neutral-400">฿{crop.cost} → +{crop.reward}</span>
          </button>
        ))}
      </div>

      <div ref={wrapperRef} className="relative pb-6">
        <div className="grid grid-cols-3 gap-2">
          {plots.map((plot, i) => {
            const crop = plot.crop ? CROPS.find((c) => c.id === plot.crop)! : null;
            const progress =
              plot.state === "growing" && plot.plantedAt && crop
                ? Math.min(1, (now - plot.plantedAt) / crop.growMs)
                : 0;
            const plotBursts = bursts.filter((b) => b.plotIndex === i);

            return (
              <button
                key={i}
                ref={(el) => {
                  plotRefs.current[i] = el;
                }}
                onClick={() => onPlotClick(i)}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border text-2xl transition-colors ${
                  plot.state === "ready"
                    ? "border-accent2 bg-accent2/10 hover:bg-accent2/20"
                    : plot.state === "growing"
                      ? "border-neutral-200 bg-neutral-50"
                      : "border-dashed border-neutral-200 text-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {plot.state === "empty" && <span key="empty" className="[animation:plantPop_0.3s_ease]">➕</span>}

                {plot.state === "growing" && (
                  <span
                    key="growing"
                    className="inline-block origin-bottom [animation:plantPop_0.3s_ease,growSway_1.8s_ease-in-out_infinite]"
                    style={{ transform: `scale(${0.55 + progress * 0.45})` }}
                  >
                    🌱
                  </span>
                )}

                {plot.state === "ready" && (
                  <span key="ready" className="inline-block [animation:readyGlow_1s_ease-in-out_infinite]">
                    {crop?.icon}
                  </span>
                )}

                {plot.state === "growing" && (
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-neutral-200">
                    <div
                      className="h-full bg-accent transition-[width] duration-200"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                )}

                {plotBursts.map((b) => (
                  <div key={b.id} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="absolute text-base [animation:sparkleBurst_0.6s_ease-out]">✨</span>
                    <span className="absolute -top-1 text-xs font-bold text-accent2 [animation:floatUp_0.7s_ease-out]">
                      +{b.reward}
                    </span>
                  </div>
                ))}
              </button>
            );
          })}
        </div>

        {/* idle spawn point for the farmer, sits below the plot grid */}
        <div ref={spawnRef} className="absolute bottom-0 left-1/2 h-px w-px" />

        {charPos && (
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 transition-transform ease-in-out"
            style={{
              transform: `translate(${charPos.x}px, ${charPos.y}px) translate(-50%, -100%)`,
              transitionDuration: `${WALK_MS}ms`,
            }}
          >
            <div className="h-1.5 w-3.5 rounded-full bg-black/20 blur-[1px]" />
            <div style={{ transform: `scaleX(${facing})` }}>
              <span
                className={`block text-xl drop-shadow ${
                  walking ? "[animation:walkBob_0.3s_ease-in-out_infinite]" : "[animation:idleBob_1.6s_ease-in-out_infinite]"
                }`}
              >
                🧑‍🌾
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-neutral-400">
        เลือกพืช แล้วกดช่องว่างเพื่อปลูก · รอโต · กดเก็บเกี่ยวตอนพร้อม
      </p>
    </div>
  );
}
