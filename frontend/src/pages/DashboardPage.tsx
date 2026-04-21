import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/apiClient";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { Calendar, Ticket, Package, MessageSquare, Plus, FileText, Users, ArrowRight } from "lucide-react";
import { CategoryBadge, CategoryLegend } from "@/components/ui/stall-category";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

interface DashboardStats {
  totalExhibitions: number;
  totalBookings: number;
  bookedStalls: number;
  totalStalls: number;
  pendingFacilityRequests: number;
  inquiries: number;
  payments: number;
  activeExhibitors: number;
  totalUsers: number;
}

interface BookingSummary {
  id: number;
  exhibitorName: string;
  exhibitionName: string;
  stallCategory: string;
  status: string;
  total: number;
}

const toCategory = (category: string): "Prime" | "Super" | "General" => {
  const normalized = category.toLowerCase();
  if (normalized === "prime") return "Prime";
  if (normalized === "super") return "Super";
  return "General";
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [bookingTotal, setBookingTotal] = useState(0);
  const [exhibitionTotal, setExhibitionTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const exhibitionPromise = api.get<ApiResponse<PageResponse<unknown>>>("/exhibitions?page=0&size=1");
        const bookingEndpoint = user.role === "exhibitor"
          ? "/bookings/my?page=0&size=5&sort=createdAt,desc"
          : "/bookings?page=0&size=5&sort=createdAt,desc";
        const bookingPromise = api.get<ApiResponse<PageResponse<BookingSummary>>>(bookingEndpoint);
        const statsPromise = user.role === "exhibitor"
          ? Promise.resolve(null)
          : api.get<ApiResponse<DashboardStats>>("/dashboard/stats");

        const [exhibitionResponse, bookingResponse, statsResponse] = await Promise.all([
          exhibitionPromise,
          bookingPromise,
          statsPromise,
        ]);

        if (cancelled) return;

        setExhibitionTotal(exhibitionResponse.data?.totalElements ?? 0);
        setBookings(bookingResponse.data?.content ?? []);
        setBookingTotal(bookingResponse.data?.totalElements ?? 0);
        setStats(statsResponse?.data ?? null);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : "Failed to load dashboard data";
        setError(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isPrivileged = user.role === "admin" || user.role === "organizer";
  const totalBooked = stats?.bookedStalls ?? bookings.filter((booking) => booking.status === "confirmed").length;
  const totalStalls = stats?.totalStalls ?? 0;
  const pendingRequests = stats?.pendingFacilityRequests ?? bookings.filter((booking) => booking.status === "pending").length;

  const pipelineStages = [
    { label: "Stall Listings", value: stats?.totalStalls ?? 0 },
    { label: "Inquiries", value: stats?.inquiries ?? 0 },
    { label: "Bookings", value: stats?.totalBookings ?? bookingTotal },
    { label: "Payments", value: stats?.payments ?? 0 },
    { label: "Active Exhibitors", value: stats?.activeExhibitors ?? 0 },
  ];

  const activities = [
    { type: "booking" as const, message: `${bookingTotal} booking records are now synced from the backend`, time: "Live data" },
    { type: "registration" as const, message: `${exhibitionTotal} exhibitions loaded from the backend`, time: "Live data" },
    { type: "payment" as const, message: `${totalBooked} booked stalls reflected in the dashboard`, time: "Live data" },
  ];

  const actDotColor: Record<string, string> = { payment: "bg-stall-general", booking: "bg-blue-500", registration: "bg-amber-500" };

  const quickActions = [
    { label: "Add Stall", icon: Plus, action: () => navigate("/stall-management") },
    { label: "New Event", icon: Calendar, action: () => navigate("/exhibitions") },
    { label: "Generate Report", icon: FileText, action: () => toast("Coming Soon", { description: "Report generation will be available in a future update." }) },
    { label: "Manage Users", icon: Users, action: () => navigate("/users") },
  ];

  return (
    <div>
      <PageHeader title={`Welcome, ${user.name}`} description={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`} />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Exhibitions" value={isLoading ? "..." : exhibitionTotal} icon={<Calendar size={20} />} />
        <StatCard title="Total Bookings" value={isLoading ? "..." : (stats?.totalBookings ?? bookingTotal)} icon={<Ticket size={20} />} variant="peach" />
        <StatCard title="Stalls Booked" value={isLoading ? "..." : `${totalBooked}/${totalStalls || totalBooked || 0}`} icon={<Package size={20} />} />
        <StatCard title="Pending Requests" value={isLoading ? "..." : pendingRequests} icon={<MessageSquare size={20} />} variant="peach" />
      </div>

      {isAdmin && isPrivileged && (
        <>
          <motion.div {...fadeIn}>
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Booking Pipeline</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between overflow-x-auto gap-2">
                  {pipelineStages.map((stage, i) => (
                    <div key={stage.label} className="flex items-center shrink-0">
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                          <span className="text-lg font-bold text-primary">{isLoading ? "..." : stage.value}</span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{stage.label}</p>
                      </div>
                      {i < pipelineStages.length - 1 && <ArrowRight size={16} className="text-muted-foreground mx-2 shrink-0" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }}>
              <Card>
                <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-64">
                    {activities.map((a, i) => (
                      <div key={i} className="flex gap-3 px-6 py-3 border-b border-border last:border-0">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${actDotColor[a.type]}`} />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground">{a.message}</p>
                          <p className="text-xs text-muted-foreground">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.2 }}>
              <Card>
                <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((qa) => (
                      <button
                        key={qa.label}
                        onClick={qa.action}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:shadow-md hover:-translate-y-0.5 transition-all bg-card"
                      >
                        <qa.icon size={24} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">{qa.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}

      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
          <CategoryLegend />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Exhibitor</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Exhibition</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-muted-foreground" colSpan={5}>No bookings found.</td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="p-3 text-foreground">{b.exhibitorName}</td>
                  <td className="p-3 text-foreground">{b.exhibitionName}</td>
                  <td className="p-3"><CategoryBadge category={toCategory(b.stallCategory)} /></td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${b.status === "confirmed" ? "bg-stall-general-bg text-stall-general" : "bg-stall-super-bg text-stall-super"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right text-foreground font-medium">Rs. {b.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
