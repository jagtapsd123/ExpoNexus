import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Check, Pencil, Trash2, Settings2, Grid3X3, ClipboardList } from "lucide-react";
import { api, ApiError } from "@/lib/apiClient";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PageResponse<T> {
  content: T[];
}

interface FacilityType {
  id: number;
  name: string;
  icon: string;
  description?: string;
  active: boolean;
}

interface StallCategoryType {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  facilities: FacilityType[];
}

interface StallItem {
  id: number;
  number: string;
  category: string;
  status: string;
  facilities: FacilityType[];
}

interface ExhibitionItem {
  id: number;
  name: string;
  status: string;
}

interface FacilityRequestItem {
  id: number;
  exhibitorName: string;
  exhibitionName: string;
  chairs: number;
  tables: number;
  lights: number;
  electricityRequired: boolean;
  customRequirements?: string;
  status: string;
}

const emptyTypeForm = { name: "", icon: "\u26A1", description: "", active: true };

const FacilitiesPage = () => {
  const { user } = useAuth();
  const isExhibitor = user?.role === "exhibitor";
  const isAdmin = user?.role === "admin";
  const isOrganizerOrAdmin = user?.role === "organizer" || isAdmin;

  const [types, setTypes] = useState<FacilityType[]>([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [typeForm, setTypeForm] = useState(emptyTypeForm);
  const [editingType, setEditingType] = useState<FacilityType | null>(null);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [isSavingType, setIsSavingType] = useState(false);

  const [stallCategories, setStallCategories] = useState<StallCategoryType[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", active: true });
  const [editingCategory, setEditingCategory] = useState<StallCategoryType | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [assigningCategory, setAssigningCategory] = useState<StallCategoryType | null>(null);
  const [categoryFacilityIds, setCategoryFacilityIds] = useState<Set<number>>(new Set());
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingCategoryFacilities, setIsSavingCategoryFacilities] = useState(false);

  const [exhibitions, setExhibitions] = useState<ExhibitionItem[]>([]);
  const [selectedExId, setSelectedExId] = useState("");
  const [stalls, setStalls] = useState<StallItem[]>([]);
  const [stallsLoading, setStallsLoading] = useState(false);
  const [assigningStall, setAssigningStall] = useState<StallItem | null>(null);
  const [assignSelected, setAssignSelected] = useState<Set<number>>(new Set());
  const [isSavingAssign, setIsSavingAssign] = useState(false);

  const [requests, setRequests] = useState<FacilityRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [requestForm, setRequestForm] = useState({
    exhibitionId: "",
    chairs: "2",
    tables: "1",
    lights: "2",
    electricity: true,
    custom: "",
  });
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    if (!isOrganizerOrAdmin) return;
    setTypesLoading(true);
    api.get<ApiResponse<FacilityType[]>>("/facility-types")
      .then((r) => setTypes(r.data ?? []))
      .catch(() => toast.error("Failed to load facility types"))
      .finally(() => setTypesLoading(false));
  }, [isOrganizerOrAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    setCategoriesLoading(true);
    api.get<ApiResponse<StallCategoryType[]>>("/stall-category-types")
      .then((r) => setStallCategories(r.data ?? []))
      .catch(() => toast.error("Failed to load stall categories"))
      .finally(() => setCategoriesLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    if (!user) return;
    api.get<ApiResponse<PageResponse<ExhibitionItem>>>("/exhibitions?page=0&size=100&sort=startDate,desc")
      .then((r) => setExhibitions((r.data?.content ?? []).filter((ex) => (
        isExhibitor ? ex.status === "upcoming" || ex.status === "ongoing" : ex.status !== "completed"
      ))))
      .catch(() => {});
  }, [isExhibitor, user]);

  useEffect(() => {
    if (!selectedExId) {
      setStalls([]);
      return;
    }
    setStallsLoading(true);
    api.get<ApiResponse<StallItem[]>>(`/stalls?exhibitionId=${selectedExId}`)
      .then((r) => setStalls(r.data ?? []))
      .catch(() => toast.error("Failed to load stalls"))
      .finally(() => setStallsLoading(false));
  }, [selectedExId]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setRequestsLoading(true);
    setRequestError("");
    const endpoint = isExhibitor
      ? "/facilities/my?page=0&size=100&sort=createdAt,desc"
      : "/facilities?page=0&size=100&sort=createdAt,desc";

    api.get<ApiResponse<PageResponse<FacilityRequestItem>>>(endpoint)
      .then((r) => {
        if (!cancelled) setRequests(r.data?.content ?? []);
      })
      .catch((err) => {
        if (!cancelled) setRequestError(err instanceof ApiError ? err.message : "Failed to load requests");
      })
      .finally(() => {
        if (!cancelled) setRequestsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isExhibitor, user]);

  const openAddType = () => {
    setEditingType(null);
    setTypeForm(emptyTypeForm);
    setTypeDialogOpen(true);
  };

  const openEditType = (ft: FacilityType) => {
    setEditingType(ft);
    setTypeForm({ name: ft.name, icon: ft.icon, description: ft.description ?? "", active: ft.active });
    setTypeDialogOpen(true);
  };

  const handleSaveType = async () => {
    setIsSavingType(true);
    try {
      if (editingType) {
        const r = await api.put<ApiResponse<FacilityType>>(`/facility-types/${editingType.id}`, typeForm);
        if (r.data) setTypes((prev) => prev.map((t) => (t.id === editingType.id ? r.data! : t)));
        toast.success(r.message || "Facility type updated");
      } else {
        const r = await api.post<ApiResponse<FacilityType>>("/facility-types", typeForm);
        if (r.data) setTypes((prev) => [...prev, r.data!]);
        toast.success(r.message || "Facility type created");
      }
      setTypeDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save facility type");
    } finally {
      setIsSavingType(false);
    }
  };

  const handleDeleteType = async (id: number) => {
    try {
      await api.delete(`/facility-types/${id}`);
      setTypes((prev) => prev.filter((t) => t.id !== id));
      toast.success("Facility type deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete facility type");
    }
  };

  const openAssign = (stall: StallItem) => {
    setAssigningStall(stall);
    setAssignSelected(new Set(stall.facilities.map((f) => f.id)));
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "", active: true });
    setCategoryDialogOpen(true);
  };

  const openEditCategory = (category: StallCategoryType) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description ?? "",
      active: category.active,
    });
    setCategoryDialogOpen(true);
  };

  const openCategoryFacilities = (category: StallCategoryType) => {
    setAssigningCategory(category);
    setCategoryFacilityIds(new Set(category.facilities.map((facility) => facility.id)));
  };

  const toggleCategoryFacility = (id: number) => {
    setCategoryFacilityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveCategory = async () => {
    setIsSavingCategory(true);
    try {
      if (editingCategory) {
        const r = await api.put<ApiResponse<StallCategoryType>>(`/stall-category-types/${editingCategory.id}`, categoryForm);
        if (r.data) setStallCategories((prev) => prev.map((category) => (category.id === editingCategory.id ? r.data! : category)));
        toast.success(r.message || "Stall category updated");
      } else {
        const r = await api.post<ApiResponse<StallCategoryType>>("/stall-category-types", categoryForm);
        if (r.data) setStallCategories((prev) => [...prev, r.data!]);
        toast.success(r.message || "Stall category created");
      }
      setCategoryDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save stall category");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await api.delete(`/stall-category-types/${id}`);
      setStallCategories((prev) => prev.filter((category) => category.id !== id));
      toast.success("Stall category deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete stall category");
    }
  };

  const handleSaveCategoryFacilities = async () => {
    if (!assigningCategory) return;
    setIsSavingCategoryFacilities(true);
    try {
      const r = await api.put<ApiResponse<StallCategoryType>>(
        `/stall-category-types/${assigningCategory.id}/facilities`,
        Array.from(categoryFacilityIds)
      );
      if (r.data) setStallCategories((prev) => prev.map((category) => (category.id === assigningCategory.id ? r.data! : category)));
      toast.success("Facilities assigned to stall category");
      setAssigningCategory(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to assign facilities to stall category");
    } finally {
      setIsSavingCategoryFacilities(false);
    }
  };

  const toggleAssign = (id: number) => {
    setAssignSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveAssign = async () => {
    if (!assigningStall) return;
    setIsSavingAssign(true);
    try {
      const r = await api.put<ApiResponse<FacilityType[]>>(`/facility-types/stall/${assigningStall.id}`, Array.from(assignSelected));
      const updated = r.data ?? [];
      setStalls((prev) => prev.map((s) => (s.id === assigningStall.id ? { ...s, facilities: updated } : s)));
      toast.success("Facilities assigned");
      setAssigningStall(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to assign facilities");
    } finally {
      setIsSavingAssign(false);
    }
  };

  const handleSubmitRequest = async () => {
    setIsSubmittingRequest(true);
    try {
      const r = await api.post<ApiResponse<FacilityRequestItem>>("/facilities", {
        exhibitionId: Number(requestForm.exhibitionId),
        chairs: Number(requestForm.chairs),
        tables: Number(requestForm.tables),
        lights: Number(requestForm.lights),
        electricityRequired: requestForm.electricity,
        customRequirements: requestForm.custom,
      });
      if (r.data) setRequests((prev) => [r.data!, ...prev]);
      setRequestDialogOpen(false);
      setRequestForm({ exhibitionId: "", chairs: "2", tables: "1", lights: "2", electricity: true, custom: "" });
      toast.success(r.message || "Facility request submitted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit request");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleFulfill = async (id: number) => {
    try {
      const r = await api.patch<ApiResponse<FacilityRequestItem>>(`/facilities/${id}/fulfill`);
      if (r.data) setRequests((prev) => prev.map((req) => (req.id === id ? r.data! : req)));
      toast.success("Request marked as fulfilled");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update request");
    }
  };

  const categoryColor = (cat: string) => {
    if (cat === "prime") return "border-l-2 border-stall-prime bg-stall-prime-bg";
    if (cat === "super") return "border-l-2 border-stall-super bg-stall-super-bg";
    return "border-l-2 border-stall-general bg-stall-general-bg";
  };

  if (isExhibitor) {
    return (
      <div>
        <PageHeader
          title="Facility Requests"
          description="Request facilities for your stall"
          actions={
            <Button onClick={() => setRequestDialogOpen(true)}>
              <Plus size={16} className="mr-1" /> Request Facilities
            </Button>
          }
        />
        {requestError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {requestError}
          </div>
        )}
        <RequestsTable requests={requests} isLoading={requestsLoading} showActions={false} onFulfill={handleFulfill} />
        <RequestDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          form={requestForm}
          setForm={setRequestForm}
          exhibitions={exhibitions}
          isSubmitting={isSubmittingRequest}
          onSubmit={handleSubmitRequest}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Facilities" description="Manage facility types, stall assignments, and exhibitor requests" />

      <Tabs defaultValue="types">
        <TabsList className="mb-6">
          <TabsTrigger value="types" className="gap-1.5"><Settings2 size={14} /> Facility Types</TabsTrigger>
          {isAdmin && <TabsTrigger value="categories" className="gap-1.5"><Grid3X3 size={14} /> Stall Categories</TabsTrigger>}
          <TabsTrigger value="assign" className="gap-1.5"><Grid3X3 size={14} /> Stall Assignments</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5"><ClipboardList size={14} /> Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="types">
          <div className="mb-4 flex justify-end">
            <Button onClick={openAddType}><Plus size={16} className="mr-1" /> Add Facility Type</Button>
          </div>

          {typesLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {types.map((ft) => (
                <div key={ft.id} className={`flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4 ${!ft.active ? "opacity-50" : ""}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-2xl leading-none">{ft.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{ft.name}</p>
                      {ft.description && <p className="truncate text-xs text-muted-foreground">{ft.description}</p>}
                      {!ft.active && <span className="text-xs text-muted-foreground">Inactive</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditType(ft)}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => void handleDeleteType(ft.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
              {types.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground">No facility types yet. Add one to get started.</p>
              )}
            </div>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="categories">
            <div className="mb-4 flex justify-end">
              <Button onClick={openAddCategory}><Plus size={16} className="mr-1" /> Add Stall Category</Button>
            </div>

            {categoriesLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stallCategories.map((category) => (
                  <div key={category.id} className={`rounded-lg border border-border bg-card p-4 ${!category.active ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{category.name}</p>
                        {category.description && <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>}
                        {!category.active && <p className="mt-1 text-xs text-muted-foreground">Inactive</p>}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCategory(category)}>
                          <Pencil size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => void handleDeleteCategory(category.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 min-h-[28px]">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Facilities</p>
                      <div className="flex flex-wrap gap-1">
                        {category.facilities.length > 0 ? (
                          category.facilities.map((facility) => (
                            <span key={facility.id} className="inline-flex items-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 text-xs">
                              <span>{facility.icon}</span>
                              <span>{facility.name}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No facilities assigned</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 h-8 w-full text-xs" onClick={() => openCategoryFacilities(category)}>
                      Manage Facilities
                    </Button>
                  </div>
                ))}
                {stallCategories.length === 0 && (
                  <p className="col-span-full text-sm text-muted-foreground">No stall categories yet. Add one to get started.</p>
                )}
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="assign">
          <div className="mb-5 max-w-sm">
            <Label className="mb-1 block">Select Exhibition</Label>
            <Select value={selectedExId} onValueChange={setSelectedExId}>
              <SelectTrigger><SelectValue placeholder="Choose exhibition" /></SelectTrigger>
              <SelectContent>
                {exhibitions.map((ex) => (
                  <SelectItem key={ex.id} value={String(ex.id)}>{ex.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedExId && (
            stallsLoading ? (
              <p className="text-sm text-muted-foreground">Loading stalls...</p>
            ) : stalls.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stalls found for this exhibition.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stalls.map((stall) => (
                  <div key={stall.id} className={`rounded-lg p-4 ${categoryColor(stall.category)}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{stall.number}</span>
                      <span className="text-xs capitalize text-muted-foreground">{stall.status}</span>
                    </div>
                    <div className="mb-3 flex min-h-[24px] flex-wrap gap-1">
                      {stall.facilities.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No facilities assigned</span>
                      ) : (
                        stall.facilities.map((f) => (
                          <span key={f.id} className="inline-flex items-center gap-0.5 rounded border border-border bg-background/70 px-1.5 py-0.5 text-xs">
                            {f.icon} {f.name}
                          </span>
                        ))
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="h-7 w-full text-xs" onClick={() => openAssign(stall)}>
                      Manage Facilities
                    </Button>
                  </div>
                ))}
              </div>
            )
          )}
        </TabsContent>

        <TabsContent value="requests">
          {requestError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {requestError}
            </div>
          )}
          <RequestsTable requests={requests} isLoading={requestsLoading} showActions={true} onFulfill={handleFulfill} />
        </TabsContent>
      </Tabs>

      <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editingType ? "Edit Facility Type" : "Add Facility Type"}</DialogTitle></DialogHeader>
          <div className="mt-2 space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} placeholder="e.g. Electricity" />
            </div>
            <div>
              <Label>Icon</Label>
              <Input value={typeForm.icon} onChange={(e) => setTypeForm({ ...typeForm, icon: e.target.value })} placeholder="\u26A1" maxLength={4} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={typeForm.description} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} placeholder="Short description" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={typeForm.active} onCheckedChange={(v) => setTypeForm({ ...typeForm, active: v })} />
              <Label>Active</Label>
            </div>
            <Button onClick={() => void handleSaveType()} className="w-full" disabled={isSavingType || !typeForm.name.trim()}>
              {isSavingType ? "Saving..." : editingType ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editingCategory ? "Edit Stall Category" : "Add Stall Category"}</DialogTitle></DialogHeader>
          <div className="mt-2 space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g. Corner Premium" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Short description" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={categoryForm.active} onCheckedChange={(v) => setCategoryForm({ ...categoryForm, active: v })} />
              <Label>Active</Label>
            </div>
            <Button onClick={() => void handleSaveCategory()} className="w-full" disabled={isSavingCategory || !categoryForm.name.trim()}>
              {isSavingCategory ? "Saving..." : editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assigningCategory} onOpenChange={(open) => { if (!open) setAssigningCategory(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Facilities - {assigningCategory?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-2">
            {types.filter((type) => type.active).map((facility) => (
              <label key={facility.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${categoryFacilityIds.has(facility.id) ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"}`}>
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={categoryFacilityIds.has(facility.id)}
                  onChange={() => toggleCategoryFacility(facility.id)}
                />
                <span className="text-lg leading-none">{facility.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{facility.name}</p>
                  {facility.description && <p className="text-xs text-muted-foreground">{facility.description}</p>}
                </div>
              </label>
            ))}
            {types.filter((type) => type.active).length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No active facility types. Create some in the Facility Types tab first.</p>
            )}
          </div>
          <Button onClick={() => void handleSaveCategoryFacilities()} className="mt-2 w-full" disabled={isSavingCategoryFacilities}>
            {isSavingCategoryFacilities ? "Saving..." : "Save Assignment"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assigningStall} onOpenChange={(open) => { if (!open) setAssigningStall(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Facilities - Stall {assigningStall?.number}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-2">
            {types.filter((t) => t.active).map((ft) => (
              <label key={ft.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${assignSelected.has(ft.id) ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"}`}>
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={assignSelected.has(ft.id)}
                  onChange={() => toggleAssign(ft.id)}
                />
                <span className="text-lg leading-none">{ft.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{ft.name}</p>
                  {ft.description && <p className="text-xs text-muted-foreground">{ft.description}</p>}
                </div>
              </label>
            ))}
            {types.filter((t) => t.active).length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No active facility types. Create some in the Facility Types tab first.</p>
            )}
          </div>
          <Button onClick={() => void handleSaveAssign()} className="mt-2 w-full" disabled={isSavingAssign}>
            {isSavingAssign ? "Saving..." : "Save Assignment"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface RequestsTableProps {
  requests: FacilityRequestItem[];
  isLoading: boolean;
  showActions: boolean;
  onFulfill: (id: number) => void;
}

const RequestsTable = ({ requests, isLoading, showActions, onFulfill }: RequestsTableProps) => (
  <div className="rounded-lg border border-border bg-card">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="p-3 text-left font-semibold text-muted-foreground">Exhibitor</th>
            <th className="p-3 text-left font-semibold text-muted-foreground">Exhibition</th>
            <th className="p-3 text-center font-semibold text-muted-foreground">Chairs</th>
            <th className="p-3 text-center font-semibold text-muted-foreground">Tables</th>
            <th className="p-3 text-center font-semibold text-muted-foreground">Lights</th>
            <th className="p-3 text-center font-semibold text-muted-foreground">Electricity</th>
            <th className="p-3 text-left font-semibold text-muted-foreground">Custom</th>
            <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
            {showActions && <th className="p-3 text-right font-semibold text-muted-foreground">Action</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td colSpan={showActions ? 9 : 8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
          )}
          {!isLoading && requests.length === 0 && (
            <tr><td colSpan={showActions ? 9 : 8} className="p-8 text-center text-muted-foreground">No facility requests found.</td></tr>
          )}
          {requests.map((req) => (
            <tr key={req.id} className="border-b border-border transition-colors last:border-0 hover:bg-accent/40">
              <td className="p-3 text-foreground">{req.exhibitorName}</td>
              <td className="p-3 text-foreground">{req.exhibitionName}</td>
              <td className="p-3 text-center text-foreground">{req.chairs}</td>
              <td className="p-3 text-center text-foreground">{req.tables}</td>
              <td className="p-3 text-center text-foreground">{req.lights}</td>
              <td className="p-3 text-center text-foreground">{req.electricityRequired ? "Yes" : "-"}</td>
              <td className="p-3 text-xs text-muted-foreground">{req.customRequirements || "-"}</td>
              <td className="p-3">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${req.status === "fulfilled" ? "border-green-200 bg-green-50 text-green-700" : "border-yellow-200 bg-yellow-50 text-yellow-700"}`}>
                  {req.status}
                </span>
              </td>
              {showActions && (
                <td className="p-3 text-right">
                  {req.status === "pending" && (
                    <Button variant="outline" size="sm" onClick={() => void onFulfill(req.id)}>
                      <Check size={13} className="mr-1" /> Fulfill
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

interface RequestDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: { exhibitionId: string; chairs: string; tables: string; lights: string; electricity: boolean; custom: string };
  setForm: (f: RequestDialogProps["form"]) => void;
  exhibitions: ExhibitionItem[];
  isSubmitting: boolean;
  onSubmit: () => void;
}

const RequestDialog = ({ open, onOpenChange, form, setForm, exhibitions, isSubmitting, onSubmit }: RequestDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader><DialogTitle>Request Facilities</DialogTitle></DialogHeader>
      <div className="mt-4 space-y-4">
        <div>
          <Label>Exhibition</Label>
          <Select value={form.exhibitionId} onValueChange={(v) => setForm({ ...form, exhibitionId: v })}>
            <SelectTrigger><SelectValue placeholder="Select exhibition" /></SelectTrigger>
            <SelectContent>
              {exhibitions.map((ex) => (
                <SelectItem key={ex.id} value={String(ex.id)}>{ex.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Chairs</Label><Input type="number" value={form.chairs} onChange={(e) => setForm({ ...form, chairs: e.target.value })} /></div>
          <div><Label>Tables</Label><Input type="number" value={form.tables} onChange={(e) => setForm({ ...form, tables: e.target.value })} /></div>
          <div><Label>Lights</Label><Input type="number" value={form.lights} onChange={(e) => setForm({ ...form, lights: e.target.value })} /></div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.electricity} onCheckedChange={(v) => setForm({ ...form, electricity: v })} />
          <Label>Electricity Required</Label>
        </div>
        <div>
          <Label>Custom Requirements</Label>
          <Input value={form.custom} onChange={(e) => setForm({ ...form, custom: e.target.value })} placeholder="Any other requirements" />
        </div>
        <Button onClick={onSubmit} className="w-full" disabled={isSubmitting || !form.exhibitionId}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default FacilitiesPage;
