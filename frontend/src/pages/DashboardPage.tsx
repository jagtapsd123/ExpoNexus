import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/apiClient";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge, CategoryLegend } from "@/components/ui/stall-category";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IndianRupee, Calendar, Package, Ticket, RefreshCw,
  Users, FileText, Plus, ArrowRight, MapPin, Clock, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };
const fadeDelay = (d: number) => ({ ...fade, transition: { duration: 0.35, delay: d } });

interface ApiResponse<T> { success: boolean; message?: string; data?: T; }
interface PageResponse<T> { content: T[]; totalElements: number; }

interface AdminStats {
  totalExhibitions: number; upcomingExhibitions: number; ongoingExhibitions: number;
  totalBookings: number; confirmedBookings: number;
  totalUsers: number; pendingApprovals: number;
  totalRevenue: number; totalStalls: number; bookedStalls: number;
  pendingFacilityRequests: number; openComplaints: number;
  inquiries: number; payments: number; activeExhibitors: number;
}

interface ExhibitorStats {
  totalSales: number;
  reservedStalls: number;
  upcomingExhibitions: number;
  exhibitionsAttended: number;
  pendingRefunds: number;
  totalProducts: number;
}

interface BookingSummary {
  id: number; exhibitorName: string; exhibitionName: string;
  stallCategory: string; status: string; total: number;
  startDate?: string; endDate?: string; stallNumber?: string;
}

interface ExhibitionItem {
  id: number; name: string; venue: string;
  startDate: string; endDate: string; time?: string; status: string;
}

const toCategory = (c: string): "Prime" | "Super" | "General" => {
  if (c.toLowerCase() === "prime") return "Prime";
  if (c.toLowerCase() === "super") return "Super";
  return "General";
};

const statusStyle = (s: string) => {
  switch (s) {
    case "confirmed": return "bg-green-50 text-green-700 border border-green-200";
    case "pending":   return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    case "cancelled": return "bg-red-50 text-red-700 border border-red-200";
    default:          return "bg-muted text-muted-foreground";
  }
};

// ─── Exhibitor Dashboard ────────────────────────────────────────────────────

const ExhibitorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ExhibitorStats | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [upcoming, setUpcoming] = useState<ExhibitionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      api.get<ApiResponse<ExhibitorStats>>("/dashboard/exhibitor-stats"),
      api.get<ApiResponse<PageResponse<BookingSummary>>>("/bookings/my?page=0&size=5&sort=createdAt,desc"),
      api.get<ApiResponse<PageResponse<ExhibitionItem>>>("/exhibitions?page=0&size=100&sort=startDate,desc"),
    ])
      .then(([statsRes, bookingsRes, exRes]) => {
        if (cancelled) return;
        setStats(statsRes.data ?? null);
        setBookings(bookingsRes.data?.content ?? []);
        const today = new Date().toISOString().slice(0, 10);
        setUpcoming(
          (exRes.data?.content ?? [])
            .filter((ex) => ex.status === "upcoming" || ex.status === "ongoing")
            .filter((ex) => ex.endDate >= today)
            .slice(0, 5)
        );
      })
      .catch((err) => { if (!cancelled) toast.error(err instanceof ApiError ? err.message : "Failed to load dashboard"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const val = (v: number | undefined, fmt?: (n: number) => string) =>
    isLoading ? "…" : fmt ? fmt(v ?? 0) : String(v ?? 0);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name}`}
        description="Exhibitor Dashboard"
      />

      {/* Stat cards */}
      <motion.div {...fade} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Sales"
          value={isLoading ? "…" : `Rs. ${(stats?.totalSales ?? 0).toLocaleString()}`}
          icon={<IndianRupee size={20} />}
          variant="peach"
        />
        <StatCard
          title="Reserved Stalls"
          value={val(stats?.reservedStalls)}
          icon={<Package size={20} />}
        />
        <StatCard
          title="Upcoming Events"
          value={val(stats?.upcomingExhibitions)}
          icon={<Calendar size={20} />}
          variant="peach"
        />
        <StatCard
          title="Exhibitions Attended"
          value={val(stats?.exhibitionsAttended)}
          icon={<Ticket size={20} />}
        />
        <StatCard
          title="My Products"
          value={val(stats?.totalProducts)}
          icon={<ShoppingBag size={20} />}
          variant="peach"
        />
      </motion.div>

      {/* Pending refunds banner */}
      {!isLoading && (stats?.pendingRefunds ?? 0) > 0 && (
        <motion.div {...fadeDelay(0.05)}
          className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 flex items-center gap-2">
          <RefreshCw size={15} />
          You have <span className="font-semibold">{stats!.pendingRefunds}</span> pending refund request{stats!.pendingRefunds !== 1 ? "s" : ""}.
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Bookings */}
        <motion.div {...fadeDelay(0.1)}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Bookings</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/my-bookings")}>
                View all <ArrowRight size={13} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {bookings.length === 0 && !isLoading ? (
                <p className="px-6 pb-6 text-sm text-muted-foreground">No bookings yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold">Exhibition</th>
                        <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold">Category</th>
                        <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold">Status</th>
                        <th className="text-right px-4 py-2 text-xs text-muted-foreground font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading && (
                        <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground text-xs">Loading…</td></tr>
                      )}
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
                          <td className="px-4 py-2.5 text-foreground truncate max-w-[140px]">{b.exhibitionName}</td>
                          <td className="px-4 py-2.5"><CategoryBadge category={toCategory(b.stallCategory)} /></td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle(b.status)}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium text-foreground">Rs. {b.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div {...fadeDelay(0.15)}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Upcoming Exhibitions</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/book-stall")}>
                Book Stall <ArrowRight size={13} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {upcoming.length === 0 && !isLoading ? (
                <p className="px-6 pb-6 text-sm text-muted-foreground">No upcoming exhibitions.</p>
              ) : (
                <ScrollArea className="max-h-72">
                  {isLoading
                    ? <p className="px-6 py-6 text-sm text-muted-foreground">Loading…</p>
                    : upcoming.map((ex) => (
                      <div key={ex.id} className="flex items-start gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${ex.status === "ongoing" ? "bg-stall-general" : "bg-stall-super"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{ex.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin size={11} /> {ex.venue}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(ex.startDate).toLocaleDateString("en-IN")} – {new Date(ex.endDate).toLocaleDateString("en-IN")}
                            {ex.time ? ` · ${ex.time}` : ""}
                          </p>
                        </div>
                        <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-medium capitalize ${
                          ex.status === "ongoing" ? "bg-stall-general-bg text-stall-general" : "surface-peach text-foreground"
                        }`}>{ex.status}</span>
                      </div>
                    ))
                  }
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div {...fadeDelay(0.2)}>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Book a Stall", icon: Package, path: "/book-stall" },
            { label: "My Bookings", icon: Ticket, path: "/my-bookings" },
            { label: "My Products", icon: ShoppingBag, path: "/my-products" },
            { label: "Request Facility", icon: Plus, path: "/facilities" },
          ].map((qa) => (
            <button
              key={qa.label}
              onClick={() => navigate(qa.path)}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:shadow-md hover:-translate-y-0.5 transition-all bg-card"
            >
              <qa.icon size={22} className="text-primary" />
              <span className="text-xs font-medium text-foreground">{qa.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Admin / Organizer Dashboard ────────────────────────────────────────────

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [bookingTotal, setBookingTotal] = useState(0);
  const [exhibitionTotal, setExhibitionTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");

    Promise.all([
      api.get<ApiResponse<PageResponse<unknown>>>("/exhibitions?page=0&size=1"),
      api.get<ApiResponse<PageResponse<BookingSummary>>>("/bookings?page=0&size=5&sort=createdAt,desc"),
      api.get<ApiResponse<AdminStats>>("/dashboard/stats"),
    ])
      .then(([exRes, bookingsRes, statsRes]) => {
        if (cancelled) return;
        setExhibitionTotal(exRes.data?.totalElements ?? 0);
        setBookings(bookingsRes.data?.content ?? []);
        setBookingTotal(bookingsRes.data?.totalElements ?? 0);
        setStats(statsRes.data ?? null);
      })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load dashboard"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const isAdmin = user?.role === "admin";
  const total = isLoading ? "…" : String(stats?.totalBookings ?? bookingTotal);
  const revenue = isLoading ? "…" : `Rs. ${(stats?.totalRevenue ?? 0).toLocaleString()}`;
  const booked = isLoading ? "…" : String(stats?.bookedStalls ?? 0);
  const pending = isLoading ? "…" : String(stats?.pendingApprovals ?? 0);

  const pipeline = [
    { label: "Exhibitions", value: stats?.totalExhibitions ?? exhibitionTotal },
    { label: "Bookings", value: stats?.totalBookings ?? bookingTotal },
    { label: "Confirmed", value: stats?.confirmedBookings ?? 0 },
    { label: "Revenue", value: `Rs.${((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}k` },
    { label: "Exhibitors", value: stats?.activeExhibitors ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name}`}
        description={`${(user?.role ?? "").charAt(0).toUpperCase() + (user?.role ?? "").slice(1)} Dashboard`}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <motion.div {...fade} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Exhibitions" value={isLoading ? "…" : exhibitionTotal} icon={<Calendar size={20} />} />
        <StatCard title="Total Bookings" value={total} icon={<Ticket size={20} />} variant="peach" />
        <StatCard title="Stalls Booked" value={booked} icon={<Package size={20} />} />
        <StatCard title="Pending Approvals" value={pending} icon={<Users size={20} />} variant="peach" />
      </motion.div>

      {isAdmin && (
        <>
          <motion.div {...fadeDelay(0.05)}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard title="Total Revenue" value={revenue} icon={<IndianRupee size={20} />} variant="peach" />
              <StatCard title="Total Users" value={isLoading ? "…" : String(stats?.totalUsers ?? 0)} icon={<Users size={20} />} />
              <StatCard title="Pending Facilities" value={isLoading ? "…" : String(stats?.pendingFacilityRequests ?? 0)} icon={<Package size={20} />} />
              <StatCard title="Open Complaints" value={isLoading ? "…" : String(stats?.openComplaints ?? 0)} icon={<FileText size={20} />} variant="peach" />
            </div>
          </motion.div>

          {/* Pipeline */}
          <motion.div {...fadeDelay(0.1)}>
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Booking Pipeline</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between overflow-x-auto gap-2">
                  {pipeline.map((stage, i) => (
                    <div key={stage.label} className="flex items-center shrink-0">
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                          <span className="text-base font-bold text-primary">{isLoading ? "…" : stage.value}</span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{stage.label}</p>
                      </div>
                      {i < pipeline.length - 1 && <ArrowRight size={15} className="text-muted-foreground mx-2 shrink-0" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Bookings */}
        <motion.div {...fadeDelay(0.15)}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                Recent Bookings <CategoryLegend />
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/bookings")}>
                View all <ArrowRight size={13} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold">Exhibitor</th>
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold">Exhibition</th>
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold">Category</th>
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold">Status</th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isLoading && bookings.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">No bookings found.</td></tr>
                    )}
                    {isLoading && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">Loading…</td></tr>
                    )}
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
                        <td className="px-4 py-2.5 text-foreground">{b.exhibitorName}</td>
                        <td className="px-4 py-2.5 text-foreground">{b.exhibitionName}</td>
                        <td className="px-4 py-2.5"><CategoryBadge category={toCategory(b.stallCategory)} /></td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle(b.status)}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-foreground">Rs. {b.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div {...fadeDelay(0.2)}>
          <Card>
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Add Exhibition", icon: Calendar, path: "/exhibitions" },
                  { label: "Manage Users", icon: Users, path: "/users" },
                  { label: "View Bookings", icon: Ticket, path: "/bookings" },
                  { label: "Invoices", icon: FileText, path: "/invoices" },
                ].map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => navigate(qa.path)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:shadow-md hover:-translate-y-0.5 transition-all bg-card"
                  >
                    <qa.icon size={22} className="text-primary" />
                    <span className="text-xs font-medium text-foreground">{qa.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

// ─── Root ────────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "exhibitor" ? <ExhibitorDashboard /> : <AdminDashboard />;
};

export default DashboardPage;
