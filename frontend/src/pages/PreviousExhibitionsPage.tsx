import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryBadge, CategoryLegend } from "@/components/ui/stall-category";
import { MapPin, Clock, TrendingUp, Eye, Image, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/apiClient";

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
  startDate: string;
  endDate: string;
  venue: string;
  status: "upcoming" | "ongoing" | "completed";
  layoutImageUrl?: string;
  showRevenueToExhibitors: boolean;
  assignedOrganizerIds?: number[];
  stallCategories: Array<{
    category: string;
    price: number;
    total: number;
    booked: number;
  }>;
}

const toCategory = (value: string): "Prime" | "Super" | "General" => {
  const normalized = value.toLowerCase();
  if (normalized === "prime") return "Prime";
  if (normalized === "super") return "Super";
  return "General";
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const PreviousExhibitionsPage = () => {
  const { user } = useAuth();
  const [pastExhibitions, setPastExhibitions] = useState<ExhibitionItem[]>([]);
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadExhibitions = async () => {
      setError("");
      try {
        const response = await api.get<ApiResponse<PageResponse<ExhibitionItem>>>("/exhibitions?status=COMPLETED&page=0&size=100&sort=endDate,desc");
        if (!cancelled) {
          const items = response.data?.content ?? [];
          const filteredItems = user?.role === "organizer"
            ? items.filter((item) => item.assignedOrganizerIds?.includes(Number(user.id)))
            : items;
          setPastExhibitions(filteredItems);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load previous exhibitions");
        }
      }
    };

    void loadExhibitions();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  const selected = pastExhibitions.find((item) => item.id === selectedExhibitionId);

  const getRevenue = (exhibition: ExhibitionItem) =>
    exhibition.stallCategories.reduce((sum, item) => sum + item.price * item.booked, 0);

  const getOccupancy = (exhibition: ExhibitionItem) => {
    const booked = exhibition.stallCategories.reduce((sum, item) => sum + item.booked, 0);
    const total = exhibition.stallCategories.reduce((sum, item) => sum + item.total, 0);
    return total > 0 ? Math.round((booked / total) * 100) : 0;
  };

  return (
    <div>
      <PageHeader title="Previous Exhibitions" description="View past exhibition history and performance" />
      <CategoryLegend className="mb-4" />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {pastExhibitions.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">No past exhibitions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastExhibitions.map((exhibition) => {
            const revenue = getRevenue(exhibition);
            const occupancy = getOccupancy(exhibition);
            const totalBooked = exhibition.stallCategories.reduce((sum, item) => sum + item.booked, 0);
            const totalStalls = exhibition.stallCategories.reduce((sum, item) => sum + item.total, 0);

            return (
              <div key={exhibition.id} className="bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-foreground">{exhibition.name}</h3>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">Completed</span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground mb-4">
                  <p className="flex items-center gap-1"><Clock size={14} /> {formatDate(exhibition.startDate)} to {formatDate(exhibition.endDate)}</p>
                  <p className="flex items-center gap-1"><MapPin size={14} /> {exhibition.venue}</p>
                </div>

                <div className="grid gap-3 mb-4 grid-cols-3">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Stalls</p>
                    <p className="text-lg font-bold text-foreground">{totalBooked}/{totalStalls}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Occupancy</p>
                    <p className="text-lg font-bold text-primary">{occupancy}%</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold text-foreground">
                      {exhibition.showRevenueToExhibitors ? `Rs. ${(revenue / 1000).toFixed(0)}K` : "Hidden"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {exhibition.stallCategories.map((stall) => {
                    const category = toCategory(stall.category);
                    return (
                      <div
                        key={stall.category}
                        className={`rounded-lg border-l-[3px] p-2 text-center ${
                          category === "Prime" ? "border-stall-prime bg-stall-prime-bg" :
                          category === "Super" ? "border-stall-super bg-stall-super-bg" :
                          "border-stall-general bg-stall-general-bg"
                        }`}
                      >
                        <p className={`text-xs font-medium ${
                          category === "Prime" ? "text-stall-prime" :
                          category === "Super" ? "text-stall-super" : "text-stall-general"
                        }`}>{category}</p>
                        <p className="text-sm font-semibold text-foreground">{stall.booked}/{stall.total}</p>
                        <p className="text-xs text-muted-foreground">
                          {exhibition.showRevenueToExhibitors ? `Rs. ${(stall.price * stall.booked).toLocaleString()}` : `Rs. ${stall.price.toLocaleString()}/stall`}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {exhibition.layoutImageUrl ? (
                      <span className="flex items-center gap-1"><Image size={12} /> Layout available</span>
                    ) : (
                      <span className="flex items-center gap-1"><EyeOff size={12} /> No media</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedExhibitionId(exhibition.id); setDetailsOpen(true); }}>
                    <Eye size={14} className="mr-1" /> View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6 mt-4">
              {selected.showRevenueToExhibitors ? (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><TrendingUp size={16} /> Revenue Breakdown</h4>
                  <div className="space-y-2">
                    {selected.stallCategories.map((stall) => (
                      <div key={stall.category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <CategoryBadge category={toCategory(stall.category)} />
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">Rs. {(stall.price * stall.booked).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{stall.booked} stalls x Rs. {stall.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 surface-peach rounded-lg border border-border">
                      <span className="text-sm font-semibold text-foreground">Total Revenue</span>
                      <span className="text-lg font-bold text-primary">Rs. {getRevenue(selected).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <EyeOff size={16} /> Revenue not disclosed for this exhibition
                  </p>
                </div>
              )}

              {selected.layoutImageUrl && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Layout Image</h4>
                  <img src={selected.layoutImageUrl} alt="Exhibition layout" className="w-full rounded-lg border border-border" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreviousExhibitionsPage;
