import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/apiClient";
import { config } from "@/config/env";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, Clock, Eye, EyeOff } from "lucide-react";
import { CategoryLegend } from "@/components/ui/stall-category";
import { LayoutUpload } from "@/components/ui/layout-upload";
import { StallGrid } from "@/components/ui/stall-grid";
import { toast } from "sonner";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PageResponse<T> {
  content: T[];
}

interface ExhibitionApi {
  id: number;
  eventId?: string;
  name: string;
  startDate: string;
  endDate: string;
  time?: string;
  venue: string;
  totalStalls: number;
  status: "upcoming" | "ongoing" | "completed";
  layoutImageUrl?: string;
  showRevenueToExhibitors: boolean;
  stallCategories: Array<{
    category: string;
    price: number;
    total: number;
    booked: number;
    available: number;
  }>;
}

interface StallApi {
  id: number;
  number: string;
  category: string;
  price: number;
  status: string;
}

interface StallGridItem {
  id: string;
  number: string;
  category: "Prime" | "Super" | "General";
  price: number;
  status: "available" | "booked" | "reserved";
}

const emptyForm = {
  name: "",
  startDate: "",
  endDate: "",
  time: "",
  venue: "",
  primeCount: "5",
  primePrice: "15000",
  superCount: "10",
  superPrice: "10000",
  generalCount: "15",
  generalPrice: "5000",
};

const toCategoryLabel = (category: string): "Prime" | "Super" | "General" => {
  const normalized = category.toLowerCase();
  if (normalized === "prime") return "Prime";
  if (normalized === "super") return "Super";
  return "General";
};

const toStallStatus = (status: string): "available" | "booked" | "reserved" => {
  const normalized = status.toLowerCase();
  if (normalized === "booked") return "booked";
  if (normalized === "reserved") return "reserved";
  return "available";
};

const formatCurrency = (value: number) => `Rs. ${value.toLocaleString()}`;

