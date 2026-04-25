import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/apiClient";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/stall-category";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IndianRupee, Calendar, Package, Ticket, RefreshCw, TrendingUp, TrendingDown,
  Users, FileText, Plus, ArrowRight, MapPin, ShoppingBag, ShoppingCart,
  Receipt, Star, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const fade        = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };
const fadeDelay   = (d: number) => ({ ...fade, transition: { duration: 0.35, delay: d } });
const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

interface ApiResponse<T> { success: boolean; message?: string; data?: T; }
interface PageResponse<T> { content: T[]; totalElements: number; }

interface ExhibitorStats {
  totalRevenue: number; totalProfit: number; totalExpenses: number;
  stallBookingCost: number; productCost: number; otherExpenses: number; roiPercent: number;
  productsSold: number; totalQtyRemaining: number; totalProducts: number;
  outOfStockCount: number; lowStockCount: number; bestSellingProduct: string | null;
  reservedStalls: number; upcomingExhibitions: number; exhibitionsAttended: number; pendingRefunds: number;
}

interface AdminStats {
  totalExhibitions: number; upcomingExhibitions: number; ongoingExhibitions: number;
  totalBookings: number; confirmedBookings: number; pendingBookings: number; cancelledBookings: number;
  totalUsers: number; pendingApprovals: number; totalExhibitors: number;
  totalRevenue: number; totalStalls: number; bookedStalls: number; availableStalls: number;
  pendingFacilityRequests: number; openComplaints: number;
}

interface BookingSummary {
  id: number; exhibitorName: string; exhibitionName: string;
  stallCategory: string; status: string; total: number;
}

interface ExhibitionItem {
  id: number; name: string; venue: string;
  startDate: string; endDate: string; status: string;
}

interface ExhibitionReport {
  exhibitionId: number; exhibitionName: string; status: string;
  startDate: string; endDate: string;
  stallCost: number; revenue: number; productCost: number;
  otherExpenses: number; netProfit: number; roiPercent: number;
  productsAdded: number; soldQuantity: number; unsoldQuantity: number;
  bestSellingProduct: string | null;
}

interface MonthlySales { year: number; month: number; monthLabel: string; revenue: number; }

interface AdminExhibitionSummary {
  exhibitionId: number; exhibitionName: string; status: string;
  startDate: string; endDate: string; venue: string;
  totalStalls: number; bookedStalls: number; availableStalls: number;
  confirmedBookings: number; cancelledBookings: number; totalRevenue: number;
}

