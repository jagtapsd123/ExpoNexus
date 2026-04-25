import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Receipt, Lock } from "lucide-react";
import { api, ApiError } from "@/lib/apiClient";

interface ApiResponse<T> { success: boolean; message?: string; data?: T; }
interface PageResponse<T> { content: T[]; totalElements: number; }

interface Expense {
  id: number; exhibitionId?: number; exhibitionName?: string;
  type: string; amount: number; note?: string; expenseDate: string;
  bookingId?: number | null;
}

interface Exhibition { id: number; name: string; }

const EXPENSE_TYPES = [
  "Stall Rent", "Product Purchase", "Transport", "Staff Salary",
  "Decoration", "Electricity", "Marketing", "Food", "Miscellaneous",
];

const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const ExpensesPage = () => {
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm]             = useState({ type: "", amount: "", exhibitionId: "", note: "", expenseDate: new Date().toISOString().slice(0, 10) });
  const [isSaving, setIsSaving]     = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      api.get<ApiResponse<PageResponse<Expense>>>("/expenses/my?page=0&size=200&sort=expenseDate,desc"),
      api.get<ApiResponse<PageResponse<Exhibition>>>("/exhibitions?page=0&size=200&sort=startDate,desc"),
    ])
      .then(([er, exr]) => {
        if (cancelled) return;
        setExpenses(er.data?.content ?? []);
        setExhibitions(exr.data?.content ?? []);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load expenses"))
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    if (!form.type)     { toast.error("Expense type is required"); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast.error("Amount must be greater than 0"); return; }
    if (!form.expenseDate) { toast.error("Date is required"); return; }
    setIsSaving(true);
    try {
      const r = await api.post<ApiResponse<Expense>>("/expenses", {
        type: form.type, amount: Number(form.amount),
        exhibitionId: form.exhibitionId ? Number(form.exhibitionId) : null,
        note: form.note || null,
        expenseDate: form.expenseDate,
      });
      if (r.data) setExpenses((prev) => [r.data!, ...prev]);
      toast.success(r.message || "Expense logged");
      setDialogOpen(false);
      setForm({ type: "", amount: "", exhibitionId: "", note: "", expenseDate: new Date().toISOString().slice(0, 10) });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to log expense");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setDeleteId(null);
      toast.success("Expense deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete expense");
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by type for summary
  const byType = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + e.amount;
    return acc;
  }, {});
  const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track all your business expenses"
        actions={<Button onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-1" /> Log Expense</Button>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-xl font-bold text-red-600 mt-1">{fmt(totalExpenses)}</p>
          </CardContent>
        </Card>
        {topTypes.map(([type, amount]) => (
          <Card key={type}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground truncate">{type}</p>
              <p className="text-lg font-bold mt-1">{fmt(amount)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {expenses.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt size={40} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No expenses logged yet</p>
            <p className="text-xs text-muted-foreground mt-1">Log your first expense to track costs.</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}><Plus size={15} className="mr-1" /> Log Expense</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left p-3 text-xs text-muted-foreground font-semibold">Date</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-semibold">Type</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-semibold hidden md:table-cell">Exhibition</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-semibold hidden lg:table-cell">Note</th>
                  <th className="text-right p-3 text-xs text-muted-foreground font-semibold">Amount</th>
                  <th className="text-right p-3 text-xs text-muted-foreground font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(e.expenseDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${e.bookingId ? "bg-orange-100 text-orange-700 border border-orange-200" : "bg-muted text-muted-foreground"}`}>
                        {e.type}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{e.exhibitionName ?? "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-xs truncate hidden lg:table-cell">{e.note ?? "—"}</td>
                    <td className="p-3 text-right font-medium text-red-600">{fmt(e.amount)}</td>
                    <td className="p-3 text-right">
                      {e.bookingId ? (
                        <span title="Auto-generated from booking — cancel the booking to remove">
                          <Lock size={13} className="text-muted-foreground mx-auto" />
                        </span>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(e.id)}><Trash2 size={13} /></Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Expense dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setForm({ type: "", amount: "", exhibitionId: "", note: "", expenseDate: new Date().toISOString().slice(0, 10) }); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Log Expense</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Expense Type <span className="text-destructive">*</span></Label>
                <Select value={form.type || "none"} onValueChange={(v) => setForm({ ...form, type: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select type…</SelectItem>
                    {EXPENSE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (Rs.) <span className="text-destructive">*</span></Label>
                <Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label>Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
              </div>
              <div>
                <Label>Exhibition</Label>
                <Select value={form.exhibitionId || "none"} onValueChange={(v) => setForm({ ...form, exhibitionId: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / General</SelectItem>
                    {exhibitions.map((ex) => <SelectItem key={ex.id} value={String(ex.id)}>{ex.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Note</Label>
                <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional note…" />
              </div>
            </div>
            <Button className="w-full" onClick={() => void handleSave()} disabled={isSaving || !form.type || !form.amount}>
              {isSaving ? "Saving…" : "Log Expense"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Expense</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this expense?</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteId !== null && void handleDelete(deleteId)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;
