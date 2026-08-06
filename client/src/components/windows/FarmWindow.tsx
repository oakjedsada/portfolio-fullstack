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
  unlockCost: number;
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

type UpgradeKind = "growth" | "yield";

interface Upgrades {
  growth: number;
  yield: number;
}

interface Save {
  coins: number;
  plots: Plot[];
  unlockedPlots: boolean[];
  unlockedCrops: Record<CropId, boolean>;
  upgrades: Upgrades;
}

const CROPS: Crop[] = [
  { id: "carrot", name: "แครอท", icon: "🥕", growMs: 15000, cost: 2, reward: 5, unlockCost: 0 },
  { id: "wheat", name: "ข้าวสาลี", icon: "🌾", growMs: 30000, cost: 4, reward: 12, unlockCost: 40 },
  { id: "pumpkin", name: "ฟักทอง", icon: "🎃", growMs: 60000, cost: 8, reward: 28, unlockCost: 120 },
];

const PLOT_COUNT = 9; // number of plots in the farm
const PLOT_UNLOCK_COST = [0, 0, 0, 25, 45, 70, 100, 140, 190]; // first 3 plots start unlocked
const STORAGE_KEY = "jedos-farm-save"; // localStorage key for saving coins and plot states
const BURST_MS = 700; // duration of the sparkle + reward float animation
const WALK_MS = 1000; // time it takes to walk from one plot to another 1000ms -> 1 second

const UPGRADE_MAX_LEVEL = 5;
const UPGRADE_COST_MULT = 1.8;
const UPGRADE_INFO: Record<UpgradeKind, { label: string; icon: string; baseCost: number; effect: string }> = {
  growth: { label: "โตเร็วขึ้น", icon: "⚡", baseCost: 50, effect: "-10%/lv เวลาโต" },
  yield: { label: "ผลผลิตเพิ่ม", icon: "💰", baseCost: 60, effect: "+10%/lv รางวัล" },
};

function makeEmptyPlots(): Plot[] {
  return Array.from({ length: PLOT_COUNT }, () => ({ state: "empty", crop: null, plantedAt: null }));
}

function defaultSave(): Save {
  return {
    coins: 10,
    plots: makeEmptyPlots(),
    unlockedPlots: PLOT_UNLOCK_COST.map((cost) => cost === 0),
    unlockedCrops: { carrot: true, wheat: false, pumpkin: false },
    upgrades: { growth: 0, yield: 0 },
  };
}

function loadSave(): Save {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    const valid =
      typeof parsed.coins === "number" &&
      Array.isArray(parsed.plots) &&
      parsed.plots.length === PLOT_COUNT &&
      Array.isArray(parsed.unlockedPlots) &&
      parsed.unlockedPlots.length === PLOT_COUNT &&
      parsed.unlockedCrops &&
      typeof parsed.unlockedCrops === "object" &&
      parsed.upgrades &&
      typeof parsed.upgrades.growth === "number" &&
      typeof parsed.upgrades.yield === "number";
    return valid ? (parsed as Save) : defaultSave();
  } catch {
    return defaultSave();
  }
}

function feetPos(el: HTMLElement, container: HTMLElement): Point {
  const r = el.getBoundingClientRect();
  const c = container.getBoundingClientRect();
  return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height };
}

function effectiveGrowMs(crop: Crop, growthLevel: number): number {
  return crop.growMs * Math.pow(0.9, growthLevel);
}

function effectiveReward(crop: Crop, yieldLevel: number): number {
  return Math.round(crop.reward * (1 + 0.1 * yieldLevel));
}

function upgradeCost(kind: UpgradeKind, level: number): number {
  return Math.round(UPGRADE_INFO[kind].baseCost * Math.pow(UPGRADE_COST_MULT, level));
}

