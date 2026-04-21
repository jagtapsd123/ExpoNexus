import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { StallCanvas } from "@/components/ui/stall-canvas";
import {
  ExhibitionLayout,
  StallMarker,
  StallStatus,
  StallCategory,
  generateGridLayout,
  summarizeLayout,
} from "@/data/stallLayouts";
import { toast } from "sonner";
import { Upload, Trash2, Plus, Sparkles, Save, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { api, ApiError } from "@/lib/apiClient";
import { config } from "@/config/env";

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

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
  name: string;
  venue: string;
  stallCategories: Array<{
    category: string;
    price: number;
    total: number;
  }>;
}

interface StallLayoutApi {
  exhibitionId: number;
  mode: string;
  layoutImageUrl?: string;
  primeCount: number;
  superCount: number;
  generalCount: number;
  primePrice: number;
  superPrice: number;
  generalPrice: number;
  markers: Array<{
    id: number;
    number: string;
    category: string;
    price: number;
    status: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
  updatedAt: string;
}

const toCategory = (value: string): StallCategory => {
  const normalized = value.toLowerCase();
  if (normalized === "prime") return "Prime";
  if (normalized === "super") return "Super";
  return "General";
};

const toStatus = (value: string): StallStatus => {
  const normalized = value.toLowerCase();
  if (normalized === "booked") return "booked";
  if (normalized === "reserved") return "reserved";
  if (normalized === "blocked") return "blocked";
  return "available";
};

const buildDefaultLayout = (exhibitionId: string, exhibition?: ExhibitionApi): ExhibitionLayout => {
  const prime = exhibition?.stallCategories.find((item) => item.category.toLowerCase() === "prime");
  const superCategory = exhibition?.stallCategories.find((item) => item.category.toLowerCase() === "super");
  const general = exhibition?.stallCategories.find((item) => item.category.toLowerCase() === "general");

  return {
    exhibitionId,
    mode: "grid",
    counts: {
      Prime: prime?.total ?? 5,
      Super: superCategory?.total ?? 10,
      General: general?.total ?? 15,
    },
    prices: {
      Prime: prime?.price ?? 15000,
      Super: superCategory?.price ?? 10000,
      General: general?.price ?? 5000,
    },
    stalls: [],
    updatedAt: new Date().toISOString(),
  };
};

const mapLayoutFromApi = (data: StallLayoutApi): ExhibitionLayout => ({
  exhibitionId: String(data.exhibitionId),
  mode: data.mode === "image" ? "image" : "grid",
  layoutImage: data.layoutImageUrl,
  counts: {
    Prime: data.primeCount,
    Super: data.superCount,
    General: data.generalCount,
  },
  prices: {
    Prime: data.primePrice,
    Super: data.superPrice,
    General: data.generalPrice,
  },
  stalls: (data.markers ?? []).map((marker) => ({
    id: String(marker.id),
    number: marker.number,
    category: toCategory(marker.category),
    price: marker.price,
    status: toStatus(marker.status),
    x: marker.x,
    y: marker.y,
    w: marker.w,
    h: marker.h,
  })),
  updatedAt: data.updatedAt,
});

const StallLayoutManagementPage = () => {
  const { user } = useAuth();
  const [exhibitions, setExhibitions] = useState<ExhibitionApi[]>([]);
  const [selectedExId, setSelectedExId] = useState("");
  const [draft, setDraft] = useState<ExhibitionLayout | null>(null);
  const [activeStallId, setActiveStallId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadExhibitions = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get<ApiResponse<PageResponse<ExhibitionApi>>>("/exhibitions?page=0&size=100&sort=startDate,desc");
        if (cancelled) return;
        const items = response.data?.content ?? [];
        setExhibitions(items);
        setSelectedExId((current) => current || (items[0] ? String(items[0].id) : ""));
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
    if (!selectedExId) return;

    let cancelled = false;

    const exhibition = exhibitions.find((item) => String(item.id) === selectedExId);

    const loadLayout = async () => {
      setError("");
      try {
        const response = await api.get<ApiResponse<StallLayoutApi>>(`/stall-layouts/${selectedExId}`);
        if (!cancelled && response.data) {
          setDraft(mapLayoutFromApi(response.data));
          setActiveStallId(undefined);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setDraft(buildDefaultLayout(selectedExId, exhibition));
          setActiveStallId(undefined);
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load stall layout");
      }
    };

    void loadLayout();

    return () => {
      cancelled = true;
    };
  }, [selectedExId, exhibitions]);

  const exhibition = exhibitions.find((item) => String(item.id) === selectedExId);
  const summary = useMemo(() => summarizeLayout(draft ?? undefined), [draft]);
  const activeStall = draft?.stalls.find((stall) => stall.id === activeStallId);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (isLoading && !draft) return null;
  if (!draft) return null;

  const updateDraft = (patch: Partial<ExhibitionLayout>) => setDraft({ ...draft, ...patch });
  const updateStall = (id: string, patch: Partial<StallMarker>) =>
    setDraft({ ...draft, stalls: draft.stalls.map((stall) => (stall.id === id ? { ...stall, ...patch } : stall)) });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedExId) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("amrut_auth_token");
      const response = await fetch(`${config.apiBaseUrl}/exhibitions/${selectedExId}/layout-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new ApiError(payload?.message || "Failed to upload layout image", response.status, payload);
      }

      updateDraft({ layoutImage: payload?.data || "" });
      toast.success("Layout image uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload layout image");
    } finally {
      e.target.value = "";
    }
  };

  const handleGenerateGrid = () => {
    const stalls = generateGridLayout(selectedExId, draft.counts, draft.prices);
    updateDraft({ stalls });
    toast.success(`Generated ${stalls.length} stalls`);
  };

  const handleAddStallAt = (x: number, y: number) => {
    const num = draft.stalls.length + 1;
    const newStall: StallMarker = {
      id: `${selectedExId}-stall-${Date.now()}`,
      number: `S${String(num).padStart(3, "0")}`,
      category: "General",
      price: draft.prices.General,
      status: "available",
      x,
      y,
      w: 8,
      h: 8,
    };
    updateDraft({ stalls: [...draft.stalls, newStall] });
    setActiveStallId(newStall.id);
  };

  const handleDeleteStall = (id: string) => {
    updateDraft({ stalls: draft.stalls.filter((stall) => stall.id !== id) });
    setActiveStallId(undefined);
  };

  const handleSave = async () => {
    if (!selectedExId) return;

    setIsSaving(true);
    try {
      await api.put<ApiResponse<StallLayoutApi>>(`/stall-layouts/${selectedExId}`, {
        mode: draft.mode.toUpperCase(),
        layoutImageUrl: draft.layoutImage,
        primeCount: draft.counts.Prime,
        superCount: draft.counts.Super,
        generalCount: draft.counts.General,
        primePrice: draft.prices.Prime,
        superPrice: draft.prices.Super,
        generalPrice: draft.prices.General,
        markers: draft.stalls.map((stall) => ({
          number: stall.number,
          category: stall.category.toUpperCase(),
          price: stall.price,
          status: stall.status.toUpperCase(),
          x: stall.x,
          y: stall.y,
          w: stall.w,
          h: stall.h,
        })),
      });

      setDraft({ ...draft, updatedAt: new Date().toISOString() });
      toast.success("Layout saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save layout");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Stall Layout Management"
        description="Configure dynamic hall layouts and stall arrangements per exhibition"
        actions={
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            <Save size={16} className="mr-1" /> {isSaving ? "Saving..." : "Save Layout"}
          </Button>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <motion.div {...fadeIn} className="space-y-6">
        <Card>
          <CardContent className="p-4 grid gap-4 md:grid-cols-3">
            <div>
              <Label>Exhibition</Label>
              <Select value={selectedExId} onValueChange={setSelectedExId}>
                <SelectTrigger><SelectValue placeholder="Choose exhibition" /></SelectTrigger>
                <SelectContent>
                  {exhibitions.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {exhibition && <p className="text-xs text-muted-foreground mt-1">{exhibition.venue}</p>}
            </div>

            <div>
              <Label>Layout Mode</Label>
              <Tabs value={draft.mode} onValueChange={(value) => updateDraft({ mode: value as "image" | "grid" })}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="grid">Auto Grid</TabsTrigger>
                  <TabsTrigger value="image">On Image</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-muted-foreground mt-1">
                {draft.mode === "image" ? "Click on the floor plan to place stalls" : "Auto-arrange stalls in a grid"}
              </p>
            </div>

            <div>
              <Label>Hall Layout Image</Label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer flex-1">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <span><Upload size={14} className="mr-1" /> {draft.layoutImage ? "Replace" : "Upload"}</span>
                  </Button>
                </label>
                {draft.layoutImage && (
                  <Button variant="outline" size="sm" onClick={() => updateDraft({ layoutImage: undefined })}>
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard title="Total" value={summary.total} />
          <StatCard title="Available" value={summary.available} />
          <StatCard title="Booked" value={summary.booked} variant="peach" />
          <StatCard title="Reserved" value={summary.reserved} />
          <StatCard title="Blocked" value={summary.blocked} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon size={16} /> Hall Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StallCanvas
                stalls={draft.stalls}
                layoutImage={draft.mode === "image" ? draft.layoutImage : undefined}
                mode="edit"
                activeStallId={activeStallId}
                onSelectStall={(stall) => setActiveStallId(stall.id)}
                onMoveStall={(id, x, y) => updateStall(id, { x, y })}
                onCanvasClick={handleAddStallAt}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Category Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(["Prime", "Super", "General"] as StallCategory[]).map((category) => (
                  <div key={category} className="grid grid-cols-3 gap-2 items-end">
                    <div className="col-span-1">
                      <Label className="text-xs flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${category === "Prime" ? "bg-stall-prime" : category === "Super" ? "bg-stall-super" : "bg-stall-general"}`} />
                        {category}
                      </Label>
                    </div>
                    <div>
                      <Input
                        type="number"
                        min={0}
                        value={draft.counts[category]}
                        onChange={(e) => updateDraft({ counts: { ...draft.counts, [category]: Math.max(0, +e.target.value || 0) } })}
                        placeholder="Count"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        min={0}
                        value={draft.prices[category]}
                        onChange={(e) => updateDraft({ prices: { ...draft.prices, [category]: Math.max(0, +e.target.value || 0) } })}
                        placeholder="Rs."
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={handleGenerateGrid}>
                  <Sparkles size={14} className="mr-1" /> Auto-Generate Grid
                </Button>
                <p className="text-xs text-muted-foreground">
                  Replaces current stalls with an arranged grid using the counts and prices above.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {activeStall ? `Stall ${activeStall.number}` : "Stall Editor"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeStall ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Number</Label>
                        <Input value={activeStall.number} onChange={(e) => updateStall(activeStall.id, { number: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Category</Label>
                        <Select
                          value={activeStall.category}
                          onValueChange={(value: StallCategory) => updateStall(activeStall.id, { category: value, price: draft.prices[value] })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Prime">Prime</SelectItem>
                            <SelectItem value="Super">Super</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Price (Rs.)</Label>
                        <Input type="number" value={activeStall.price} onChange={(e) => updateStall(activeStall.id, { price: +e.target.value || 0 })} />
                      </div>
                      <div>
                        <Label className="text-xs">Status</Label>
                        <Select
                          value={activeStall.status}
                          onValueChange={(value: StallStatus) => updateStall(activeStall.id, { status: value })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                            <SelectItem value="booked">Booked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Width %</Label>
                        <Input type="number" min={2} max={50} value={activeStall.w} onChange={(e) => updateStall(activeStall.id, { w: Math.max(2, Math.min(50, +e.target.value || 0)) })} />
                      </div>
                      <div>
                        <Label className="text-xs">Height %</Label>
                        <Input type="number" min={2} max={50} value={activeStall.h} onChange={(e) => updateStall(activeStall.id, { h: Math.max(2, Math.min(50, +e.target.value || 0)) })} />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive" onClick={() => handleDeleteStall(activeStall.id)}>
                      <Trash2 size={14} className="mr-1" /> Delete Stall
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Click a stall on the map to edit, or click an empty area to add a new one.
                  </p>
                )}
                <div className="border-t border-border pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const x = 45 + Math.random() * 10;
                      const y = 45 + Math.random() * 10;
                      handleAddStallAt(x, y);
                    }}
                  >
                    <Plus size={14} className="mr-1" /> Add Stall
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StallLayoutManagementPage;
