import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { api, ApiError } from "@/lib/apiClient";
import { CategoryBadge, CategoryLegend } from "@/components/ui/stall-category";

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
  exhibitorName: string;
  exhibitionName: string;
  stallCategory: string;
  status: string;
  total: number;
  createdAt: string;
}

const toCategory = (category: string): "Prime" | "Super" | "General" => {
  const normalized = category.toLowerCase();
  if (normalized === "prime") return "Prime";
  if (normalized === "super") return "Super";
  return "General";
};

const BookingsPage = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get<ApiResponse<PageResponse<BookingItem>>>("/bookings?page=0&size=100&sort=createdAt,desc");
        if (!cancelled) {
          setBookings(response.data?.content ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load bookings");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Bookings" description="View and manage all stall bookings" />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <CategoryLegend className="mb-4" />

      <div className="bg-card rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Booking ID</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Exhibitor</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Exhibition</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Amount</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">No bookings found.</td>
                </tr>
              )}
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="p-3 text-foreground font-mono text-xs">{booking.bookingNumber}</td>
                  <td className="p-3 text-foreground">{booking.exhibitorName}</td>
                  <td className="p-3 text-foreground">{booking.exhibitionName}</td>
                  <td className="p-3"><CategoryBadge category={toCategory(booking.stallCategory)} /></td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${booking.status === "confirmed" ? "bg-stall-general-bg text-stall-general" : booking.status === "pending" ? "bg-stall-super-bg text-stall-super" : "bg-destructive/10 text-destructive"}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-3 text-right text-foreground font-medium">Rs. {booking.total.toLocaleString()}</td>
                  <td className="p-3 text-muted-foreground">{new Date(booking.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
