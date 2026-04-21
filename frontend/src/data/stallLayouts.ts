// Per-exhibition dynamic stall layout store (in-memory + localStorage persistence).
// Admin configures layout per exhibition; booking pages read from here.

export type StallStatus = "available" | "booked" | "reserved" | "blocked";
export type StallCategory = "Prime" | "Super" | "General";
export type LayoutMode = "image" | "grid";

export interface StallMarker {
  id: string;
  number: string;
  category: StallCategory;
  price: number;
  status: StallStatus;
  // Position & size are normalized 0-100 (% of canvas) so layouts stay responsive.
  x: number;
  y: number;
  w: number;
  h: number;
  bookedBy?: string;
}

export interface ExhibitionLayout {
  exhibitionId: string;
  mode: LayoutMode;
  layoutImage?: string; // data URL or http URL; only used when mode === "image"
  // Default counts/prices used by the auto-grid generator.
  counts: { Prime: number; Super: number; General: number };
  prices: { Prime: number; Super: number; General: number };
  stalls: StallMarker[];
  updatedAt: string;
}

const STORAGE_KEY = "amrut.stallLayouts.v1";

function loadFromStorage(): Record<string, ExhibitionLayout> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ExhibitionLayout>) : {};
  } catch {
    return {};
  }
}

function saveToStorage(map: Record<string, ExhibitionLayout>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota exceeded — ignore */
  }
}

const store: Record<string, ExhibitionLayout> = loadFromStorage();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
  saveToStorage(store);
}

export function subscribeLayouts(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getLayout(exhibitionId: string): ExhibitionLayout | undefined {
  return store[exhibitionId];
}

export function getAllLayouts(): Record<string, ExhibitionLayout> {
  return { ...store };
}

export function upsertLayout(layout: ExhibitionLayout) {
  store[layout.exhibitionId] = { ...layout, updatedAt: new Date().toISOString() };
  emit();
}

export function deleteLayout(exhibitionId: string) {
  delete store[exhibitionId];
  emit();
}

/** Auto-arrange stalls in a tidy grid based on counts & prices. */
export function generateGridLayout(
  exhibitionId: string,
  counts: { Prime: number; Super: number; General: number },
  prices: { Prime: number; Super: number; General: number },
): StallMarker[] {
  const total = counts.Prime + counts.Super + counts.General;
  if (total === 0) return [];

  const cols = Math.min(10, Math.max(4, Math.ceil(Math.sqrt(total * 1.4))));
  const rows = Math.ceil(total / cols);
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  const padX = cellW * 0.12;
  const padY = cellH * 0.18;

  const markers: StallMarker[] = [];
  let i = 0;
  const order: { cat: StallCategory; price: number }[] = [
    ...Array.from({ length: counts.Prime }, () => ({ cat: "Prime" as const, price: prices.Prime })),
    ...Array.from({ length: counts.Super }, () => ({ cat: "Super" as const, price: prices.Super })),
    ...Array.from({ length: counts.General }, () => ({ cat: "General" as const, price: prices.General })),
  ];

  for (const item of order) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    markers.push({
      id: `${exhibitionId}-stall-${i + 1}`,
      number: `S${String(i + 1).padStart(3, "0")}`,
      category: item.cat,
      price: item.price,
      status: "available",
      x: c * cellW + padX,
      y: r * cellH + padY,
      w: cellW - padX * 2,
      h: cellH - padY * 2,
    });
    i++;
  }
  return markers;
}

/** Aggregate counts for the dashboard / summary panels. */
export function summarizeLayout(layout?: ExhibitionLayout) {
  const empty = { total: 0, available: 0, booked: 0, reserved: 0, blocked: 0 };
  if (!layout) return empty;
  return layout.stalls.reduce(
    (acc, s) => {
      acc.total++;
      acc[s.status]++;
      return acc;
    },
    { ...empty },
  );
}
