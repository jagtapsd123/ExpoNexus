import { cn } from "@/lib/utils";

type StallCategoryType = "Prime" | "Super" | "General";

const categoryStyles: Record<StallCategoryType, { bg: string; text: string; border: string }> = {
  Prime: { bg: "bg-stall-prime-bg", text: "text-stall-prime", border: "border-stall-prime/30" },
  Super: { bg: "bg-stall-super-bg", text: "text-stall-super", border: "border-stall-super/30" },
  General: { bg: "bg-stall-general-bg", text: "text-stall-general", border: "border-stall-general/30" },
};

export function CategoryBadge({ category, className }: { category: StallCategoryType; className?: string }) {
  const s = categoryStyles[category];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", s.bg, s.text, s.border, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", category === "Prime" ? "bg-stall-prime" : category === "Super" ? "bg-stall-super" : "bg-stall-general")} />
      {category}
    </span>
  );
}

export function CategoryLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 text-xs text-muted-foreground", className)}>
      {(["Prime", "Super", "General"] as const).map((cat) => (
        <span key={cat} className="flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 rounded-full", cat === "Prime" ? "bg-stall-prime" : cat === "Super" ? "bg-stall-super" : "bg-stall-general")} />
          {cat}
        </span>
      ))}
    </div>
  );
}

export function CategoryCard({ category, children, className }: { category: StallCategoryType; children: React.ReactNode; className?: string }) {
  const s = categoryStyles[category];
  return (
    <div className={cn("rounded-lg border-l-[3px] bg-card p-3", s.border.replace("/30", ""), className)}>
      {children}
    </div>
  );
}

export { categoryStyles };
export type { StallCategoryType };
