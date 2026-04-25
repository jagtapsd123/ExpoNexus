import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search, MapPin, Clock, Calendar, Package,
  Eye, ChevronLeft, ChevronRight, Building2,
} from "lucide-react";
import { api, ApiError } from "@/lib/apiClient";

interface ApiResponse<T> { success: boolean; message?: string; data?: T; }
interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; }

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
}

const PAGE_SIZE = 9;

const categoryColors: Record<string, string> = {
  prime:   "border-l-4 border-amber-400 bg-amber-50 text-amber-800",
  super:   "border-l-4 border-blue-400 bg-blue-50 text-blue-800",
  general: "border-l-4 border-green-400 bg-green-50 text-green-800",
};

const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function ExhibitionCard({ ex, navigate }: { ex: Exhibition; navigate: ReturnType<typeof useNavigate> }) {
  const totalAvailable = ex.stallCategories.reduce((s, c) => s + c.available, 0);
  const bannerSrc = ex.bannerImageUrl || ex.layoutImageUrl;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group flex flex-col">
      {/* Banner */}
      <div className="relative h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden shrink-0">
        {bannerSrc ? (
          <img src={bannerSrc} alt={ex.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Building2 size={48} className="text-indigo-200" />
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            ex.status === "upcoming" ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
          }`}>
            {ex.status === "upcoming" ? "Upcoming" : "Ongoing"}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded bg-black/60 text-white text-xs font-mono">{ex.eventId}</span>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-bold text-base text-foreground leading-tight mb-1 line-clamp-2">{ex.name}</h3>
        {ex.organizerName && (
          <p className="text-xs text-muted-foreground mb-2">by {ex.organizerName}</p>
        )}

        {/* Meta */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{ex.venue}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar size={13} className="shrink-0" />
            <span>{ex.startDate} → {ex.endDate}</span>
          </div>
          {ex.time && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock size={13} className="shrink-0" />
              <span>{ex.time}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {ex.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{ex.description}</p>
        )}

        {/* Stall Categories */}
        {ex.stallCategories.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {ex.stallCategories.map((cat) => (
              <div key={cat.category} className={`rounded p-1.5 text-center text-xs ${categoryColors[cat.category] ?? "bg-muted"}`}>
                <p className="font-semibold capitalize">{cat.category}</p>
                <p className="font-bold">{cat.available}<span className="font-normal text-muted-foreground">/{cat.total}</span></p>
                <p className="text-muted-foreground">{fmt(cat.price)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Available count */}
        <div className="flex items-center gap-1.5 text-sm mb-4">
          <Package size={13} className="text-muted-foreground" />
          <span className={totalAvailable > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
            {totalAvailable > 0 ? `${totalAvailable} stall${totalAvailable !== 1 ? "s" : ""} available` : "Fully booked"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            className="flex-1 gap-1 text-sm"
            onClick={() => navigate(`/exhibitions/${ex.id}`)}
          >
            <Eye size={14} /> View Details
          </Button>
          <Button
            className="flex-1 gap-1 text-sm"
            disabled={totalAvailable === 0}
            onClick={() => navigate(`/book-stall?exhibitionId=${ex.id}`)}
          >
            Book Stall
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const BrowseExhibitionsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab]                   = useState<"upcoming" | "ongoing">("upcoming");
  const [search, setSearch]             = useState("");
  const [debouncedSearch, setDebSearch] = useState("");
  const [page, setPage]                 = useState(0);
  const [data, setData]                 = useState<PageResponse<Exhibition> | null>(null);
  const [isLoading, setIsLoading]       = useState(true);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when tab/search changes
  useEffect(() => { setPage(0); }, [tab, debouncedSearch]);

  const load = useCallback(() => {
    setIsLoading(true);
    const status = tab === "upcoming" ? "UPCOMING" : "ONGOING";
    const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "";
    api.get<ApiResponse<PageResponse<Exhibition>>>(
      `/exhibitions?status=${status}&page=${page}&size=${PAGE_SIZE}&sort=startDate,asc${searchParam}`
    )
      .then((r) => setData(r.data ?? null))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load exhibitions"))
      .finally(() => setIsLoading(false));
  }, [tab, page, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const exhibitions = data?.content ?? [];
  const totalPages  = data?.totalPages ?? 0;
  const totalCount  = data?.totalElements ?? 0;

  return (
    <div>
      <PageHeader
        title="Exhibitions"
        description="Browse upcoming and ongoing exhibitions to book your stall"
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "upcoming" | "ongoing")}>
        {/* Tab bar + Search row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <TabsList className="shrink-0">
            <TabsTrigger value="upcoming" className="gap-1.5">
              <Calendar size={14} /> Upcoming
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="gap-1.5">
              <Clock size={14} /> Ongoing
            </TabsTrigger>
          </TabsList>

          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or venue…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {!isLoading && (
            <span className="text-sm text-muted-foreground shrink-0">
              {totalCount} exhibition{totalCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Upcoming tab */}
        <TabsContent value="upcoming" className="mt-0">
          <ExhibitionGrid
            exhibitions={exhibitions}
            isLoading={isLoading}
            emptyMessage="No upcoming exhibitions found."
            navigate={navigate}
          />
        </TabsContent>

        {/* Ongoing tab */}
        <TabsContent value="ongoing" className="mt-0">
          <ExhibitionGrid
            exhibitions={exhibitions}
            isLoading={isLoading}
            emptyMessage="No ongoing exhibitions at the moment."
            navigate={navigate}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="outline" size="sm"
            disabled={page === 0 || isLoading}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={15} /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            disabled={page >= totalPages - 1 || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight size={15} />
          </Button>
        </div>
      )}
    </div>
  );
};

function ExhibitionGrid({
  exhibitions, isLoading, emptyMessage, navigate,
}: {
  exhibitions: Exhibition[];
  isLoading: boolean;
  emptyMessage: string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card animate-pulse h-80" />
        ))}
      </div>
    );
  }

  if (exhibitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 size={48} className="text-muted-foreground mb-4" />
        <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
        <p className="text-xs text-muted-foreground mt-1">Check back later for new exhibitions.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exhibitions.map((ex) => (
        <ExhibitionCard key={ex.id} ex={ex} navigate={navigate} />
      ))}
    </div>
  );
}

export default BrowseExhibitionsPage;
