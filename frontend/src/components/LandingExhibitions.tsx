import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { config } from "@/config/env";
import {
  MapPin, CalendarDays, ChevronLeft, ChevronRight,
  Loader2, ArrowRight, LayoutGrid, Radio,
} from "lucide-react";

interface ExhibitionItem {
  id: number;
  eventId: string;
  name: string;
  startDate: string;
  endDate: string;
  time?: string;
  venue: string;
  status: string;
  totalStalls: number;
  district?: string;
  bannerImageUrl?: string;
  description?: string;
  stallCategories?: { category: string; available: number; price: number }[];
}

interface PageData {
  content: ExhibitionItem[];
  totalElements: number;
  totalPages: number;
}

interface Props {
  language: "en" | "mr";
}

const UPCOMING_PAGE_SIZE = 6;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true },
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const LandingExhibitions = ({ language }: Props) => {
  const L = (en: string, mr: string) => (language === "mr" ? mr : en);

  const [ongoing, setOngoing]               = useState<ExhibitionItem[]>([]);
  const [upcoming, setUpcoming]             = useState<ExhibitionItem[]>([]);
  const [upPage, setUpPage]                 = useState(0);
  const [upTotalPages, setUpTotalPages]     = useState(0);
  const [upTotal, setUpTotal]               = useState(0);
  const [loadingOngoing, setLoadingOngoing] = useState(true);
  const [loadingUp, setLoadingUp]           = useState(true);

  // Fetch ongoing exhibitions once
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingOngoing(true);
      try {
        const res = await fetch(
          `${config.apiBaseUrl}/exhibitions?status=ONGOING&size=10&sort=startDate,asc`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setOngoing(json?.data?.content ?? []);
      } catch { /* silent */ } finally {
        if (!cancelled) setLoadingOngoing(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  // Fetch upcoming exhibitions whenever page changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingUp(true);
      try {
        const params = new URLSearchParams({
          status: "UPCOMING",
          page: String(upPage),
          size: String(UPCOMING_PAGE_SIZE),
          sort: "startDate,asc",
        });
        const res = await fetch(`${config.apiBaseUrl}/exhibitions?${params}`);
        if (!res.ok) return;
        const json = await res.json();
        const d: PageData = json?.data ?? { content: [], totalElements: 0, totalPages: 0 };
        if (!cancelled) {
          setUpcoming(d.content);
          setUpTotalPages(d.totalPages);
          setUpTotal(d.totalElements);
        }
      } catch { /* silent */ } finally {
        if (!cancelled) setLoadingUp(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [upPage]);

  const hasContent = ongoing.length > 0 || upTotal > 0 || loadingOngoing || loadingUp;
  if (!hasContent && !loadingOngoing && !loadingUp) return null;

  return (
    <section className="border-y bg-background">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

        {/* ── Section heading ──────────────────────────────────── */}
        <motion.div {...fadeUp} className="text-center">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
            {L("Exhibitions", "प्रदर्शनी")}
          </span>
          <h2 className="text-2xl font-bold text-foreground">
            {L("Upcoming & Current Exhibitions", "आगामी आणि चालू प्रदर्शनी")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {L(
              "Book your stall at the next AMRUT Peth exhibition",
              "पुढील अमृत पेठ प्रदर्शनीसाठी आपला स्टॉल बुक करा"
            )}
          </p>
        </motion.div>

        {/* ── ONGOING (highlighted) ─────────────────────────────── */}
        {(loadingOngoing || ongoing.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <h3 className="text-base font-semibold text-foreground">
                {L("Happening Now", "आता चालू आहे")}
              </h3>
            </div>

            {loadingOngoing ? (
              <div className="flex justify-center py-8">
                <Loader2 size={22} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ongoing.map((ex) => (
                  <motion.div key={ex.id} {...fadeUp}>
                    <Card className="h-full overflow-hidden border-2 border-green-400 shadow-md hover:shadow-lg transition-shadow">
                      {/* Banner */}
                      {ex.bannerImageUrl ? (
                        <div className="aspect-[16/7] overflow-hidden relative">
                          <img
                            src={ex.bannerImageUrl}
                            alt={ex.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                          />
                          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white shadow">
                            <Radio size={11} /> {L("LIVE", "चालू")}
                          </span>
                        </div>
                      ) : (
                        <div className="aspect-[16/7] bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center relative">
                          <LayoutGrid size={36} className="text-green-400" />
                          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white shadow">
                            <Radio size={11} /> {L("LIVE", "चालू")}
                          </span>
                        </div>
                      )}
                      <CardContent className="p-4 space-y-2">
                        <h4 className="font-bold text-foreground leading-tight">{ex.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays size={13} className="shrink-0" />
                          <span>{fmt(ex.startDate)} – {fmt(ex.endDate)}{ex.time && ` · ${ex.time}`}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin size={13} className="shrink-0" />
                          <span className="truncate">{ex.venue}{ex.district ? ` · ${ex.district}` : ""}</span>
                        </div>
                        {ex.stallCategories && ex.stallCategories.some((c) => c.available > 0) && (
                          <p className="text-xs text-green-700 font-medium">
                            {ex.stallCategories.reduce((s, c) => s + c.available, 0)} {L("stalls available", "स्टॉल उपलब्ध")}
                          </p>
                        )}
                        <Button size="sm" asChild className="w-full mt-1 bg-green-600 hover:bg-green-700">
                          <Link to="/login?redirect=/book-stall">
                            {L("Book Stall Now", "स्टॉल बुक करा")} <ArrowRight size={13} className="ml-1" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* ── UPCOMING ─────────────────────────────────────────── */}
        {(loadingUp || upTotal > 0) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">
                {L("Upcoming Exhibitions", "आगामी प्रदर्शनी")}
                {upTotal > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">({upTotal})</span>
                )}
              </h3>
            </div>

            {loadingUp ? (
              <div className="flex justify-center py-8">
                <Loader2 size={22} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming.map((ex) => (
                    <motion.div key={ex.id} {...fadeUp}>
                      <Card className="h-full overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group">
                        {/* Banner / placeholder */}
                        {ex.bannerImageUrl ? (
                          <div className="aspect-[16/7] overflow-hidden">
                            <img
                              src={ex.bannerImageUrl}
                              alt={ex.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                            />
                          </div>
                        ) : (
                          <div className="aspect-[16/7] bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
                            <LayoutGrid size={32} className="text-primary/30" />
                          </div>
                        )}

                        <CardContent className="p-4 space-y-2">
                          {/* Date badge */}
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            <CalendarDays size={11} />
                            {fmt(ex.startDate)}
                          </div>
                          <h4 className="font-bold text-foreground leading-tight">{ex.name}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin size={12} className="shrink-0" />
                            <span className="truncate">{ex.venue}{ex.district ? ` · ${ex.district}` : ""}</span>
                          </div>
                          {ex.time && (
                            <p className="text-xs text-muted-foreground">{ex.time}</p>
                          )}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-muted-foreground">
                              {ex.totalStalls} {L("stalls", "स्टॉल्स")}
                            </span>
                            <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                              <Link to="/login?redirect=/book-stall">
                                {L("Register", "नोंदणी करा")} <ArrowRight size={11} className="ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {upTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpPage((p) => p - 1)}
                      disabled={upPage === 0 || loadingUp}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    {Array.from({ length: Math.min(upTotalPages, 5) }, (_, i) => {
                      const p =
                        upTotalPages <= 5 ? i
                        : upPage < 3 ? i
                        : upPage > upTotalPages - 4 ? upTotalPages - 5 + i
                        : upPage - 2 + i;
                      return (
                        <Button
                          key={p}
                          variant={p === upPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUpPage(p)}
                          disabled={loadingUp}
                          className="h-8 w-8 p-0 text-xs"
                        >
                          {p + 1}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpPage((p) => p + 1)}
                      disabled={upPage >= upTotalPages - 1 || loadingUp}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </section>
  );
};

export default LandingExhibitions;
