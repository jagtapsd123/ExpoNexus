import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/apiClient";
import { StallCanvas } from "@/components/ui/stall-canvas";
import type { StallMarker } from "@/data/stallLayouts";
import { CategoryBadge } from "@/components/ui/stall-category";
import { StallCategoryIcon } from "@/components/ui/stall-category-icon";
import { toast } from "sonner";
import {
  Check,
  CreditCard,
  Smartphone,
  Globe,
  Loader2,
  Download,
  Info,
  Search,
  Eye,
  CalendarDays,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { downloadInvoicePdf } from "@/lib/generateInvoicePdf";
import { motion, AnimatePresence } from "framer-motion";

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

const steps = ["Select Stall", "Booking Details", "Payment"];

const PAGE_SIZE = 6;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PageResponse<T> {
  content: T[];
}

interface ExhibitionItem {
  id: number;
  name: string;
  venue: string;
  status: "upcoming" | "ongoing" | "completed";
  startDate?: string;
  endDate?: string;
  description?: string;
  totalStalls?: number;
  time?: string;
}

interface LayoutResponse {
  mode: string;
  layoutImageUrl?: string;
  markers: Array<{
    number: string;
    category: string;
    price: number;
    status: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
}

interface StallItem {
  id: number;
  number: string;
  category: string;
  price: number;
  status: string;
}

interface BookingResponse {
  id: number;
  bookingNumber: string;
  total: number;
  stallNumber: string;
  stallCategory: string;
}

interface CanvasStall extends StallMarker {
  realStallId?: number;
}

const toCategory = (value: string): "Prime" | "Super" | "General" => {
  const normalized = value.toLowerCase();
  if (normalized === "prime") return "Prime";
  if (normalized === "super") return "Super";
  return "General";
};

const toStatus = (value: string): "available" | "booked" | "reserved" | "blocked" => {
  const normalized = value.toLowerCase();
  if (normalized === "booked") return "booked";
  if (normalized === "reserved") return "reserved";
  if (normalized === "blocked") return "blocked";
  return "available";
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles =
    status === "upcoming"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : status === "ongoing"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-500 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles} capitalize`}>
      {status}
    </span>
  );
};

// ─── Exhibition List View ────────────────────────────────────────────────────

interface ExhibitionListProps {
  exhibitions: ExhibitionItem[];
  onBook: (ex: ExhibitionItem) => void;
}

const ExhibitionList = ({ exhibitions, onBook }: ExhibitionListProps) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [viewEx, setViewEx] = useState<ExhibitionItem | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return exhibitions.filter(
      (ex) => ex.name.toLowerCase().includes(q) || ex.venue.toLowerCase().includes(q)
    );
  }, [exhibitions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or venue..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <CalendarDays size={36} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No upcoming exhibitions found</p>
          <p className="text-xs text-muted-foreground mt-1">Check back later or clear your search</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Exhibition Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Place</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Date Range</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((ex, i) => (
                  <tr
                    key={ex.id}
                    className={`border-b border-border last:border-0 transition-colors hover:bg-accent/30 ${
                      i % 2 === 0 ? "bg-card" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{ex.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="shrink-0" />
                        {ex.venue}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="shrink-0" />
                        {formatDate(ex.startDate)} – {formatDate(ex.endDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ex.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setViewEx(ex)}>
                          <Eye size={14} className="mr-1" /> View
                        </Button>
                        <Button size="sm" onClick={() => onBook(ex)}>
                          Book Stall
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {paginated.map((ex) => (
              <div key={ex.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground leading-tight">{ex.name}</p>
                  <StatusBadge status={ex.status} />
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <MapPin size={13} className="shrink-0" /> {ex.venue}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CalendarDays size={13} className="shrink-0" />
                    {formatDate(ex.startDate)} – {formatDate(ex.endDate)}
                  </p>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewEx(ex)}>
                    <Eye size={14} className="mr-1" /> View
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => onBook(ex)}>
                    Book Stall
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft size={14} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={page === i ? "default" : "outline"}
                    onClick={() => setPage(i)}
                    className="h-8 w-8 p-0"
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!viewEx} onOpenChange={(open) => !open && setViewEx(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewEx?.name}</DialogTitle>
            <DialogDescription className="sr-only">Exhibition details</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 -mt-2">
            <StatusBadge status={viewEx?.status ?? ""} />
          </div>
          {viewEx && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Venue</p>
                  <p className="text-foreground flex items-center gap-1.5">
                    <MapPin size={13} /> {viewEx.venue}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Date Range</p>
                  <p className="text-foreground flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {formatDate(viewEx.startDate)} – {formatDate(viewEx.endDate)}
                  </p>
                </div>
                {viewEx.time && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Time</p>
                    <p className="text-foreground">{viewEx.time}</p>
                  </div>
                )}
                {viewEx.totalStalls !== undefined && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Total Stalls</p>
                    <p className="text-foreground">{viewEx.totalStalls}</p>
                  </div>
                )}
              </div>
              {viewEx.description && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                  <p className="text-muted-foreground leading-relaxed">{viewEx.description}</p>
                </div>
              )}
              <div className="pt-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    setViewEx(null);
                    onBook(viewEx);
                  }}
                >
                  Book Stall in This Exhibition
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const BookStallPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [wizardActive, setWizardActive] = useState(false);
  const [selectedStall, setSelectedStall] = useState<CanvasStall | null>(null);
  const [selectedExId, setSelectedExId] = useState("");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [productCategory, setProductCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [specialReq, setSpecialReq] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [availableExhibitions, setAvailableExhibitions] = useState<ExhibitionItem[]>([]);
  const [layoutImage, setLayoutImage] = useState<string | undefined>();
  const [stalls, setStalls] = useState<CanvasStall[]>([]);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadExhibitions = async () => {
      try {
        const response = await api.get<ApiResponse<PageResponse<ExhibitionItem>>>("/exhibitions?page=0&size=100&sort=startDate,asc");
        if (cancelled) return;
        setAvailableExhibitions(
          (response.data?.content ?? []).filter((item) => item.status === "upcoming" || item.status === "ongoing")
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load exhibitions");
        }
      }
    };

    void loadExhibitions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedExId) {
      setLayoutImage(undefined);
      setStalls([]);
      setSelectedStall(null);
      return;
    }

    let cancelled = false;

    const loadLayoutAndStalls = async () => {
      setError("");
      try {
        const [layoutResponse, stallResponse] = await Promise.all([
          api.get<ApiResponse<LayoutResponse>>(`/stall-layouts/${selectedExId}`),
          api.get<ApiResponse<StallItem[]>>(`/stalls?exhibitionId=${selectedExId}`),
        ]);

        if (cancelled) return;

        const stallMap = new Map((stallResponse.data ?? []).map((stall) => [stall.number, stall]));
        const mappedStalls: CanvasStall[] = (layoutResponse.data?.markers ?? []).map((marker, index) => {
          const realStall = stallMap.get(marker.number);
          return {
            id: String(realStall?.id ?? `${selectedExId}-${index}`),
            realStallId: realStall?.id,
            number: marker.number,
            category: toCategory(realStall?.category ?? marker.category),
            price: realStall?.price ?? marker.price,
            status: toStatus(realStall?.status ?? marker.status),
            x: marker.x,
            y: marker.y,
            w: marker.w,
            h: marker.h,
          };
        });

        setLayoutImage(layoutResponse.data?.mode === "image" ? layoutResponse.data?.layoutImageUrl : undefined);
        setStalls(mappedStalls);
        setSelectedStall(null);
      } catch (err) {
        if (!cancelled) {
          setLayoutImage(undefined);
          setStalls([]);
          setSelectedStall(null);
          setError(err instanceof ApiError ? err.message : "Failed to load exhibition stalls");
        }
      }
    };

    void loadLayoutAndStalls();

    return () => {
      cancelled = true;
    };
  }, [selectedExId]);

  const exhibition = availableExhibitions.find((item) => String(item.id) === selectedExId);
  const selectedSet = new Set(selectedStall ? [selectedStall.id] : []);

  const days =
    startDate && endDate
      ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1)
      : 0;
  const subtotal = selectedStall ? selectedStall.price * Math.max(days, 1) : 0;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const handleBook = (ex: ExhibitionItem) => {
    setSelectedExId(String(ex.id));
    setSelectedStall(null);
    setStep(0);
    setWizardActive(true);
  };

  const handleBackToList = () => {
    setWizardActive(false);
    setStep(0);
    setSelectedExId("");
    setSelectedStall(null);
    setDone(false);
    setBookingResult(null);
    setError("");
  };

  const handlePay = async () => {
    if (!selectedStall?.realStallId || !exhibition) {
      toast.error("Please select a valid stall");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setPaying(true);
    try {
      const response = await api.post<ApiResponse<BookingResponse>>("/bookings", {
        exhibitionId: exhibition.id,
        stallId: selectedStall.realStallId,
        businessName,
        productCategory,
        startDate,
        endDate,
        specialRequirements: specialReq,
        paymentMethod,
      });

      setBookingResult(response.data ?? null);
      setDone(true);
      toast.success(response.message || "Booking confirmed");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to confirm booking");
    } finally {
      setPaying(false);
    }
  };

  const invoicePayload = useMemo(
    () => ({
      invoiceId: bookingResult?.bookingNumber || "BOOKING",
      date: new Date().toISOString().split("T")[0],
      exhibitorName: user?.name || "",
      businessName,
      email: user?.email || "",
      exhibitionName: exhibition?.name || "",
      venue: exhibition?.venue || "",
      stallNumber: bookingResult?.stallNumber || selectedStall?.number || "",
      stallCategory: bookingResult?.stallCategory || selectedStall?.category || "",
      startDate,
      endDate,
      days,
      pricePerDay: selectedStall?.price || 0,
      subtotal,
      gst,
      total: bookingResult?.total || total,
      paid: true,
    }),
    [bookingResult, businessName, user, exhibition, selectedStall, startDate, endDate, days, subtotal, gst, total]
  );

  if (!user) return null;

  return (
    <div>
      <PageHeader title="Book a Stall" description="Browse upcoming exhibitions and book your stall" />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── Exhibition List ── */}
        {!wizardActive && (
          <motion.div key="list" {...fadeIn}>
            <ExhibitionList exhibitions={availableExhibitions} onBook={handleBook} />
          </motion.div>
        )}

        {/* ── Booking Wizard ── */}
        {wizardActive && (
          <motion.div key="wizard" {...fadeIn}>
            {/* Wizard header */}
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="sm" onClick={handleBackToList} className="gap-1 text-muted-foreground hover:text-foreground">
                <ChevronLeft size={16} /> All Exhibitions
              </Button>
              {exhibition && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>/</span>
                  <MapPin size={13} />
                  <span className="font-medium text-foreground">{exhibition.name}</span>
                </div>
              )}
            </div>

            {/* Step progress */}
            {!done && (
              <div className="flex items-center justify-center mb-8 gap-0">
                {steps.map((stepLabel, index) => (
                  <div key={stepLabel} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index < step ? <Check size={16} /> : index + 1}
                    </div>
                    <span
                      className={`mx-2 text-sm hidden sm:inline ${
                        index <= step ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {stepLabel}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 ${index < step ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* Step 0: Select Stall */}
              {step === 0 && !done && (
                <motion.div key="step1" {...fadeIn}>
                  {exhibition && stalls.length > 0 && (
                    <div className="bg-card rounded-lg border border-border p-4">
                      <StallCanvas
                        stalls={stalls}
                        layoutImage={layoutImage}
                        mode="select"
                        selectedIds={selectedSet}
                        onSelectStall={(stall) => {
                          const typedStall = stall as CanvasStall;
                          setSelectedStall(selectedStall?.id === typedStall.id ? null : typedStall);
                        }}
                      />
                      {selectedStall && (
                        <div className="mt-4 p-3 surface-peach rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StallCategoryIcon stallId={selectedStall.id} />
                            <div>
                              <p className="font-semibold text-foreground">{selectedStall.number}</p>
                              <CategoryBadge category={selectedStall.category} />
                            </div>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            Rs. {selectedStall.price.toLocaleString()}
                            <span className="text-xs text-muted-foreground font-normal">/day</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {exhibition && stalls.length === 0 && (
                    <div className="bg-card rounded-lg border border-border p-10 text-center">
                      <Info size={32} className="text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-base font-semibold text-foreground mb-1">Layout not configured yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Stall layout for this exhibition has not been set up. Please contact the admin.
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBackToList}>
                      <ChevronLeft size={16} className="mr-1" /> Back
                    </Button>
                    <Button onClick={() => setStep(1)} disabled={!selectedStall?.realStallId}>
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Booking Details */}
              {step === 1 && (
                <motion.div key="step2" {...fadeIn}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Booking Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Event Name</Label>
                            <Input value={exhibition?.name || ""} readOnly className="bg-muted" />
                          </div>
                          <div>
                            <Label>Exhibitor Name</Label>
                            <Input value={user.name} readOnly className="bg-muted" />
                          </div>
                          <div>
                            <Label>Business Name</Label>
                            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                          </div>
                          <div>
                            <Label>Product Category</Label>
                            <Select value={productCategory} onValueChange={setProductCategory}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {["Agriculture", "Seeds & Fertilizers", "Machinery", "Food Products", "Handicrafts", "Other"].map(
                                  (category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={startDate}
                                min={exhibition?.startDate}
                                max={exhibition?.endDate}
                                onChange={(e) => setStartDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={endDate}
                                min={startDate || exhibition?.startDate}
                                max={exhibition?.endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                              />
                            </div>
                          </div>
                          {exhibition?.startDate && (
                            <p className="text-xs text-muted-foreground">
                              Allowed range: {formatDate(exhibition.startDate)} – {formatDate(exhibition.endDate)}
                            </p>
                          )}
                          {startDate && endDate && (new Date(startDate) < new Date(exhibition?.startDate ?? "") || new Date(endDate) > new Date(exhibition?.endDate ?? "")) && (
                            <p className="text-xs text-red-500 font-medium">
                              Dates must be within the exhibition period.
                            </p>
                          )}
                          {days > 0 && <p className="text-sm text-muted-foreground">{days} day(s) selected</p>}
                          <div>
                            <Label>Special Requirements (Optional)</Label>
                            <Textarea
                              value={specialReq}
                              onChange={(e) => setSpecialReq(e.target.value)}
                              placeholder="Any special needs..."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:sticky lg:top-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Stall</span>
                            <span className="text-foreground font-medium">
                              {selectedStall?.number} ({selectedStall?.category})
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price/day</span>
                            <span className="text-foreground">Rs. {selectedStall?.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Days</span>
                            <span className="text-foreground">{days || "—"}</span>
                          </div>
                          <div className="border-t border-border pt-2 flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="text-foreground">Rs. {subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">GST (18%)</span>
                            <span className="text-foreground">Rs. {gst.toLocaleString()}</span>
                          </div>
                          <div className="border-t border-border pt-2 flex justify-between text-base font-bold">
                            <span>Grand Total</span>
                            <span>Rs. {total.toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setStep(0)}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(2)}
                      disabled={
                        !businessName || !productCategory || !startDate || !endDate ||
                        (exhibition?.startDate != null && new Date(startDate) < new Date(exhibition.startDate)) ||
                        (exhibition?.endDate   != null && new Date(endDate)   > new Date(exhibition.endDate))   ||
                        new Date(endDate) < new Date(startDate)
                      }
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && !done && (
                <motion.div key="step3" {...fadeIn}>
                  <div className="max-w-lg mx-auto space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Payment Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stall</span>
                          <span>
                            {selectedStall?.number} - {selectedStall?.category}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Exhibition</span>
                          <span>{exhibition?.name}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                          <span>Total</span>
                          <span>Rs. {total.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Payment Method</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { id: "upi", label: "UPI", icon: Smartphone },
                          { id: "card", label: "Credit/Debit Card", icon: CreditCard },
                          { id: "netbanking", label: "Net Banking", icon: Globe },
                        ].map((method) => (
                          <div
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              paymentMethod === method.id ? "border-primary bg-accent" : "border-border hover:bg-accent/50"
                            }`}
                          >
                            <method.icon
                              size={20}
                              className={paymentMethod === method.id ? "text-primary" : "text-muted-foreground"}
                            />
                            <span className="text-sm font-medium text-foreground">{method.label}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Button onClick={() => void handlePay()} disabled={paying} className="w-full h-12 text-base">
                      {paying ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" /> Processing...
                        </>
                      ) : (
                        `Pay Rs. ${total.toLocaleString()} Now`
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                      Back
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Success */}
              {done && (
                <motion.div key="success" {...fadeIn} className="max-w-md mx-auto text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-stall-general-bg flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-stall-general" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
                  <p className="text-muted-foreground mb-1">
                    Booking ID:{" "}
                    <span className="font-mono font-semibold text-foreground">{bookingResult?.bookingNumber}</span>
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Amount Paid:{" "}
                    <span className="font-semibold text-foreground">
                      Rs. {(bookingResult?.total || total).toLocaleString()}
                    </span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        downloadInvoicePdf(invoicePayload);
                        toast.success("Invoice ready for download");
                      }}
                    >
                      <Download size={16} className="mr-2" /> Download Invoice
                    </Button>
                    <Button variant="outline" onClick={handleBackToList}>
                      Browse More Exhibitions
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookStallPage;
