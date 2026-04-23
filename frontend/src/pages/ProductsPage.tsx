import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Search } from "lucide-react";
import { api, ApiError } from "@/lib/apiClient";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockStatus: string;
}

const emptyForm = { name: "", description: "", price: "", stockStatus: "in_stock" };

const stockLabel = (s: string) => (s === "in_stock" ? "In Stock" : "Out of Stock");
const stockStyle = (s: string) =>
  s === "in_stock"
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-red-50 text-red-700 border border-red-200";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    api.get<ApiResponse<PageResponse<Product>>>("/products/my?page=0&size=200&sort=createdAt,desc")
      .then((r) => { if (!cancelled) setProducts(r.data?.content ?? []); })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load products"))
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description ?? "", price: String(p.price), stockStatus: p.stockStatus });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    setIsSaving(true);
    try {
      const payload = { name: form.name, description: form.description, price: Number(form.price), stockStatus: form.stockStatus.toUpperCase() };
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

  const handleStockToggle = async (p: Product) => {
    const next = p.stockStatus === "in_stock" ? "OUT_OF_STOCK" : "IN_STOCK";
    try {
      const r = await api.patch<ApiResponse<Product>>(`/products/${p.id}/stock?status=${next}`);
      if (r.data) setProducts((prev) => prev.map((x) => (x.id === p.id ? r.data! : x)));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update stock");
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
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="My Products"
        description="Manage your product catalogue"
        actions={
          <Button onClick={openAdd}><Plus size={16} className="mr-1" /> Add Product</Button>
        }
      />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border">
        {filtered.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={40} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No products yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first product to get started.</p>
            <Button className="mt-4" onClick={openAdd}><Plus size={15} className="mr-1" /> Add Product</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left p-3 text-muted-foreground font-semibold">Product Name</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold hidden md:table-cell">Description</th>
                  <th className="text-right p-3 text-muted-foreground font-semibold">Price</th>
                  <th className="text-center p-3 text-muted-foreground font-semibold">Stock Status</th>
                  <th className="text-right p-3 text-muted-foreground font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
                )}
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
                    <td className="p-3 font-medium text-foreground">{p.name}</td>
                    <td className="p-3 text-muted-foreground text-xs hidden md:table-cell max-w-xs truncate">
                      {p.description || "—"}
                    </td>
                    <td className="p-3 text-right font-medium text-foreground">
                      Rs.&nbsp;{p.price.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      {/* Inline stock toggle */}
                      <button
                        onClick={() => void handleStockToggle(p)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize cursor-pointer transition-opacity hover:opacity-70 ${stockStyle(p.stockStatus)}`}
                        title="Click to toggle stock status"
                      >
                        {stockLabel(p.stockStatus)}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(p.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Product Name <span className="text-destructive">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Organic Honey"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short product description"
              />
            </div>
            <div>
              <Label>Price (Rs.)</Label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Stock Status</Label>
              <Select
                value={form.stockStatus}
                onValueChange={(v) => setForm({ ...form, stockStatus: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={() => void handleSave()}
              disabled={isSaving || !form.name.trim()}
            >
              {isSaving ? "Saving…" : editing ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Product</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteId !== null && void handleDelete(deleteId)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
