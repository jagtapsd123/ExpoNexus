import { useRef, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import type { StallMarker, StallCategory, StallStatus } from "@/data/stallLayouts";

interface StallCanvasProps {
  stalls: StallMarker[];
  layoutImage?: string;
  /** "select" = exhibitor picks stalls. "edit" = admin places/moves/edits. "view" = read-only. */
  mode: "select" | "edit" | "view";
  selectedIds?: Set<string>;
  activeStallId?: string;
  onSelectStall?: (stall: StallMarker) => void;
  onMoveStall?: (id: string, x: number, y: number) => void;
  onCanvasClick?: (xPct: number, yPct: number) => void;
  className?: string;
  aspectRatio?: number; // width / height; default 16/9
}

const categoryClass: Record<StallCategory, { bg: string; border: string; text: string }> = {
  Prime: { bg: "bg-stall-prime/85", border: "border-stall-prime", text: "text-white" },
  Super: { bg: "bg-stall-super/85", border: "border-stall-super", text: "text-white" },
  General: { bg: "bg-stall-general/85", border: "border-stall-general", text: "text-white" },
};

const statusOverlay: Record<StallStatus, string> = {
  available: "",
  booked: "bg-muted/95 border-border text-muted-foreground",
  reserved: "bg-yellow-500/80 border-yellow-600 text-white",
  blocked: "bg-destructive/80 border-destructive text-white",
};

export function StallCanvas({
  stalls,
  layoutImage,
  mode,
  selectedIds,
  activeStallId,
  onSelectStall,
  onMoveStall,
  onCanvasClick,
  className,
  aspectRatio = 16 / 9,
}: StallCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(0.5, z - e.deltaY * 0.001)));
  }, []);

  const startPan = (e: React.MouseEvent) => {
    if (mode === "edit" && (e.target as HTMLElement).dataset.stallId) return;
    if (e.button !== 0 && e.button !== 1) return;
    if (mode !== "view" && !(e.shiftKey || e.button === 1)) return;
    panStartRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setPanning(true);
  };

  const movePan = (e: React.MouseEvent) => {
    if (dragRef.current && containerRef.current && onMoveStall) {
      const rect = containerRef.current.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left - pan.x) / (rect.width * zoom)) * 100;
      const yPct = ((e.clientY - rect.top - pan.y) / (rect.height * zoom)) * 100;
      onMoveStall(
        dragRef.current.id,
        Math.max(0, Math.min(95, xPct - dragRef.current.offsetX)),
        Math.max(0, Math.min(95, yPct - dragRef.current.offsetY)),
      );
      return;
    }
    if (!panning || !panStartRef.current) return;
    setPan({
      x: panStartRef.current.px + (e.clientX - panStartRef.current.x),
      y: panStartRef.current.py + (e.clientY - panStartRef.current.y),
    });
  };

  const endPan = () => {
    setPanning(false);
    panStartRef.current = null;
    dragRef.current = null;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (mode !== "edit" || !onCanvasClick) return;
    if ((e.target as HTMLElement).dataset.stallId) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left - pan.x) / (rect.width * zoom)) * 100;
    const yPct = ((e.clientY - rect.top - pan.y) / (rect.height * zoom)) * 100;
    onCanvasClick(Math.max(0, Math.min(95, xPct)), Math.max(0, Math.min(95, yPct)));
  };

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const visibleStalls = useMemo(
    () => (mode === "select" ? stalls.filter((s) => s.status !== "blocked") : stalls),
    [stalls, mode],
  );

  return (
    <div className={cn("relative", className)}>
      {/* Toolbar */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-card/95 backdrop-blur rounded-md border border-border shadow-sm p-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom((z) => Math.min(3, z + 0.2))} title="Zoom in">
          <ZoomIn size={14} />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))} title="Zoom out">
          <ZoomOut size={14} />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={reset} title="Reset view">
          <RotateCcw size={14} />
        </Button>
        <span className="text-[10px] text-muted-foreground px-1 hidden sm:flex items-center gap-1">
          <Move size={10} /> Shift+drag to pan
        </span>
      </div>

      <div
        ref={containerRef}
        onMouseDown={startPan}
        onMouseMove={movePan}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        className={cn(
          "relative w-full overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/30 select-none",
          panning && "cursor-grabbing",
          mode === "edit" && !panning && "cursor-crosshair",
        )}
        style={{ aspectRatio: String(aspectRatio) }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full origin-top-left transition-transform duration-75"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          {layoutImage ? (
            <img src={layoutImage} alt="Hall layout" className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false} />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:5%_5%] opacity-40" />
          )}

          <TooltipProvider delayDuration={150}>
            {visibleStalls.map((stall) => {
              const isSelected = selectedIds?.has(stall.id);
              const isActive = activeStallId === stall.id;
              const isBooked = stall.status === "booked";
              const isBlocked = stall.status === "blocked";
              const cat = categoryClass[stall.category];
              const interactive =
                (mode === "select" && stall.status === "available") ||
                mode === "edit";

              return (
                <Tooltip key={stall.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      data-stall-id={stall.id}
                      disabled={mode === "select" && (isBooked || isBlocked)}
                      onMouseDown={(e) => {
                        if (mode !== "edit" || !onMoveStall) return;
                        e.stopPropagation();
                        if (!containerRef.current) return;
                        const rect = containerRef.current.getBoundingClientRect();
                        const xPct = ((e.clientX - rect.left - pan.x) / (rect.width * zoom)) * 100;
                        const yPct = ((e.clientY - rect.top - pan.y) / (rect.height * zoom)) * 100;
                        dragRef.current = { id: stall.id, offsetX: xPct - stall.x, offsetY: yPct - stall.y };
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (dragRef.current) return;
                        if (mode === "select" && stall.status !== "available") return;
                        onSelectStall?.(stall);
                      }}
                      className={cn(
                        "absolute rounded border-2 flex flex-col items-center justify-center font-bold transition-all",
                        cat.bg,
                        cat.border,
                        cat.text,
                        isBooked && statusOverlay.booked,
                        stall.status === "reserved" && statusOverlay.reserved,
                        isBlocked && statusOverlay.blocked,
                        isSelected && "ring-4 ring-primary ring-offset-1 ring-offset-background scale-105 z-10",
                        isActive && "ring-2 ring-foreground z-10",
                        interactive ? "hover:brightness-110 hover:shadow-lg cursor-pointer" : "cursor-not-allowed",
                        mode === "edit" && "cursor-move",
                      )}
                      style={{
                        left: `${stall.x}%`,
                        top: `${stall.y}%`,
                        width: `${stall.w}%`,
                        height: `${stall.h}%`,
                        fontSize: `${Math.max(8, Math.min(14, stall.w * 0.7))}px`,
                      }}
                    >
                      <span className="leading-none">{stall.number}</span>
                      <span className="text-[0.65em] opacity-90 leading-none mt-0.5">{stall.category[0]}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <div className="font-semibold">{stall.number} · {stall.category}</div>
                    <div>₹{stall.price.toLocaleString()}</div>
                    <div className="capitalize text-muted-foreground">{stall.status}</div>
                    {stall.bookedBy && <div className="text-muted-foreground">By {stall.bookedBy}</div>}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>

        {visibleStalls.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground pointer-events-none">
            {mode === "edit" ? "Click anywhere on the canvas to add a stall" : "No stalls configured"}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-stall-prime" /> Prime</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-stall-super" /> Super</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-stall-general" /> General</span>
        <span className="border-l border-border h-4 mx-1" />
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-muted border border-border" /> Booked</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-yellow-500" /> Reserved</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded ring-2 ring-primary bg-primary/20" /> Selected</span>
      </div>
    </div>
  );
}
