import { useMemo, useState } from "react";
import { CategoryLegend } from "@/components/ui/stall-category";
import { cn } from "@/lib/utils";

export interface StallGridItem {
  id: string;
  number: string;
  category: "Prime" | "Super" | "General";
  price: number;
  status: "available" | "booked" | "reserved" | "blocked";
}

interface StallGridProps {
  stalls: StallGridItem[];
  onSelectionChange?: (selected: StallGridItem[]) => void;
  readOnly?: boolean;
}

export function StallGrid({ stalls, onSelectionChange, readOnly = false }: StallGridProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const totalPrice = useMemo(() => {
    return stalls.filter((stall) => selectedIds.has(stall.id)).reduce((sum, stall) => sum + stall.price, 0);
  }, [stalls, selectedIds]);

  const handleClick = (stall: StallGridItem) => {
    if (readOnly || stall.status !== "available") return;

    const next = new Set(selectedIds);
    if (next.has(stall.id)) next.delete(stall.id);
    else next.add(stall.id);

    setSelectedIds(next);
    onSelectionChange?.(stalls.filter((item) => next.has(item.id)));
  };

  const getCategoryColor = (category: StallGridItem["category"]) => {
    if (category === "Prime") {
      return { border: "border-stall-prime", text: "text-stall-prime", bg: "bg-stall-prime-bg" };
    }
    if (category === "Super") {
      return { border: "border-stall-super", text: "text-stall-super", bg: "bg-stall-super-bg" };
    }
    return { border: "border-stall-general", text: "text-stall-general", bg: "bg-stall-general-bg" };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <CategoryLegend />
        <div className="flex items-center gap-4 border-l border-border pl-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded border-2 border-border bg-card" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-muted" /> Booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-primary/20 ring-2 ring-primary" /> Selected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
        {stalls.map((stall) => {
          const colors = getCategoryColor(stall.category);
          const isSelected = selectedIds.has(stall.id);
          const isUnavailable = stall.status !== "available";

          return (
            <button
              key={stall.id}
              onClick={() => handleClick(stall)}
              disabled={isUnavailable && !readOnly}
              title={`${stall.number} | ${stall.category} | Rs. ${stall.price.toLocaleString()} | ${isUnavailable ? stall.status : "available"}`}
              className={cn(
                "relative rounded-md border p-2 text-center transition-all",
                isUnavailable
                  ? "cursor-not-allowed border-border bg-muted opacity-50"
                  : isSelected
                    ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary"
                    : cn(colors.bg, colors.border, "cursor-pointer border-l-[3px] hover:shadow-sm"),
                readOnly && "cursor-default"
              )}
            >
              <p className={cn("text-[10px] font-bold", isUnavailable ? "text-muted-foreground" : isSelected ? "text-primary" : colors.text)}>
                {stall.number}
              </p>
              <p className="text-[9px] text-muted-foreground">{stall.category[0]}</p>
            </button>
          );
        })}
      </div>

      {!readOnly && selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-border p-3 surface-peach">
          <span className="text-sm text-foreground">
            <span className="font-semibold">{selectedIds.size}</span> stall{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <span className="text-sm font-bold text-primary">Rs. {totalPrice.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