const fmt    = (n: number) => `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtShort = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`;

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

  const [stats, setStats]       = useState<ExhibitorStats | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [upcoming, setUpcoming] = useState<ExhibitionItem[]>([]);
  const [reports, setReports]   = useState<ExhibitionReport[]>([]);
  const [monthly, setMonthly]   = useState<MonthlySales[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      api.get<ApiResponse<ExhibitorStats>>("/dashboard/exhibitor-stats"),
      api.get<ApiResponse<PageResponse<BookingSummary>>>("/bookings/my?page=0&size=5&sort=createdAt,desc"),
      api.get<ApiResponse<PageResponse<ExhibitionItem>>>("/exhibitions?page=0&size=100&sort=startDate,desc"),
      api.get<ApiResponse<ExhibitionReport[]>>("/dashboard/exhibitor-stats/exhibition-reports"),
      api.get<ApiResponse<MonthlySales[]>>("/dashboard/exhibitor-stats/monthly-sales"),
    ])
      .then(([statsRes, bookingsRes, exRes, reportsRes, monthlyRes]) => {
        if (cancelled) return;
        setStats(statsRes.data ?? null);
        setBookings(bookingsRes.data?.content ?? []);
        const today = new Date().toISOString().slice(0, 10);
        setUpcoming(
          (exRes.data?.content ?? [])
            .filter((ex) => (ex.status === "upcoming" || ex.status === "ongoing") && ex.endDate >= today)
            .slice(0, 5)
        );
        setReports(reportsRes.data ?? []);
        setMonthly(monthlyRes.data ?? []);
      })
      .catch((err) => { if (!cancelled) toast.error(err instanceof ApiError ? err.message : "Failed to load dashboard"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const n = (v: number | undefined) => isLoading ? "…" : String(v ?? 0);
  const r = (v: number | undefined) => isLoading ? "…" : fmt(v ?? 0);

  // Chart data — exhibition revenue bars
  const exhibitionChartData = reports.map((rep) => ({
    name: rep.exhibitionName.length > 14 ? rep.exhibitionName.slice(0, 14) + "…" : rep.exhibitionName,
    Revenue: Math.round(rep.revenue),
    Expenses: Math.round(rep.stallCost + rep.productCost + rep.otherExpenses),
    Profit: Math.round(rep.netProfit),
  }));

  // Expense breakdown pie
  const expensePie = stats && [
    { name: "Stall Cost", value: Math.round(stats.stallBookingCost) },
    { name: "Product Cost", value: Math.round(stats.productCost) },
    { name: "Other", value: Math.round(stats.otherExpenses) },
  ].filter((d) => d.value > 0);

  const profitPositive = (stats?.totalProfit ?? 0) >= 0;

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name}`} description="Exhibitor Business Dashboard" />

      {/* ─── Top stat cards ─────────────────────────────────────────── */}
      <motion.div {...fade} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={r(stats?.totalRevenue)}
          icon={<IndianRupee size={20} />}
          variant="peach"
        />
        <StatCard
          title="Net Profit / Loss"
          value={isLoading ? "…" : `${profitPositive ? "+" : ""}${fmt(stats?.totalProfit ?? 0)}`}
          icon={profitPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          variant={profitPositive ? undefined : "peach"}
        />
        <StatCard
          title="Total Expenses"
          value={r(stats?.totalExpenses)}
          icon={<Receipt size={20} />}
        />
        <StatCard
          title="Products Sold"
          value={n(stats?.productsSold)}
          icon={<ShoppingCart size={20} />}
          variant="peach"
        />
        <StatCard
          title="Other Expenses"
          value={r(stats?.otherExpenses)}
          icon={<Receipt size={20} />}
        />
      </motion.div>

      <motion.div {...fadeDelay(0.05)} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Reserved Stalls"      value={n(stats?.reservedStalls)}      icon={<Package size={20} />} />
        <StatCard title="Upcoming Events"      value={n(stats?.upcomingExhibitions)}  icon={<Calendar size={20} />} variant="peach" />
        <StatCard title="Exhibitions Attended" value={n(stats?.exhibitionsAttended)}  icon={<Ticket size={20} />} />
        <StatCard title="My Products"          value={n(stats?.totalProducts)}        icon={<ShoppingBag size={20} />} variant="peach" />
        <StatCard
          title="Best Seller"
          value={isLoading ? "…" : (stats?.bestSellingProduct ?? "—")}
          icon={<Star size={20} />}
        />
      </motion.div>

      {/* Alerts */}
      {!isLoading && ((stats?.outOfStockCount ?? 0) > 0 || (stats?.lowStockCount ?? 0) > 0 || (stats?.pendingRefunds ?? 0) > 0) && (
        <motion.div {...fadeDelay(0.07)} className="flex flex-wrap gap-3 mb-6">
          {(stats?.outOfStockCount ?? 0) > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertTriangle size={14} /> <strong>{stats!.outOfStockCount}</strong> product{stats!.outOfStockCount !== 1 ? "s" : ""} out of stock
            </div>
          )}
          {(stats?.lowStockCount ?? 0) > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-sm">
              <AlertTriangle size={14} /> <strong>{stats!.lowStockCount}</strong> product{stats!.lowStockCount !== 1 ? "s" : ""} running low
            </div>
          )}
          {(stats?.pendingRefunds ?? 0) > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
              <RefreshCw size={14} /> <strong>{stats!.pendingRefunds}</strong> pending refund{stats!.pendingRefunds !== 1 ? "s" : ""}
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Charts row ──────────────────────────────────────────────── */}
      {monthly.length > 0 && (
        <motion.div {...fadeDelay(0.1)} className="mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Sales Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Exhibition Revenue/Expense Chart */}
        {exhibitionChartData.length > 0 && (
          <motion.div {...fadeDelay(0.12)}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Exhibition-wise P&amp;L</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={exhibitionChartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Expenses" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Profit" fill="#22c55e" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Expense Breakdown Pie */}
        {expensePie && expensePie.length > 0 && (
          <motion.div {...fadeDelay(0.14)}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={expensePie} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {expensePie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* ─── Exhibition Report Table ─────────────────────────────────── */}
      {reports.length > 0 && (
        <motion.div {...fadeDelay(0.16)} className="mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Exhibition-wise Report</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold">Exhibition</th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-semibold">Stall Cost</th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-semibold hidden md:table-cell">Revenue</th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-semibold hidden lg:table-cell">Expenses</th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-semibold">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((rep) => (
                      <tr key={rep.exhibitionId} className="border-b border-border last:border-0 hover:bg-accent/40">
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-foreground">{rep.exhibitionName}</p>
                          <p className="text-xs text-muted-foreground">{rep.startDate} → {rep.endDate}</p>
                        </td>
                        <td className="px-4 py-2.5 text-right text-orange-600 font-medium">{fmt(rep.stallCost)}</td>
                        <td className="px-4 py-2.5 text-right text-blue-600 font-medium hidden md:table-cell">{fmt(rep.revenue)}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground hidden lg:table-cell">{fmt(rep.productCost + rep.otherExpenses)}</td>
                        <td className={`px-4 py-2.5 text-right font-bold ${rep.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(rep.netProfit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── Bottom row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Bookings */}
        <motion.div {...fadeDelay(0.18)}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Stall Bookings</CardTitle>
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
                      {isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground text-xs">Loading…</td></tr>}
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                          <td className="px-4 py-2.5 font-medium">{b.exhibitionName}</td>
                          <td className="px-4 py-2.5">
                            <CategoryBadge category={b.stallCategory} />
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle(b.status)}`}>{b.status}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium">{fmt(b.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions + Upcoming */}
        <motion.div {...fadeDelay(0.2)} className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Book a Stall", icon: <Package size={15} />, path: "/book-stall" },
                  { label: "Record Sale",  icon: <ShoppingCart size={15} />, path: "/sales" },
                  { label: "Log Expense",  icon: <Receipt size={15} />, path: "/expenses" },
                  { label: "My Products",  icon: <ShoppingBag size={15} />, path: "/my-products" },
                  { label: "My Bookings",  icon: <Ticket size={15} />, path: "/my-bookings" },
                  { label: "Complaints",   icon: <FileText size={15} />, path: "/complaints" },
                ].map((a) => (
                  <Button key={a.path} variant="outline" className="justify-start gap-2 text-sm h-9" onClick={() => navigate(a.path)}>
                    {a.icon} {a.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {upcoming.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Upcoming Exhibitions</CardTitle></CardHeader>
              <CardContent className="space-y-2 pt-0">
                {upcoming.map((ex) => (
                  <div key={ex.id} className="flex items-start gap-2 text-sm py-1.5 border-b border-border last:border-0">
                    <MapPin size={13} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">{ex.venue} · {ex.startDate} – {ex.endDate}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// ─── Admin / Organizer Dashboard ────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]             = useState<AdminStats | null>(null);
  const [bookings, setBookings]       = useState<BookingSummary[]>([]);
  const [exSummary, setExSummary]     = useState<AdminExhibitionSummary[]>([]);
  const [isLoading, setIsLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      api.get<ApiResponse<AdminStats>>("/dashboard/stats"),
      api.get<ApiResponse<PageResponse<BookingSummary>>>("/bookings?page=0&size=6&sort=createdAt,desc"),
      api.get<ApiResponse<AdminExhibitionSummary[]>>("/dashboard/exhibition-summary"),
    ])
      .then(([statsRes, bookingsRes, exRes]) => {
        if (cancelled) return;
        setStats(statsRes.data ?? null);
        setBookings(bookingsRes.data?.content ?? []);
        setExSummary(exRes.data ?? []);
      })
      .catch((err) => { if (!cancelled) toast.error(err instanceof ApiError ? err.message : "Failed to load dashboard"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const n = (v: number | undefined) => isLoading ? "…" : String(v ?? 0);
  const r = (v: number | undefined) => isLoading ? "…" : fmt(v ?? 0);

  const bookingPipelineData = stats ? [
    { name: "Confirmed", value: stats.confirmedBookings, fill: "#22c55e" },
    { name: "Pending",   value: stats.pendingBookings,   fill: "#f59e0b" },
    { name: "Cancelled", value: stats.cancelledBookings, fill: "#ef4444" },
  ] : [];

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Platform overview and analytics" />

      <motion.div {...fade} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue"      value={r(stats?.totalRevenue)}      icon={<IndianRupee size={20} />} variant="peach" />
        <StatCard title="Total Exhibitions"  value={n(stats?.totalExhibitions)}  icon={<Calendar size={20} />} />
        <StatCard title="Total Bookings"     value={n(stats?.totalBookings)}     icon={<Ticket size={20} />} variant="peach" />
        <StatCard title="Total Users"        value={n(stats?.totalUsers)}        icon={<Users size={20} />} />
      </motion.div>

      <motion.div {...fadeDelay(0.05)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Upcoming"      value={n(stats?.upcomingExhibitions)} icon={<Calendar size={20} />} />
        <StatCard title="Ongoing"       value={n(stats?.ongoingExhibitions)}  icon={<Calendar size={20} />} variant="peach" />
        <StatCard title="Available Stalls" value={n(stats?.availableStalls)} icon={<Package size={20} />} />
        <StatCard title="Pending Approvals" value={n(stats?.pendingApprovals)} icon={<Users size={20} />} variant="peach" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Booking Pipeline */}
        {bookingPipelineData.length > 0 && (
          <motion.div {...fadeDelay(0.1)}>
            <Card className="h-full">
              <CardHeader className="pb-2"><CardTitle className="text-base">Booking Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={bookingPipelineData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {bookingPipelineData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Bookings */}
        <motion.div {...fadeDelay(0.12)} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Bookings</CardTitle>
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
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold hidden md:table-cell">Status</th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground text-xs">Loading…</td></tr>}
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                        <td className="px-4 py-2.5 font-medium">{b.exhibitorName}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{b.exhibitionName}</td>
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle(b.status)}`}>{b.status}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium">{fmt(b.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Exhibition-wise Report */}
      {exSummary.length > 0 && (
        <motion.div {...fadeDelay(0.16)} className="mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Exhibition-wise Report</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold">Exhibition</th>
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold hidden md:table-cell">Status</th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-semibold">Bookings</th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-semibold hidden lg:table-cell">Stalls (Booked/Total)</th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exSummary.map((ex) => (
                      <tr key={ex.exhibitionId} className="border-b border-border last:border-0 hover:bg-accent/40">
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-foreground">{ex.exhibitionName}</p>
                          <p className="text-xs text-muted-foreground">{ex.venue} · {ex.startDate} → {ex.endDate}</p>
                        </td>
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            ex.status === "upcoming" ? "bg-indigo-100 text-indigo-700" :
                            ex.status === "ongoing"  ? "bg-emerald-100 text-emerald-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>{ex.status}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="font-medium text-green-600">{ex.confirmedBookings}</span>
                          {ex.cancelledBookings > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">({ex.cancelledBookings} cancelled)</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right hidden lg:table-cell">
                          <span className="font-medium">{ex.bookedStalls}</span>
                          <span className="text-muted-foreground">/{ex.totalStalls}</span>
                          <span className="text-xs text-green-600 ml-1">({ex.availableStalls} free)</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-indigo-600">{fmt(ex.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div {...fadeDelay(0.18)}>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Exhibitions",      path: "/exhibitions",        icon: <Calendar size={15} /> },
                { label: "All Bookings",     path: "/bookings",           icon: <Ticket size={15} /> },
                { label: "Stall Management", path: "/stall-management",   icon: <Package size={15} /> },
                { label: "Users",            path: "/users",              icon: <Users size={15} /> },
                { label: "Invoices",         path: "/invoices",           icon: <FileText size={15} /> },
                { label: "Facilities",       path: "/facilities",         icon: <Plus size={15} /> },
              ].map((a) => (
                <Button key={a.path} variant="outline" className="gap-2 text-sm" onClick={() => navigate(a.path)}>
                  {a.icon} {a.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// ─── Root ──────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "exhibitor" ? <ExhibitorDashboard /> : <AdminDashboard />;
};

export default DashboardPage;
