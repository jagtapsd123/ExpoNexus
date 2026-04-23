import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, ApiError } from "@/lib/apiClient";
import { StallCanvas } from "@/components/ui/stall-canvas";
import type { StallMarker } from "@/data/stallLayouts";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Info } from "lucide-react";

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
  venue: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "ongoing" | "completed";
}

interface LayoutResponse {
  mode: string;
  layoutImageUrl?: string;
  markers: Array<{
    number: string;
    category: string;
    price: number;
    status: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
}

interface StallItem {
  id: number;
  number: string;
  category: string;
  price: number;
  status: string;
  facilities: Array<{
    id: number;
    name: string;
    icon: string;
  }>;
}

interface CanvasStall extends StallMarker {
  realStallId?: number;
  facilities?: StallItem["facilities"];
}

const toCategory = (value: string): "Prime" | "Super" | "General" => {
  const normalized = value.toLowerCase();
  if (normalized === "prime") return "Prime";
  if (normalized === "super") return "Super";
  return "General";
};

const toStatus = (value: string): "available" | "booked" | "reserved" | "blocked" => {
  const normalized = value.toLowerCase();
  if (normalized === "booked") return "booked";
  if (normalized === "reserved") return "reserved";
  if (normalized === "blocked") return "blocked";
  return "available";
};

const StallBookingPage = () => {
  const { user } = useAuth();
  const [selectedExhibition, setSelectedExhibition] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [availableExhibitions, setAvailableExhibitions] = useState<ExhibitionItem[]>([]);
  const [layoutImage, setLayoutImage] = useState<string | undefined>();
  const [stalls, setStalls] = useState<CanvasStall[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadExhibitions = async () => {
      try {
        const response = await api.get<ApiResponse<PageResponse<ExhibitionItem>>>("/exhibitions?page=0&size=100&sort=startDate,desc");
        if (cancelled) return;
        const items = response.data?.content ?? [];
        setAvailableExhibitions(
          items.filter((item) => (user?.role === "exhibitor" ? item.status === "upcoming" || item.status === "ongoing" : true))
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load exhibitions");
        }
      }
    };

    void loadExhibitions();

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  useEffect(() => {
    if (!selectedExhibition) {
      setStalls([]);
      setLayoutImage(undefined);
      setSelectedIds(new Set());
      return;
    }

    let cancelled = false;

    const loadLayoutAndStalls = async () => {
      setError("");
      try {
        const [layoutResponse, stallResponse] = await Promise.all([
          api.get<ApiResponse<LayoutResponse>>(`/stall-layouts/${selectedExhibition}`),
          api.get<ApiResponse<StallItem[]>>(`/stalls?exhibitionId=${selectedExhibition}`),
        ]);

        if (cancelled) return;

        const stallMap = new Map((stallResponse.data ?? []).map((stall) => [stall.number, stall]));
        const mappedStalls: CanvasStall[] = (layoutResponse.data?.markers ?? []).map((marker, index) => {
          const realStall = stallMap.get(marker.number);
          return {
            id: String(realStall?.id ?? `${selectedExhibition}-${index}`),
            realStallId: realStall?.id,
            number: marker.number,
            category: toCategory(realStall?.category ?? marker.category),
            price: realStall?.price ?? marker.price,
            status: toStatus(realStall?.status ?? marker.status),
            facilities: realStall?.facilities ?? [],
            x: marker.x,
            y: marker.y,
            w: marker.w,
            h: marker.h,
          };
        });

        setLayoutImage(layoutResponse.data?.mode === "image" ? layoutResponse.data?.layoutImageUrl : undefined);
        setStalls(mappedStalls);
        setSelectedIds(new Set());
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load exhibition stalls");
          setStalls([]);
          setLayoutImage(undefined);
        }
      }
    };

    void loadLayoutAndStalls();

    return () => {
      cancelled = true;
    };
  }, [selectedExhibition]);

  const exhibition = availableExhibitions.find((item) => String(item.id) === selectedExhibition);
  const selectedStalls = useMemo(() => stalls.filter((stall) => selectedIds.has(stall.id)), [stalls, selectedIds]);
  const total = selectedStalls.reduce((sum, stall) => sum + stall.price, 0);

  const handleSelect = (stall: StallMarker) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(stall.id)) next.delete(stall.id);
      else next.add(stall.id);
      return next;
    });
  };

  const handleBook = async () => {
    if (!exhibition || selectedStalls.length === 0) return;

    try {
      await Promise.all(
        selectedStalls
          .filter((stall) => stall.realStallId)
          .map((stall) =>
            api.post("/bookings", {
              exhibitionId: exhibition.id,
              stallId: stall.realStallId,
              businessName: user?.businessName || user?.name || "Business",
              productCategory: "General",
              startDate: exhibition.startDate,
              endDate: exhibition.endDate,
              specialRequirements: "",
              paymentMethod: "upi",
            })
          )
      );

      toast.success(`Stall reserved! ${selectedStalls.length} stall(s) at ${exhibition.name} for Rs. ${total.toLocaleString()}`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to confirm booking");
    }
  };

  return (
    <div>
      <PageHeader title="Book a Stall" description="Select an exhibition and choose stalls visually" />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div className="bg-card rounded-lg border border-border p-6 max-w-lg">
          <Label>Select Exhibition</Label>
          <Select value={selectedExhibition} onValueChange={(value) => { setSelectedExhibition(value); setSelectedIds(new Set()); }}>
            <SelectTrigger><SelectValue placeholder="Choose exhibition" /></SelectTrigger>
            <SelectContent>
              {availableExhibitions.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {exhibition && (
            <div className="surface-peach rounded-lg p-4 mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">{exhibition.venue}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                  <Input value={exhibition.startDate} readOnly className="bg-muted cursor-not-allowed text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">End Date</Label>
                  <Input value={exhibition.endDate} readOnly className="bg-muted cursor-not-allowed text-sm mt-1" />
                </div>
              </div>
              {layoutImage && (
                <Button variant="outline" size="sm" onClick={() => setLayoutOpen(true)}>
                  <Eye size={14} className="mr-1" /> View Full Layout
                </Button>
              )}
            </div>
          )}
        </div>

        {exhibition && stalls.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Select Stalls</h3>
            <StallCanvas
              stalls={stalls}
              layoutImage={layoutImage}
              mode="select"
              selectedIds={selectedIds}
              onSelectStall={handleSelect}
            />

            {selectedStalls.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg p-3 surface-peach">
                  <span className="text-sm">
                    <span className="font-semibold">{selectedStalls.length}</span> stall(s) selected
                  </span>
                  <span className="text-sm font-bold text-primary">Rs. {total.toLocaleString()}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedStalls.map((stall) => (
                    <div key={stall.id} className="rounded-lg border border-border bg-background p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Stall {stall.number}</p>
                          <p className="text-xs capitalize text-muted-foreground">{stall.category} category</p>
                        </div>
                        <span className="text-sm font-medium text-primary">Rs. {stall.price.toLocaleString()}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assigned facilities</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(stall.facilities ?? []).length > 0 ? (
                            stall.facilities?.map((facility) => (
                              <span key={facility.id} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-1 text-xs text-foreground">
                                <span>{facility.icon}</span>
                                <span>{facility.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No facilities assigned to this stall yet.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => void handleBook()} disabled={selectedStalls.length === 0} className="w-full mt-4">
              Reserve Stall ({selectedStalls.length} stall{selectedStalls.length !== 1 ? "s" : ""})
            </Button>
          </div>
        )}

        {exhibition && stalls.length === 0 && (
          <div className="bg-card rounded-lg border border-border p-10 text-center">
            <Info size={32} className="text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">Layout not configured yet</h3>
            <p className="text-sm text-muted-foreground">
              The stall layout for this exhibition has not been set up. Please contact the admin.
            </p>
          </div>
        )}
      </div>

      <Dialog open={layoutOpen} onOpenChange={setLayoutOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Exhibition Layout</DialogTitle></DialogHeader>
          {layoutImage && <img src={layoutImage} alt="Layout" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StallBookingPage;
