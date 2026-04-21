import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/apiClient";

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

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

interface ComplaintItem {
  id: number;
  exhibitorName: string;
  exhibitionId: number;
  exhibitionName: string;
  subject: string;
  description: string;
  status: "open" | "in-progress" | "resolved";
  resolutionNote?: string;
  createdAt: string;
}

const ComplaintsPage = () => {
  const { user } = useAuth();
  const [list, setList] = useState<ComplaintItem[]>([]);
  const [exhibitions, setExhibitions] = useState<ExhibitionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ exhibitionId: "", subject: "", description: "" });

  const canSubmit = user?.role === "exhibitor";
  const canUpdateStatus = user?.role === "admin" || user?.role === "organizer";

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const complaintEndpoint = canSubmit
          ? "/complaints/my?page=0&size=100&sort=createdAt,desc"
          : "/complaints?page=0&size=100&sort=createdAt,desc";

        const [complaintResponse, exhibitionResponse] = await Promise.all([
          api.get<ApiResponse<PageResponse<ComplaintItem>>>(complaintEndpoint),
          api.get<ApiResponse<PageResponse<ExhibitionItem>>>("/exhibitions?page=0&size=100&sort=startDate,desc"),
        ]);

        if (cancelled) return;

        setList(complaintResponse.data?.content ?? []);
        setExhibitions((exhibitionResponse.data?.content ?? []).filter((exhibition) => exhibition.status !== "completed"));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load complaints");
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
  }, [canSubmit, user]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post<ApiResponse<ComplaintItem>>("/complaints", {
        exhibitionId: Number(form.exhibitionId),
        subject: form.subject,
        description: form.description,
      });

      if (response.data) {
        setList((prev) => [response.data!, ...prev]);
      }

      setOpen(false);
      setForm({ exhibitionId: "", subject: "", description: "" });
      toast.success(response.message || "Complaint submitted successfully");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, status: ComplaintItem["status"]) => {
    const apiStatus = status === "in-progress" ? "IN_PROGRESS" : status.toUpperCase();

    try {
      const response = await api.patch<ApiResponse<ComplaintItem>>(`/complaints/${id}/status?status=${apiStatus}`);
      if (response.data) {
        setList((prev) => prev.map((complaint) => (complaint.id === id ? response.data! : complaint)));
      }
      toast.success(`Complaint status updated to ${status}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update complaint status");
    }
  };

  return (
    <div>
      <PageHeader
        title="Complaints & Feedback"
        description={canSubmit ? "Submit and track your complaints" : "View and manage complaints"}
        actions={
          canSubmit ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={16} className="mr-1" /> New Complaint</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Submit Complaint</DialogTitle></DialogHeader>
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
                  <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                  <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></div>
                  <Button onClick={() => void handleSubmit()} className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
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

      <div className="space-y-3">
        {!isLoading && list.length === 0 && (
          <div className="bg-card rounded-lg border border-border p-6 text-sm text-muted-foreground">
            No complaints found.
          </div>
        )}

        {list.map((complaint) => (
          <div key={complaint.id} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-start justify-between mb-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{complaint.subject}</h3>
                <p className="text-xs text-muted-foreground">by {complaint.exhibitorName} · {complaint.exhibitionName}</p>
              </div>
              {canUpdateStatus ? (
                <Select value={complaint.status} onValueChange={(value) => void handleStatusChange(complaint.id, value as ComplaintItem["status"])}>
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[complaint.status] || ""}`}>
                  {complaint.status}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{complaint.description}</p>
            {complaint.resolutionNote && (
              <p className="text-xs text-foreground mb-2">Resolution: {complaint.resolutionNote}</p>
            )}
            <p className="text-xs text-muted-foreground">{new Date(complaint.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplaintsPage;
