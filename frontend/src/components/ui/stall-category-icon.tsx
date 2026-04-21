import { Utensils, Shirt, Palette, Laptop, Package, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductCategory = "Food" | "Clothing" | "Handicrafts" | "Electronics" | "General";

const categoryIconMap: Record<ProductCategory, LucideIcon> = {
  Food: Utensils,
  Clothing: Shirt,
  Handicrafts: Palette,
  Electronics: Laptop,
  General: Package,
};

const allCategories: ProductCategory[] = ["Food", "Clothing", "Handicrafts", "Electronics", "General"];

/** Deterministically assign a product category based on stall id/number */
export function getProductCategory(stallId: string): ProductCategory {
  let hash = 0;
  for (let i = 0; i < stallId.length; i++) {
    hash = ((hash << 5) - hash + stallId.charCodeAt(i)) | 0;
  }
  return allCategories[Math.abs(hash) % allCategories.length];
}

export function StallCategoryIcon({
  stallId,
  className,
}: {
  stallId: string;
  className?: string;
}) {
  const cat = getProductCategory(stallId);
  const Icon = categoryIconMap[cat];
  return (
    <div
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded-full bg-muted",
        className
      )}
      title={cat}
    >
      <Icon size={14} className="text-muted-foreground" />
    </div>
  );
}
