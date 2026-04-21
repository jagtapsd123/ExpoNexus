import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Check } from "lucide-react";
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
  status: string;
}

interface FacilityRequestItem {
  id: number;
  exhibitorName: string;
  exhibitionId: number;
  exhibitionName: string;
  chairs: number;
  tables: number;
  lights: number;
  electricityRequired: boolean;
  customRequirements?: string;
  status: string;
}

const FacilitiesPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FacilityRequestItem[]>([]);
  const [exhibitions, setExhibitions] = useState<ExhibitionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ exhibitionId: "", chairs: "2", tables: "1", lights: "2", electricity: true, custom: "" });

  const isExhibitor = user?.role === "exhibitor";
  const isOrganizerOrAdmin = user?.role === "organizer" || user?.role === "admin";

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const requestEndpoint = isExhibitor
          ? "/facilities/my?page=0&size=100&sort=createdAt,desc"
          : "/facilities?page=0&size=100&sort=createdAt,desc";

        const [requestResponse, exhibitionResponse] = await Promise.all([
          api.get<ApiResponse<PageResponse<FacilityRequestItem>>>(requestEndpoint),
          api.get<ApiResponse<PageResponse<ExhibitionItem>>>("/exhibitions?page=0&size=100&sort=startDate,desc"),
        ]);

        if (cancelled) return;

        setRequests(requestResponse.data?.content ?? []);
        setExhibitions((exhibitionResponse.data?.content ?? []).filter((ex) => ex.status !== "completed"));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load facility requests");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [isExhibitor, user]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post<ApiResponse<FacilityRequestItem>>("/facilities", {
        exhibitionId: Number(form.exhibitionId),
        chairs: Number(form.chairs),
        tables: Number(form.tables),
        lights: Number(form.lights),
        electricityRequired: form.electricity,
        customRequirements: form.custom,
      });

      if (response.data) {
        setRequests((prev) => [response.data!, ...prev]);
      }

      setOpen(false);
      setForm({ exhibitionId: "", chairs: "2", tables: "1", lights: "2", electricity: true, custom: "" });
      toast.success(response.message || "Facility request submitted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit facility request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFulfill = async (id: number) => {
    try {
      const response = await api.patch<ApiResponse<FacilityRequestItem>>(`/facilities/${id}/fulfill`);
      if (response.data) {
        setRequests((prev) => prev.map((request) => (request.id === id ? response.data! : request)));
      }
      toast.success("Request marked as fulfilled");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update request");
    }
  };

  return (
    <div>
      <PageHeader
        title="Facilities"
        description={isExhibitor ? "Request facilities for your stall" : "Manage facility requests"}
        actions={isExhibitor ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus size={16} className="mr-1" /> Request Facilities</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request Facilities</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Exhibition</Label>
                  <Select value={form.exhibitionId} onValueChange={(value) => setForm({ ...form, exhibitionId: value })}>
                    <SelectTrigger><SelectValue placeholder="Select exhibition" /></SelectTrigger>
                    <SelectContent>
                      {exhibitions.map((exhibition) => (
                        <SelectItem key={exhibition.id} value={String(exhibition.id)}>{exhibition.name}</SelectItem>
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
                  <Switch checked={form.electricity} onCheckedChange={(checked) => setForm({ ...form, electricity: checked })} />
                  <Label>Electricity Required</Label>
                </div>
                <div><Label>Custom Requirements</Label><Input value={form.custom} onChange={(e) => setForm({ ...form, custom: e.target.value })} placeholder="Any other requirements" /></div>
                <Button onClick={() => void handleSubmit()} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : undefined}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Exhibitor</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Exhibition</th>
                <th className="text-center p-3 text-muted-foreground font-medium">Chairs</th>
                <th className="text-center p-3 text-muted-foreground font-medium">Tables</th>
                <th className="text-center p-3 text-muted-foreground font-medium">Lights</th>
                <th className="text-center p-3 text-muted-foreground font-medium">Electricity</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Custom</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                {isOrganizerOrAdmin && <th className="text-right p-3 text-muted-foreground font-medium">Action</th>}
              </tr>
            </thead>
            <tbody>
              {!isLoading && requests.length === 0 && (
                <tr>
                  <td colSpan={isOrganizerOrAdmin ? 9 : 8} className="p-8 text-center text-muted-foreground">No facility requests found.</td>
                </tr>
              )}
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="p-3 text-foreground">{request.exhibitorName}</td>
                  <td className="p-3 text-foreground">{request.exhibitionName}</td>
                  <td className="p-3 text-center text-foreground">{request.chairs}</td>
                  <td className="p-3 text-center text-foreground">{request.tables}</td>
                  <td className="p-3 text-center text-foreground">{request.lights}</td>
                  <td className="p-3 text-center">{request.electricityRequired ? "Yes" : "-"}</td>
                  <td className="p-3 text-muted-foreground">{request.customRequirements || "-"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${request.status === "fulfilled" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {request.status}
                    </span>
                  </td>
                  {isOrganizerOrAdmin && (
                    <td className="p-3 text-right">
                      {request.status === "pending" && (
                        <Button variant="outline" size="sm" onClick={() => void handleFulfill(request.id)}>
                          <Check size={14} className="mr-1" /> Fulfill
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
    </div>
  );
};

export default FacilitiesPage;
