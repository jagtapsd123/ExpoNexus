import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/apiClient";
import { toast } from "sonner";
import { Search, Eye, Download, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

const statusColors: Record<string, string> = {
  confirmed: "bg-stall-general-bg text-stall-general",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-blue-100 text-blue-700",
};

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface BookingItem {
  id: number;
  bookingNumber: string;
  exhibitionName: string;
  stallNumber: string;
  stallCategory: string;
  startDate: string;
  endDate: string;
  total: number;
  status: string;
  paymentStatus: string;
  businessName?: string;
  productCategory?: string;
  specialRequirements?: string;
  days: number;
  pricePerDay: number;
}

const formatDateRange = (startDate: string, endDate: string) =>
  `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;

const getBookingType = (booking: BookingItem): "upcoming" | "past" => {
  const end = new Date(booking.endDate);
  const now = new Date();
  return end >= now ? "upcoming" : "past";
};

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [viewBooking, setViewBooking] = useState<BookingItem | null>(null);
  const [cancelBooking, setCancelBooking] = useState<BookingItem | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingItem[]>([]);
  const [pastBookings, setPastBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [upcomingResponse, pastResponse] = await Promise.all([
          api.get<ApiResponse<BookingItem[]>>("/bookings/my/upcoming"),
          api.get<ApiResponse<BookingItem[]>>("/bookings/my/past"),
        ]);

        if (cancelled) return;

        setUpcomingBookings(upcomingResponse.data ?? []);
        setPastBookings(pastResponse.data ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load your bookings");
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

  const filterItems = (items: BookingItem[]) =>
    items.filter((booking) =>
      booking.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      booking.exhibitionName.toLowerCase().includes(search.toLowerCase())
    );

  const filteredUpcoming = useMemo(() => filterItems(upcomingBookings), [search, upcomingBookings]);
  const filteredPast = useMemo(() => filterItems(pastBookings), [search, pastBookings]);

  const handleCancel = async () => {
    if (!cancelBooking) return;

    try {
      const response = await api.post<ApiResponse<BookingItem>>(`/bookings/${cancelBooking.id}/cancel`);
      const updated = response.data ?? { ...cancelBooking, status: "cancelled" };

      setUpcomingBookings((prev) =>
        prev.map((booking) => (booking.id === cancelBooking.id ? { ...booking, ...updated } : booking))
      );
      setCancelBooking(null);
      toast.success("Booking cancelled successfully");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to cancel booking");
    }
  };

  const renderTable = (items: BookingItem[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-3 text-muted-foreground font-medium">Booking ID</th>
            <th className="text-left p-3 text-muted-foreground font-medium">Event</th>
            <th className="text-left p-3 text-muted-foreground font-medium hidden sm:table-cell">Stall</th>
            <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Dates</th>
            <th className="text-right p-3 text-muted-foreground font-medium">Amount</th>
            <th className="text-center p-3 text-muted-foreground font-medium">Status</th>
            <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {!isLoading && items.length === 0 && (
            <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No bookings found</td></tr>
          )}
          {items.map((booking) => (
            <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-accent/50">
              <td className="p-3 font-mono text-foreground">{booking.bookingNumber}</td>
              <td className="p-3 text-foreground">{booking.exhibitionName}</td>
              <td className="p-3 text-foreground hidden sm:table-cell">{booking.stallNumber} ({booking.stallCategory})</td>
              <td className="p-3 text-muted-foreground hidden md:table-cell">{formatDateRange(booking.startDate, booking.endDate)}</td>
              <td className="p-3 text-right font-medium text-foreground">Rs. {booking.total.toLocaleString()}</td>
              <td className="p-3 text-center">
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[booking.status] || ""}`}>{booking.status}</span>
              </td>
              <td className="p-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setViewBooking(booking)}><Eye size={16} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/invoice/${booking.id}`)}><Download size={16} /></Button>
                  {getBookingType(booking) === "upcoming" && booking.status !== "cancelled" && (
                    <Button variant="ghost" size="icon" onClick={() => setCancelBooking(booking)}><X size={16} className="text-destructive" /></Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <PageHeader title="My Bookings" description="View and manage your stall bookings" />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <motion.div {...fadeIn}>
        <div className="mb-4 max-w-sm relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <div className="bg-card rounded-lg border border-border">{renderTable(filteredUpcoming)}</div>
          </TabsContent>
          <TabsContent value="past">
            <div className="bg-card rounded-lg border border-border">{renderTable(filteredPast)}</div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Sheet open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Booking Details</SheetTitle></SheetHeader>
          {viewBooking && (
            <div className="mt-6 space-y-4 text-sm">
              {[
                ["Booking ID", viewBooking.bookingNumber],
                ["Event", viewBooking.exhibitionName],
                ["Stall", `${viewBooking.stallNumber} (${viewBooking.stallCategory})`],
                ["Dates", formatDateRange(viewBooking.startDate, viewBooking.endDate)],
                ["Days", String(viewBooking.days)],
                ["Amount", `Rs. ${viewBooking.total.toLocaleString()}`],
                ["Payment", viewBooking.paymentStatus],
                ["Status", viewBooking.status],
                ["Business", viewBooking.businessName || "-"],
                ["Product", viewBooking.productCategory || "-"],
                ["Requirements", viewBooking.specialRequirements || "-"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-border pb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium text-right">{value}</span>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!cancelBooking} onOpenChange={() => setCancelBooking(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Booking</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel booking{" "}
            <span className="font-mono font-semibold text-foreground">{cancelBooking?.bookingNumber}</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelBooking(null)}>Keep Booking</Button>
            <Button variant="destructive" onClick={() => void handleCancel()}>Cancel Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookingsPage;
