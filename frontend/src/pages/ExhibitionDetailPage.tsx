import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft, MapPin, Clock, Calendar, Package, Building2,
  User, Hash, Image, Info, CheckCircle2,
} from "lucide-react";
import { api, ApiError } from "@/lib/apiClient";

interface ApiResponse<T> { success: boolean; message?: string; data?: T; }

interface StallCategory {
  category: string; price: number; total: number; booked: number; available: number;
}

interface Exhibition {
  id: number; eventId: string; name: string;
  startDate: string; endDate: string; time?: string;
  venue: string; description?: string;
  totalStalls: number; status: string;
  layoutImageUrl?: string; bannerImageUrl?: string;
  organizerName?: string;
  stallCategories: StallCategory[];
  videoLinks?: string[];
}

const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const categoryStyle: Record<string, { border: string; bg: string; text: string; label: string }> = {
  prime:   { border: "border-amber-400",  bg: "bg-amber-50",  text: "text-amber-800",  label: "Prime" },
  super:   { border: "border-blue-400",   bg: "bg-blue-50",   text: "text-blue-800",   label: "Super" },
  general: { border: "border-green-400",  bg: "bg-green-50",  text: "text-green-800",  label: "General" },
};

const ExhibitionDetailPage = () => {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const [ex, setEx]  = useState<Exhibition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.get<ApiResponse<Exhibition>>(`/exhibitions/${id}`)
      .then((r) => setEx(r.data ?? null))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load exhibition"))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
        <div className="h-8 w-1/2 rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  if (!ex) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Building2 size={48} className="text-muted-foreground mb-4" />
        <p className="font-medium">Exhibition not found</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const totalAvailable = ex.stallCategories.reduce((s, c) => s + c.available, 0);
  const bannerSrc      = ex.bannerImageUrl || ex.layoutImageUrl;
  const today          = new Date().toISOString().slice(0, 10);
  const isEnded        = ex.endDate < today;
  const canBook        = user?.role === "exhibitor" && !isEnded && totalAvailable > 0;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Back button */}
      <Button variant="ghost" className="mb-4 gap-2 text-muted-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to Exhibitions
      </Button>

      {/* Banner */}
      <div className="relative rounded-xl overflow-hidden h-64 bg-gradient-to-br from-indigo-50 to-purple-50 mb-6 flex items-center justify-center">
        {bannerSrc ? (
          <img src={bannerSrc} alt={ex.name} className="w-full h-full object-cover" />
        ) : (
          <Building2 size={72} className="text-indigo-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">{ex.name}</h1>
              {ex.organizerName && (
                <p className="text-white/80 text-sm mt-0.5">by {ex.organizerName}</p>
              )}
            </div>
            <span className={`shrink-0 px-3 py-1 rounded-full text-sm font-semibold ${
              ex.status === "upcoming" ? "bg-indigo-600 text-white" :
              ex.status === "ongoing"  ? "bg-emerald-600 text-white" :
              "bg-gray-600 text-white"
            }`}>
              {ex.status.charAt(0).toUpperCase() + ex.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key details card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info size={16} /> Exhibition Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5">
                  <Hash size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Event ID</p>
                    <p className="text-sm font-mono font-semibold">{ex.eventId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Venue / Location</p>
                    <p className="text-sm font-medium">{ex.venue}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dates</p>
                    <p className="text-sm font-medium">{ex.startDate} → {ex.endDate}</p>
                  </div>
                </div>
                {ex.time && (
                  <div className="flex items-start gap-2.5">
                    <Clock size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Timings</p>
                      <p className="text-sm font-medium">{ex.time}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <Package size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Stalls</p>
                    <p className="text-sm font-medium">{ex.totalStalls}</p>
                  </div>
                </div>
                {ex.organizerName && (
                  <div className="flex items-start gap-2.5">
                    <User size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Organizer</p>
                      <p className="text-sm font-medium">{ex.organizerName}</p>
                    </div>
                  </div>
                )}
              </div>

              {ex.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">About this Exhibition</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{ex.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Layout image */}
          {ex.layoutImageUrl && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Image size={16} /> Stall Layout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={ex.layoutImageUrl}
                  alt="Stall layout"
                  className="w-full rounded-lg border border-border object-contain max-h-80"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — stall categories + booking */}
        <div className="space-y-4">
          {/* Book Stall CTA */}
          <Card className={`border-2 ${canBook ? "border-primary/30 bg-primary/5" : "border-border"}`}>
            <CardContent className="pt-5">
              {isEnded ? (
                <p className="text-sm text-muted-foreground text-center py-2">This exhibition has ended.</p>
              ) : totalAvailable === 0 ? (
                <p className="text-sm text-red-500 text-center py-2 font-medium">All stalls are fully booked.</p>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-700">
                      {totalAvailable} stall{totalAvailable !== 1 ? "s" : ""} available
                    </span>
                  </div>
                  {user?.role === "exhibitor" && (
                    <Button className="w-full" onClick={() => navigate(`/book-stall?exhibitionId=${ex.id}`)}>
                      Book a Stall
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Stall categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Stall Categories &amp; Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ex.stallCategories.map((cat) => {
                const style = categoryStyle[cat.category] ?? { border: "border-gray-300", bg: "bg-gray-50", text: "text-gray-700", label: cat.category };
                return (
                  <div key={cat.category} className={`rounded-lg border-l-4 p-3 ${style.border} ${style.bg}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold capitalize ${style.text}`}>{style.label}</span>
                      <span className={`text-xs font-semibold ${style.text}`}>{fmt(cat.price)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Total: {cat.total}</span>
                      <span>·</span>
                      <span>Booked: {cat.booked}</span>
                      <span>·</span>
                      <span className={cat.available > 0 ? "text-green-700 font-semibold" : "text-red-500 font-semibold"}>
                        Available: {cat.available}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionDetailPage;
