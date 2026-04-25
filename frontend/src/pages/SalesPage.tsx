import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, IndianRupee } from "lucide-react";
import { api, ApiError } from "@/lib/apiClient";

interface ApiResponse<T> { success: boolean; message?: string; data?: T; }
interface PageResponse<T> { content: T[]; totalElements: number; }

interface Sale {
  id: number; productId: number; productName: string;
  exhibitionId: number; exhibitionName: string;
  quantity: number; unitPrice: number; total: number;
  paymentMode: string; note?: string; soldAt: string;
}

interface Product {
  id: number; name: string; price: number;
  remainingQuantity: number; stockStatus: string;
}

interface Exhibition { id: number; name: string; status: string; }

const PAYMENT_MODES = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"];
const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const SalesPage = () => {
  const [sales, setSales]           = useState<Sale[]>([]);
  const [products, setProducts]     = useState<Product[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm]             = useState({ exhibitionId: "", productId: "", quantity: "1", paymentMode: "CASH", note: "" });
  const [isSaving, setIsSaving]     = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const selectedProduct = products.find((p) => p.id === Number(form.productId));
  const saleTotal = selectedProduct ? selectedProduct.price * Number(form.quantity || 0) : 0;

  const loadSales = (p = 0) => {
    api.get<ApiResponse<PageResponse<Sale>>>(`/sales/my?page=${p}&size=20&sort=soldAt,desc`)
      .then((r) => {
        setSales(r.data?.content ?? []);
        const total = r.data?.totalElements ?? 0;
        setTotalPages(Math.ceil(total / 20));
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load sales"));
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      api.get<ApiResponse<PageResponse<Product>>>("/products/my?page=0&size=200"),
      api.get<ApiResponse<PageResponse<Exhibition>>>("/exhibitions?page=0&size=200&sort=startDate,desc"),
      api.get<ApiResponse<PageResponse<Sale>>>("/sales/my?page=0&size=20&sort=soldAt,desc"),
    ])
      .then(([pr, er, sr]) => {
        if (cancelled) return;
        setProducts(pr.data?.content ?? []);
        setExhibitions(er.data?.content ?? []);
        setSales(sr.data?.content ?? []);
        setTotalPages(Math.ceil((sr.data?.totalElements ?? 0) / 20));
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load data"))
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    if (!form.exhibitionId) { toast.error("Select an exhibition"); return; }
    if (!form.productId)    { toast.error("Select a product"); return; }
    if (Number(form.quantity) < 1) { toast.error("Quantity must be at least 1"); return; }
    if (selectedProduct && Number(form.quantity) > selectedProduct.remainingQuantity) {
      toast.error(`Only ${selectedProduct.remainingQuantity} units available`); return;
    }
    setIsSaving(true);
    try {
      const r = await api.post<ApiResponse<Sale>>("/sales", {
        exhibitionId: Number(form.exhibitionId),
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        paymentMode: form.paymentMode,
        note: form.note || null,
      });
      if (r.data) {
        setSales((prev) => [r.data!, ...prev]);
        // Refresh products to update stock counts
        const pr = await api.get<ApiResponse<PageResponse<Product>>>("/products/my?page=0&size=200");
        setProducts(pr.data?.content ?? []);
      }
      toast.success(r.message || "Sale recorded");
      setDialogOpen(false);
      setForm({ exhibitionId: "", productId: "", quantity: "1", paymentMode: "CASH", note: "" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to record sale");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/sales/${id}`);
      setSales((prev) => prev.filter((s) => s.id !== id));
      setDeleteId(null);
      toast.success("Sale deleted and stock restored");
      const pr = await api.get<ApiResponse<PageResponse<Product>>>("/products/my?page=0&size=200");
      setProducts(pr.data?.content ?? []);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete sale");
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div>
      <PageHeader
        title="Sales"
        description="Record product sales and track revenue"
        actions={<Button onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-1" /> Record Sale</Button>}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Revenue (this page)</p>
            <p className="text-xl font-bold text-green-600 mt-1">{fmt(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Transactions</p>
            <p className="text-xl font-bold mt-1">{sales.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Avg Order Value</p>
            <p className="text-xl font-bold mt-1">{sales.length ? fmt(totalRevenue / sales.length) : "Rs. 0"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {sales.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart size={40} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No sales recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Record your first sale to track revenue.</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}><Plus size={15} className="mr-1" /> Record Sale</Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left p-3 text-xs text-muted-foreground font-semibold">Date &amp; Time</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-semibold">Product</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-semibold hidden md:table-cell">Exhibition</th>
                    <th className="text-center p-3 text-xs text-muted-foreground font-semibold">Qty</th>
                    <th className="text-right p-3 text-xs text-muted-foreground font-semibold">Unit Price</th>
                    <th className="text-right p-3 text-xs text-muted-foreground font-semibold">Total</th>
                    <th className="text-center p-3 text-xs text-muted-foreground font-semibold hidden lg:table-cell">Payment</th>
                    <th className="text-right p-3 text-xs text-muted-foreground font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
                  {sales.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(s.soldAt).toLocaleDateString("en-IN")}<br />
                        <span className="text-muted-foreground/60">{new Date(s.soldAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </td>
                      <td className="p-3 font-medium">{s.productName}</td>
                      <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{s.exhibitionName}</td>
                      <td className="p-3 text-center font-medium">{s.quantity}</td>
                      <td className="p-3 text-right">{fmt(s.unitPrice)}</td>
                      <td className="p-3 text-right font-bold text-green-600">{fmt(s.total)}</td>
                      <td className="p-3 text-center hidden lg:table-cell">
                        <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{s.paymentMode}</span>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 size={13} /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => { setPage(page - 1); loadSales(page - 1); }}>Previous</Button>
                <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => { setPage(page + 1); loadSales(page + 1); }}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Record Sale dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setForm({ exhibitionId: "", productId: "", quantity: "1", paymentMode: "CASH", note: "" }); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record Sale</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Exhibition <span className="text-destructive">*</span></Label>
              <Select value={form.exhibitionId || "none"} onValueChange={(v) => setForm({ ...form, exhibitionId: v === "none" ? "" : v, productId: "" })}>
                <SelectTrigger><SelectValue placeholder="Select exhibition" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select exhibition…</SelectItem>
                  {exhibitions.map((ex) => (
                    <SelectItem key={ex.id} value={String(ex.id)}>{ex.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Product <span className="text-destructive">*</span></Label>
              <Select value={form.productId || "none"} onValueChange={(v) => setForm({ ...form, productId: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select product…</SelectItem>
                  {products.filter((p) => p.remainingQuantity > 0).map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} — {fmt(p.price)} ({p.remainingQuantity} left)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProduct && (
                <p className="text-xs text-muted-foreground mt-1">
                  Available: <span className="font-medium">{selectedProduct.remainingQuantity}</span> units @ {fmt(selectedProduct.price)}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity <span className="text-destructive">*</span></Label>
                <Input type="number" min={1} max={selectedProduct?.remainingQuantity} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div>
                <Label>Payment Mode</Label>
                <Select value={form.paymentMode} onValueChange={(v) => setForm({ ...form, paymentMode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Any note…" />
            </div>
            {saleTotal > 0 && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-2">
                <IndianRupee size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">Sale Total: <strong>{fmt(saleTotal)}</strong></span>
              </div>
            )}
            <Button className="w-full" onClick={() => void handleSave()} disabled={isSaving || !form.exhibitionId || !form.productId}>
              {isSaving ? "Recording…" : "Record Sale"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Sale</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will delete the sale and restore the stock quantity.</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteId !== null && void handleDelete(deleteId)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPage;