const ExhibitionsPage = () => {
  const { user } = useAuth();
  const [exList, setExList] = useState<ExhibitionApi[]>([]);
  const [open, setOpen] = useState(false);
  const [stallViewId, setStallViewId] = useState<number | null>(null);
  const [stallItems, setStallItems] = useState<StallGridItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const isAdmin = user?.role === "admin";
  const canManageLayout = isAdmin || user?.role === "organizer";

  useEffect(() => {
    let cancelled = false;

    const loadExhibitions = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get<ApiResponse<PageResponse<ExhibitionApi>>>("/exhibitions?page=0&size=100&sort=startDate,desc");
        if (!cancelled) {
          setExList(response.data?.content ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load exhibitions");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadExhibitions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!stallViewId) {
      setStallItems([]);
      return;
    }

    let cancelled = false;

    const loadStalls = async () => {
      try {
        const response = await api.get<ApiResponse<StallApi[]>>(`/stalls?exhibitionId=${stallViewId}`);
        if (cancelled) return;
        setStallItems(
          (response.data ?? []).map((stall) => ({
            id: String(stall.id),
            number: stall.number,
            category: toCategoryLabel(stall.category),
            price: stall.price,
            status: toStallStatus(stall.status),
          }))
        );
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof ApiError ? err.message : "Failed to load stalls");
        }
      }
    };

    void loadStalls();

    return () => {
      cancelled = true;
    };
  }, [stallViewId]);

  const visibleExhibitions = useMemo(
    () => exList.filter((ex) => ex.status !== "completed"),
    [exList]
  );

  const handleAdd = async () => {
    setIsSaving(true);
    try {
      const response = await api.post<ApiResponse<ExhibitionApi>>("/exhibitions", {
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        time: form.time,
        venue: form.venue,
        stallConfig: {
          primeCount: Number(form.primeCount),
          primePrice: Number(form.primePrice),
          superCount: Number(form.superCount),
          superPrice: Number(form.superPrice),
          generalCount: Number(form.generalCount),
          generalPrice: Number(form.generalPrice),
        },
      });

      if (response.data) {
        setExList((prev) => [response.data!, ...prev]);
      }

      setOpen(false);
      setForm(emptyForm);
      toast.success(response.message || "Exhibition created");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create exhibition");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevenueToggle = async (exhibitionId: number, checked: boolean) => {
    try {
      const response = await api.patch<ApiResponse<ExhibitionApi>>(`/exhibitions/${exhibitionId}/revenue-visibility?visible=${checked}`);
      if (response.data) {
        setExList((prev) => prev.map((ex) => (ex.id === exhibitionId ? response.data! : ex)));
      }
      toast.success(checked ? "Revenue visible to exhibitors" : "Revenue hidden from exhibitors");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update revenue visibility");
    }
  };

  const handleLayoutUpload = async (exhibitionId: number, file: File, previewUrl: string) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("amrut_auth_token");
      const response = await fetch(`${config.apiBaseUrl}/exhibitions/${exhibitionId}/layout-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new ApiError(payload?.message || "Failed to upload layout image", response.status, payload);
      }

      const imageUrl = payload?.data || previewUrl;
      setExList((prev) => prev.map((ex) => (ex.id === exhibitionId ? { ...ex, layoutImageUrl: imageUrl } : ex)));
      toast.success("Layout image uploaded successfully");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload layout image");
    }
  };

  return (
    <div>
      <PageHeader
        title="Exhibitions"
        description="Manage all exhibitions and stall configurations"
        actions={
          canManageLayout ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={16} className="mr-1" /> Add Exhibition</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Exhibition</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div><Label>Exhibition Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                    <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
                  </div>
                  <div><Label>Time</Label><Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="10:00 AM - 8:00 PM" /></div>
                  <div><Label>Venue</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-semibold text-foreground mb-3">Stall Configuration</p>
                    {(["prime", "super", "general"] as const).map((cat) => (
                      <div key={cat} className="grid grid-cols-2 gap-3 mb-3">
                        <div><Label>{cat.charAt(0).toUpperCase() + cat.slice(1)} Count</Label><Input type="number" value={form[`${cat}Count` as keyof typeof form]} onChange={(e) => setForm({ ...form, [`${cat}Count`]: e.target.value })} /></div>
                        <div><Label>{cat.charAt(0).toUpperCase() + cat.slice(1)} Price (Rs.)</Label><Input type="number" value={form[`${cat}Price` as keyof typeof form]} onChange={(e) => setForm({ ...form, [`${cat}Price`]: e.target.value })} /></div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => void handleAdd()} className="w-full" disabled={isSaving}>
                    {isSaving ? "Creating..." : "Create Exhibition"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <CategoryLegend className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isLoading && visibleExhibitions.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            No exhibitions found.
          </div>
        )}

        {visibleExhibitions.map((ex) => (
          <div key={ex.id} className="bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground leading-tight">{ex.name}</h3>
                {ex.eventId && (
                  <span className="text-xs font-mono text-muted-foreground">{ex.eventId}</span>
                )}
              </div>
              <span className={`ml-2 shrink-0 px-2 py-1 rounded text-xs font-medium ${
                ex.status === "upcoming" ? "surface-peach text-foreground" :
                ex.status === "ongoing" ? "bg-stall-general-bg text-stall-general" : "bg-muted text-muted-foreground"
              }`}>{ex.status}</span>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground mb-4">
              <p className="flex items-center gap-1"><Clock size={14} /> {ex.startDate} to {ex.endDate}{ex.time ? ` · ${ex.time}` : ""}</p>
              <p className="flex items-center gap-1"><MapPin size={14} /> {ex.venue}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {ex.stallCategories.map((st) => {
                const category = toCategoryLabel(st.category);
                return (
                  <div
                    key={st.category}
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
                    <p className="text-sm font-semibold text-foreground">{st.booked}/{st.total}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(st.price)}</p>
                  </div>
                );
              })}
            </div>

            {isAdmin && (
              <div className="border-t border-border pt-3 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {ex.showRevenueToExhibitors ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>Show revenue to exhibitors</span>
                </div>
                <Switch
                  checked={ex.showRevenueToExhibitors}
                  onCheckedChange={(checked) => void handleRevenueToggle(ex.id, checked)}
                />
              </div>
            )}

            <div className="border-t border-border pt-3 mb-3">
              <LayoutUpload
                layoutImage={ex.layoutImageUrl}
                canUpload={canManageLayout}
                canDelete={false}
                onUpload={(file, previewUrl) => void handleLayoutUpload(ex.id, file, previewUrl)}
                onDelete={() => undefined}
              />
            </div>

            <Button variant="outline" size="sm" onClick={() => setStallViewId(ex.id)}>
              View Stalls ({ex.totalStalls})
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!stallViewId} onOpenChange={() => setStallViewId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Stall Map</DialogTitle></DialogHeader>
          {stallItems.length > 0 ? (
            <StallGrid stalls={stallItems} readOnly />
          ) : (
            <p className="text-sm text-muted-foreground">No stalls found for this exhibition.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExhibitionsPage;
