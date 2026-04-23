import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/apiClient";
import { CategoryBadge, CategoryLegend } from "@/components/ui/stall-category";
import { Search } from "lucide-react";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PageResponse<T> {
  content: T[];
}

interface BookingItem {
  id: number;
  bookingNumber: string;
  memberId?: string;
  eventId?: string;
  exhibitorName: string;
  exhibitionName: string;
  stallCategory: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
}

const toCategory = (category: string): "Prime" | "Super" | "General" => {
  const normalized = category.toLowerCase();
  if (normalized === "prime") return "Prime";
  if (normalized === "super") return "Super";
  return "General";
};

const statusStyle = (status: string) => {
  switch (status) {
    case "confirmed":  return "bg-green-50 text-green-700 border border-green-200";
    case "pending":    return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    case "cancelled":  return "bg-red-50 text-red-700 border border-red-200";
    case "completed":  return "bg-blue-50 text-blue-700 border border-blue-200";
    default:           return "bg-muted text-muted-foreground";
  }
};

const BookingsPage = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get<ApiResponse<PageResponse<BookingItem>>>(
          "/bookings?page=0&size=200&sort=createdAt,desc"
        );
        if (!cancelled) setBookings(response.data?.content ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load bookings");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadBookings();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.bookingNumber.toLowerCase().includes(q) ||
        b.exhibitorName.toLowerCase().includes(q) ||
        b.exhibitionName.toLowerCase().includes(q) ||
        (b.memberId ?? "").toLowerCase().includes(q) ||
        (b.eventId ?? "").toLowerCase().includes(q)
    );
  }, [bookings, search]);

  return (
    <div>
      <PageHeader title="Bookings" description="View and manage all stall bookings" />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <CategoryLegend className="mb-4" />

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by booking ID, member, event ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-3 text-muted-foreground font-semibold">Booking #</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Exhibitor</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Exhibition</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Category</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Status</th>
                <th className="text-right p-3 text-muted-foreground font-semibold">Amount</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">Loading…</td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">No bookings found.</td>
                </tr>
              )}
              {filtered.map((booking) => (
                <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
                  <td className="p-3 font-mono text-xs text-foreground">{booking.bookingNumber}</td>
                  <td className="p-3 text-foreground">{booking.exhibitorName}</td>
                  <td className="p-3 text-foreground">{booking.exhibitionName}</td>
                  <td className="p-3"><CategoryBadge category={toCategory(booking.stallCategory)} /></td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium text-foreground">
                    Rs. {booking.total.toLocaleString()}
                  </td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap">
                    {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length > 0 && (
          <div className="px-3 py-2 border-t border-border text-xs text-muted-foreground">
            {search ? `${filtered.length} of ${bookings.length} bookings` : `${bookings.length} bookings`}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
