import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/ui/stat-card";
import { CategoryBadge } from "@/components/ui/stall-category";
import { toast } from "sonner";
import { Plus, LayoutGrid, List, MoreVertical, Package, CheckCircle, XCircle, IndianRupee } from "lucide-react";
import { StallCategoryIcon } from "@/components/ui/stall-category-icon";
import { motion } from "framer-motion";

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

interface Stall {
  id: string; number: string; category: "Prime" | "Super" | "General"; size: string; pricePerDay: number; description: string; active: boolean; status: "available" | "booked" | "unavailable"; bookedBy?: string; bookedDates?: string;
}

const initialStalls: Stall[] = [
  { id: "sm1", number: "S001", category: "Prime", size: "10x10 ft", pricePerDay: 15000, description: "Corner stall with premium visibility", active: true, status: "booked", bookedBy: "Green Farms Ltd", bookedDates: "2025-04-10 to 2025-04-15" },
  { id: "sm2", number: "S002", category: "Prime", size: "10x10 ft", pricePerDay: 15000, description: "Near entrance", active: true, status: "available" },
  { id: "sm3", number: "S003", category: "Super", size: "8x8 ft", pricePerDay: 10000, description: "Central location", active: true, status: "booked", bookedBy: "Organic Seeds Co", bookedDates: "2025-04-10 to 2025-04-15" },
  { id: "sm4", number: "S004", category: "Super", size: "8x8 ft", pricePerDay: 10000, description: "", active: true, status: "available" },
  { id: "sm5", number: "S005", category: "General", size: "6x6 ft", pricePerDay: 5000, description: "Standard stall", active: true, status: "available" },
  { id: "sm6", number: "S006", category: "General", size: "6x6 ft", pricePerDay: 5000, description: "", active: false, status: "unavailable" },
];

const StallManagementPage = () => {
  const { user } = useAuth();
  const [stalls, setStalls] = useState<Stall[]>(initialStalls);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [editStall, setEditStall] = useState<Stall | null>(null);
  const [form, setForm] = useState({ number: "", category: "General" as Stall["category"], size: "", pricePerDay: "", description: "", active: true });

  const isAdmin = user?.role === "admin";
  const available = stalls.filter(s => s.status === "available").length;
  const booked = stalls.filter(s => s.status === "booked").length;
  const revenue = stalls.filter(s => s.status === "booked").reduce((sum, s) => sum + s.pricePerDay * 5, 0); // mock 5 days

  const handleAdd = () => {
    const newStall: Stall = { id: `sm${Date.now()}`, number: form.number, category: form.category, size: form.size, pricePerDay: +form.pricePerDay, description: form.description, active: form.active, status: form.active ? "available" : "unavailable" };
    setStalls([...stalls, newStall]);
    setAddOpen(false);
    setForm({ number: "", category: "General", size: "", pricePerDay: "", description: "", active: true });
    toast.success("Stall added successfully");
  };

  const handleDelete = (id: string) => {
    setStalls(stalls.filter(s => s.id !== id));
    toast.success("Stall deleted");
  };

  const handleMarkUnavailable = (id: string) => {
    setStalls(stalls.map(s => s.id === id ? { ...s, status: "unavailable", active: false } : s));
    toast.success("Stall marked as unavailable");
  };

  const stallForm = (
    <div className="space-y-4">
      <div><Label>Stall Number</Label><Input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="S007" /></div>
      <div><Label>Category</Label>
        <Select value={form.category} onValueChange={(v: Stall["category"]) => setForm({ ...form, category: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="Prime">Prime</SelectItem><SelectItem value="Super">Super</SelectItem><SelectItem value="General">General</SelectItem></SelectContent>
        </Select>
      </div>
      <div><Label>Size</Label><Input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="10x10 ft" /></div>
      <div><Label>Price per Day (₹)</Label><Input type="number" value={form.pricePerDay} onChange={e => setForm({ ...form, pricePerDay: e.target.value })} /></div>
      <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} /><Label>Active</Label></div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Stall Management" description="Manage stall inventory and assignments"
        actions={<Button onClick={() => setAddOpen(true)}><Plus size={16} className="mr-1" /> Add Stall</Button>}
      />

      <motion.div {...fadeIn}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Stalls" value={stalls.length} icon={<Package size={20} />} />
          <StatCard title="Available" value={available} icon={<CheckCircle size={20} />} />
          <StatCard title="Booked" value={booked} icon={<XCircle size={20} />} variant="peach" />
          <StatCard title="Revenue" value={`₹${revenue.toLocaleString()}`} icon={<IndianRupee size={20} />} />
        </div>

        <div className="flex justify-end mb-4 gap-1">
          <Button variant={view === "grid" ? "default" : "outline"} size="icon" onClick={() => setView("grid")}><LayoutGrid size={16} /></Button>
          <Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")}><List size={16} /></Button>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stalls.map(stall => (
              <Card key={stall.id} className={`relative ${!stall.active ? "opacity-60" : ""}`}>
                <div className="absolute top-3 right-3 z-10">
                  <StallCategoryIcon stallId={stall.id} />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{stall.number}</span>
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={stall.category} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical size={16} /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.success("Edit coming soon")}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Bookings view coming soon")}>View Bookings</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkUnavailable(stall.id)}>Mark Unavailable</DropdownMenuItem>
                          {isAdmin && <DropdownMenuItem onClick={() => handleDelete(stall.id)} className="text-destructive">Delete</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{stall.size}</p>
                  <p className="text-lg font-bold text-foreground mt-1">₹{stall.pricePerDay.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/day</span></p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded mt-2 inline-block ${
                    stall.status === "available" ? "bg-stall-general-bg text-stall-general" :
                    stall.status === "booked" ? "bg-stall-prime-bg text-stall-prime" : "bg-muted text-muted-foreground"
                  }`}>{stall.status.charAt(0).toUpperCase() + stall.status.slice(1)}</span>
                  {stall.bookedBy && <p className="text-xs text-muted-foreground mt-2">Booked by: {stall.bookedBy}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Stall</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Size</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Price/Day</th>
                <th className="text-center p-3 text-muted-foreground font-medium">Status</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {stalls.map(s => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                    <td className="p-3 font-medium text-foreground">{s.number}</td>
                    <td className="p-3"><CategoryBadge category={s.category} /></td>
                    <td className="p-3 text-muted-foreground">{s.size}</td>
                    <td className="p-3 text-right text-foreground">₹{s.pricePerDay.toLocaleString()}</td>
                    <td className="p-3 text-center"><span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      s.status === "available" ? "bg-stall-general-bg text-stall-general" :
                      s.status === "booked" ? "bg-stall-prime-bg text-stall-prime" : "bg-muted text-muted-foreground"
                    }`}>{s.status}</span></td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical size={16} /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.success("Edit coming soon")}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkUnavailable(s.id)}>Mark Unavailable</DropdownMenuItem>
                          {isAdmin && <DropdownMenuItem onClick={() => handleDelete(s.id)} className="text-destructive">Delete</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Stall Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Stall</DialogTitle></DialogHeader>
          {stallForm}
          <DialogFooter><Button onClick={handleAdd} className="w-full">Add Stall</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StallManagementPage;
