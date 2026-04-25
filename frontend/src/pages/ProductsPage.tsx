import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Search, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/apiClient";

interface ApiResponse<T> { success: boolean; message?: string; data?: T; }
interface PageResponse<T> { content: T[]; totalElements: number; }

interface Product {
  id: number; name: string; description?: string;
  price: number; costPrice: number;
  quantity: number; soldQuantity: number; remainingQuantity: number;
  revenue: number; profit: number;
  stockStatus: string; category?: string; sku?: string;
  exhibitionId?: number; exhibitionName?: string;
}

interface Exhibition { id: number; name: string; status: string; }

const emptyForm = {
  name: "", description: "", price: "", costPrice: "", quantity: "",
  category: "", sku: "", exhibitionId: "",
};

const stockBadge = (s: string) => {
  if (s === "out_of_stock") return <Badge variant="destructive">Out of Stock</Badge>;
  if (s === "low_stock")    return <Badge className="bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-100">Low Stock</Badge>;
  return <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">In Stock</Badge>;
};

const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const ProductsPage = () => {
  const [products, setProducts]     = useState<Product[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [search, setSearch]         = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<Product | null>(null);
  const [form, setForm]             = useState(emptyForm);
  const [isSaving, setIsSaving]     = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      api.get<ApiResponse<PageResponse<Product>>>("/products/my?page=0&size=200&sort=createdAt,desc"),
      api.get<ApiResponse<PageResponse<Exhibition>>>("/exhibitions?page=0&size=200&sort=startDate,desc"),
    ])
      .then(([pr, er]) => {
        if (cancelled) return;
        setProducts(pr.data?.content ?? []);
        setExhibitions(er.data?.content ?? []);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load products"))
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description ?? "",
      price: String(p.price), costPrice: String(p.costPrice),
      quantity: String(p.quantity), category: p.category ?? "",
      sku: p.sku ?? "", exhibitionId: p.exhibitionId ? String(p.exhibitionId) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (!form.quantity || Number(form.quantity) < 0) { toast.error("Quantity is required"); return; }
    setIsSaving(true);
    try {
      const payload = {
        name: form.name, description: form.description,
        price: Number(form.price), costPrice: Number(form.costPrice),
        quantity: Number(form.quantity), category: form.category || null,
        sku: form.sku || null,
        exhibitionId: form.exhibitionId ? Number(form.exhibitionId) : null,
      };
      if (editing) {
        const r = await api.put<ApiResponse<Product>>(`/products/${editing.id}`, payload);
        if (r.data) setProducts((prev) => prev.map((p) => (p.id === editing.id ? r.data! : p)));
        toast.success(r.message || "Product updated");
      } else {
        const r = await api.post<ApiResponse<Product>>("/products", payload);
        if (r.data) setProducts((prev) => [r.data!, ...prev]);
        toast.success(r.message || "Product created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
      toast.success("Product deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete product");
    }
  };

  const filtered = products.filter(
    (p) => !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.exhibitionName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const outOfStock = products.filter((p) => p.stockStatus === "out_of_stock").length;
  const lowStock   = products.filter((p) => p.stockStatus === "low_stock").length;

  return (
    <div>
      <PageHeader
        title="My Products"
        description="Manage your product catalogue and inventory"
        actions={<Button onClick={openAdd}><Plus size={16} className="mr-1" /> Add Product</Button>}
      />

      {/* Alerts */}
      {(outOfStock > 0 || lowStock > 0) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {outOfStock > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertTriangle size={14} /> <span className="font-medium">{outOfStock}</span> product{outOfStock !== 1 ? "s" : ""} out of stock
            </div>
          )}
          {lowStock > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-sm">
              <AlertTriangle size={14} /> <span className="font-medium">{lowStock}</span> product{lowStock !== 1 ? "s" : ""} running low
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {filtered.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={40} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No products yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first product to get started.</p>
            <Button className="mt-4" onClick={openAdd}><Plus size={15} className="mr-1" /> Add Product</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left p-3 text-xs text-muted-foreground font-semibold">Product</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-semibold hidden lg:table-cell">Exhibition</th>
                  <th className="text-right p-3 text-xs text-muted-foreground font-semibold">Price / Cost</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-semibold">Total&nbsp;/&nbsp;Sold&nbsp;/&nbsp;Left</th>
                  <th className="text-right p-3 text-xs text-muted-foreground font-semibold hidden md:table-cell">Revenue</th>
                  <th className="text-right p-3 text-xs text-muted-foreground font-semibold hidden md:table-cell">Profit</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-semibold">Stock</th>
                  <th className="text-right p-3 text-xs text-muted-foreground font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
                )}
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
                    <td className="p-3">
                      <p className="font-medium text-foreground">{p.name}</p>
                      {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                      {p.sku && <p className="text-xs text-muted-foreground/60">SKU: {p.sku}</p>}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell">{p.exhibitionName ?? "—"}</td>
                    <td className="p-3 text-right">
                      <p className="font-medium">{fmt(p.price)}</p>
                      <p className="text-xs text-muted-foreground">Cost: {fmt(p.costPrice)}</p>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-medium">{p.quantity}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span className="text-blue-600 font-medium">{p.soldQuantity}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span className={p.remainingQuantity === 0 ? "text-red-600 font-medium" : p.remainingQuantity <= p.quantity * 0.2 ? "text-orange-600 font-medium" : "text-green-600 font-medium"}>
                        {p.remainingQuantity}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium text-blue-600 hidden md:table-cell">{fmt(p.revenue)}</td>
                    <td className={`p-3 text-right font-medium hidden md:table-cell ${p.profit >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(p.profit)}</td>
                    <td className="p-3 text-center">{stockBadge(p.stockStatus)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil size={13} /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 size={13} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Product Name <span className="text-destructive">*</span></Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Organic Honey" />
              </div>
              <div>
                <Label>Price Per Unit (Rs.) <span className="text-destructive">*</span></Label>
                <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label>Cost Price Per Unit (Rs.)</Label>
                <Input type="number" min={0} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label>Total Quantity <span className="text-destructive">*</span></Label>
                <Input type="number" min={0} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Food & Beverage" />
              </div>
              <div>
                <Label>SKU Code</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Optional" />
              </div>
              <div>
                <Label>Exhibition</Label>
                <Select value={form.exhibitionId || "none"} onValueChange={(v) => setForm({ ...form, exhibitionId: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select exhibition" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / General</SelectItem>
                    {exhibitions.map((ex) => (
                      <SelectItem key={ex.id} value={String(ex.id)}>{ex.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short product description" />
              </div>
            </div>
            <Button className="w-full" onClick={() => void handleSave()} disabled={isSaving || !form.name.trim()}>
              {isSaving ? "Saving…" : editing ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Product</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteId !== null && void handleDelete(deleteId)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