export function FarmWindow() {
  const initialSave = useRef<Save | null>(null);
  if (!initialSave.current) initialSave.current = loadSave();
  const save = initialSave.current;

  const [coins, setCoins] = useState(save.coins);
  const [plots, setPlots] = useState<Plot[]>(save.plots);
  const [unlockedPlots, setUnlockedPlots] = useState<boolean[]>(save.unlockedPlots);
  const [unlockedCrops, setUnlockedCrops] = useState<Record<CropId, boolean>>(save.unlockedCrops);
  const [upgrades, setUpgrades] = useState<Upgrades>(save.upgrades);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins, plots, unlockedPlots, unlockedCrops, upgrades }));
  }, [coins, plots, unlockedPlots, unlockedCrops, upgrades]);

  // Safety net: spending down to fewer coins than the cheapest crop with nothing
  // growing or ready is an unrecoverable softlock, so top up just enough to plant again.
  useEffect(() => {
    const anyActive = plots.some((p) => p.state === "growing" || p.state === "ready");
    if (anyActive) return;
    const cheapest = Math.min(...CROPS.filter((c) => unlockedCrops[c.id]).map((c) => c.cost));
    if (coins < cheapest) setCoins(cheapest);
  }, [coins, plots, unlockedCrops]);

  useEffect(() => {
    setPlots((prev) =>
      prev.map((plot) => {
        if (plot.state !== "growing" || !plot.crop || !plot.plantedAt) return plot;
        const crop = CROPS.find((c) => c.id === plot.crop)!;
        if (now - plot.plantedAt >= effectiveGrowMs(crop, upgrades.growth)) {
          return { ...plot, state: "ready" };
        }
        return plot;
      })
    );
  }, [now, upgrades.growth]);

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
      const reward = effectiveReward(crop, upgrades.yield);
      setCoins((c) => c + reward);

      const id = burstId.current++;
      setBursts((b) => [...b, { id, plotIndex: index, reward }]);
      setTimeout(() => setBursts((b) => b.filter((burst) => burst.id !== id)), BURST_MS);

      return prev.map((p, i) => (i === index ? { state: "empty", crop: null, plantedAt: null } : p));
    });
  }

  function unlockPlot(index: number) {
    const cost = PLOT_UNLOCK_COST[index];
    setCoins((c) => c - cost);
    setUnlockedPlots((prev) => prev.map((v, i) => (i === index ? true : v)));
  }

  function onPlotClick(index: number) {
    if (walking) return;
    const el = plotRefs.current[index];

    if (!unlockedPlots[index]) {
      if (coins < PLOT_UNLOCK_COST[index]) return;
      walkTo(el, () => unlockPlot(index));
      return;
    }

    const plot = plots[index];
    if (plot.state === "empty") {
      const crop = CROPS.find((c) => c.id === selectedCrop)!;
      if (coins < crop.cost) return;
      walkTo(el, () => plant(index));
    } else if (plot.state === "ready") {
      walkTo(el, () => harvest(index));
    }
  }

  function onCropClick(crop: Crop) {
    if (unlockedCrops[crop.id]) {
      setSelectedCrop(crop.id);
      return;
    }
    if (coins < crop.unlockCost) return;
    setCoins((c) => c - crop.unlockCost);
    setUnlockedCrops((u) => ({ ...u, [crop.id]: true }));
    setSelectedCrop(crop.id);
  }

  function buyUpgrade(kind: UpgradeKind) {
    const level = upgrades[kind];
    if (level >= UPGRADE_MAX_LEVEL) return;
    const cost = upgradeCost(kind, level);
    if (coins < cost) return;
    setCoins((c) => c - cost);
    setUpgrades((u) => ({ ...u, [kind]: u[kind] + 1 }));
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
        {CROPS.map((crop) => {
          const unlocked = unlockedCrops[crop.id];
          const affordable = unlocked ? coins >= crop.cost : coins >= crop.unlockCost;
          return (
            <button
              key={crop.id}
              onClick={() => onCropClick(crop)}
              disabled={!affordable}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                selectedCrop === crop.id && unlocked
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              {unlocked ? (
                <>
                  <span className="text-base leading-none">{crop.icon}</span>
                  <span className="font-medium">{crop.name}</span>
                  <span className="text-[10px] text-neutral-400">
                    ฿{crop.cost} → +{effectiveReward(crop, upgrades.yield)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base leading-none opacity-50">🔒</span>
                  <span className="font-medium">{crop.name}</span>
                  <span className="text-[10px] text-neutral-400">ปลดล็อค ฿{crop.unlockCost}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-1.5">
        {(Object.keys(UPGRADE_INFO) as UpgradeKind[]).map((kind) => {
          const level = upgrades[kind];
          const maxed = level >= UPGRADE_MAX_LEVEL;
          const cost = upgradeCost(kind, level);
          const info = UPGRADE_INFO[kind];
          return (
            <button
              key={kind}
              onClick={() => buyUpgrade(kind)}
              disabled={maxed || coins < cost}
              title={info.effect}
              className="flex flex-1 items-center justify-between rounded-lg border border-neutral-200 px-2 py-1.5 text-[11px] text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>
                {info.icon} {info.label} Lv.{level}
              </span>
              <span className="font-semibold text-neutral-500">{maxed ? "MAX" : `฿${cost}`}</span>
            </button>
          );
        })}
      </div>

      <div ref={wrapperRef} className="relative pb-6">
        <div className="grid grid-cols-3 gap-2">
          {plots.map((plot, i) => {
            if (!unlockedPlots[i]) {
              const cost = PLOT_UNLOCK_COST[i];
              return (
                <button
                  key={i}
                  ref={(el) => {
                    plotRefs.current[i] = el;
                  }}
                  onClick={() => onPlotClick(i)}
                  disabled={coins < cost}
                  className="relative flex h-16 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-neutral-200 text-neutral-300 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-xl">🔒</span>
                  <span className="text-[10px] font-medium text-neutral-400">฿{cost}</span>
                </button>
              );
            }

            const crop = plot.crop ? CROPS.find((c) => c.id === plot.crop)! : null;
            const growMs = crop ? effectiveGrowMs(crop, upgrades.growth) : 0;
            const progress =
              plot.state === "growing" && plot.plantedAt && crop ? Math.min(1, (now - plot.plantedAt) / growMs) : 0;
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
