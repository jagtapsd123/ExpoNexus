import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/apiClient";
import { StallCanvas } from "@/components/ui/stall-canvas";
import type { StallMarker } from "@/data/stallLayouts";
import { CategoryBadge } from "@/components/ui/stall-category";
import { StallCategoryIcon } from "@/components/ui/stall-category-icon";
import { toast } from "sonner";
import { Check, CreditCard, Smartphone, Globe, Loader2, Download, Info } from "lucide-react";
import { downloadInvoicePdf } from "@/lib/generateInvoicePdf";
import { motion, AnimatePresence } from "framer-motion";

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

const steps = ["Select Stall", "Booking Details", "Payment"];

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

const BookStallPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
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
        const response = await api.get<ApiResponse<PageResponse<ExhibitionItem>>>("/exhibitions?page=0&size=100&sort=startDate,desc");
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

  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1) : 0;
  const subtotal = selectedStall ? selectedStall.price * Math.max(days, 1) : 0;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

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

  const invoicePayload = useMemo(() => ({
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
  }), [bookingResult, businessName, user, exhibition, selectedStall, startDate, endDate, days, subtotal, gst, total]);

  if (!user) return null;

  return (
    <div>
      <PageHeader title="Book a Stall" description="Complete your stall booking in 3 easy steps" />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center mb-8 gap-0">
        {steps.map((stepLabel, index) => (
          <div key={stepLabel} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>{index < step ? <Check size={16} /> : index + 1}</div>
            <span className={`mx-2 text-sm hidden sm:inline ${index <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{stepLabel}</span>
            {index < steps.length - 1 && <div className={`w-12 h-0.5 ${index < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step1" {...fadeIn}>
            <div className="mb-4 max-w-sm">
              <Label>Select Exhibition</Label>
              <Select value={selectedExId} onValueChange={(value) => { setSelectedExId(value); setSelectedStall(null); }}>
                <SelectTrigger><SelectValue placeholder="Choose exhibition" /></SelectTrigger>
                <SelectContent>{availableExhibitions.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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
            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep(1)} disabled={!selectedStall?.realStallId}>Continue</Button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step2" {...fadeIn}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Booking Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><Label>Event Name</Label><Input value={exhibition?.name || ""} readOnly className="bg-muted" /></div>
                    <div><Label>Exhibitor Name</Label><Input value={user.name} readOnly className="bg-muted" /></div>
                    <div><Label>Business Name</Label><Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} /></div>
                    <div>
                      <Label>Product Category</Label>
                      <Select value={productCategory} onValueChange={setProductCategory}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {["Agriculture", "Seeds & Fertilizers", "Machinery", "Food Products", "Handicrafts", "Other"].map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                      <div><Label>End Date</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                    </div>
                    {days > 0 && <p className="text-sm text-muted-foreground">{days} day(s) selected</p>}
                    <div><Label>Special Requirements (Optional)</Label><Textarea value={specialReq} onChange={(e) => setSpecialReq(e.target.value)} placeholder="Any special needs..." /></div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:sticky lg:top-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Booking Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Stall</span><span className="text-foreground font-medium">{selectedStall?.number} ({selectedStall?.category})</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Price/day</span><span className="text-foreground">Rs. {selectedStall?.price.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Days</span><span className="text-foreground">{days || "-"}</span></div>
                    <div className="border-t border-border pt-2 flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">Rs. {subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span className="text-foreground">Rs. {gst.toLocaleString()}</span></div>
                    <div className="border-t border-border pt-2 flex justify-between text-base font-bold"><span>Grand Total</span><span>Rs. {total.toLocaleString()}</span></div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)} disabled={!businessName || !productCategory || !startDate || !endDate}>Continue</Button>
            </div>
          </motion.div>
        )}

        {step === 2 && !done && (
          <motion.div key="step3" {...fadeIn}>
            <div className="max-w-lg mx-auto space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Payment Summary</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Stall</span><span>{selectedStall?.number} - {selectedStall?.category}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Exhibition</span><span>{exhibition?.name}</span></div>
                  <div className="flex justify-between text-base font-bold border-t border-border pt-2"><span>Total</span><span>Rs. {total.toLocaleString()}</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Payment Method</CardTitle></CardHeader>
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
                      <method.icon size={20} className={paymentMethod === method.id ? "text-primary" : "text-muted-foreground"} />
                      <span className="text-sm font-medium text-foreground">{method.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button onClick={() => void handlePay()} disabled={paying} className="w-full h-12 text-base">
                {paying ? <><Loader2 size={18} className="mr-2 animate-spin" /> Processing...</> : `Pay Rs. ${total.toLocaleString()} Now`}
              </Button>
              <Button variant="outline" onClick={() => setStep(1)} className="w-full">Back</Button>
            </div>
          </motion.div>
        )}

        {done && (
          <motion.div key="success" {...fadeIn} className="max-w-md mx-auto text-center py-12">
            <div className="w-20 h-20 rounded-full bg-stall-general-bg flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-stall-general" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-1">Booking ID: <span className="font-mono font-semibold text-foreground">{bookingResult?.bookingNumber}</span></p>
            <p className="text-muted-foreground mb-6">Amount Paid: <span className="font-semibold text-foreground">Rs. {(bookingResult?.total || total).toLocaleString()}</span></p>
            <Button variant="outline" onClick={() => {
              downloadInvoicePdf(invoicePayload);
              toast.success("Invoice ready for download");
            }}>
              <Download size={16} className="mr-2" /> Download Invoice
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookStallPage;
