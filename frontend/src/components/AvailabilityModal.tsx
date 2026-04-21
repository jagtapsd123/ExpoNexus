import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { api, ApiError } from "@/lib/apiClient";

const categoryColors: Record<string, string> = {
  Prime: "bg-[#C2410C]",
  Super: "bg-[#F97316]",
  General: "bg-[#22C55E]",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PageResponse<T> {
  content: T[];
}

interface ExhibitionItem {
  id: number;
  name: string;
  status: "upcoming" | "ongoing" | "completed";
  stallCategories: Array<{
    category: string;
    price: number;
    total: number;
    booked: number;
  }>;
}

const toCategoryLabel = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized === "prime") return "Prime";
  if (normalized === "super") return "Super";
  return "General";
};

export const AvailabilityModal = ({ open, onOpenChange }: Props) => {
  const { t } = useLanguage();
  const [activeExhibitions, setActiveExhibitions] = useState<ExhibitionItem[]>([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadExhibitions = async () => {
      setError("");
      try {
        const response = await api.get<ApiResponse<PageResponse<ExhibitionItem>>>("/exhibitions?page=0&size=100&sort=startDate,desc");
        if (cancelled) return;
        const items = (response.data?.content ?? []).filter(
          (item) => item.status === "upcoming" || item.status === "ongoing"
        );
        setActiveExhibitions(items);
        setSelected(items[0] ? String(items[0].id) : "");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load exhibitions");
          setActiveExhibitions([]);
          setSelected("");
        }
      }
    };

    void loadExhibitions();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const exhibition = activeExhibitions.find((item) => String(item.id) === selected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("availability.title")}</DialogTitle>
        </DialogHeader>

        {error ? (
          <p className="text-sm text-destructive py-4">{error}</p>
        ) : activeExhibitions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{t("availability.noActive")}</p>
        ) : (
          <div className="space-y-4">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder={t("availability.selectExhibition")} />
              </SelectTrigger>
              <SelectContent>
                {activeExhibitions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {exhibition && (
              <div className="space-y-3">
                {exhibition.stallCategories.map((stall) => {
                  const category = toCategoryLabel(stall.category);
                  return (
                    <div key={stall.category} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                      <div className={`w-3 h-3 rounded-full ${categoryColors[category]}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{category}</p>
                        <p className="text-xs text-muted-foreground">Rs. {stall.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-foreground">{t("availability.available")}: <span className="font-semibold">{stall.total - stall.booked}</span></p>
                        <p className="text-muted-foreground">{t("availability.total")}: {stall.total} · {t("availability.booked")}: {stall.booked}</p>
                      </div>
                    </div>
                  );
                })}

                <Button className="w-full" asChild>
                  <Link to="/login">{t("availability.proceed")}</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
