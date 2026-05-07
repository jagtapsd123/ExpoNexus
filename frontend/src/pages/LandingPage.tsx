import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoginSlideshow } from "@/components/LoginSlideshow";
import LandingExhibitions from "@/components/LandingExhibitions";
import { useLandingGallery } from "@/hooks/useLandingGallery";
import { useLandingSettings } from "@/hooks/useLandingSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import logoIcon from "@/assets/amrut-logo.png";
import { config } from "@/config/env";
import {
  CalendarCheck, LayoutGrid, ShieldCheck, FileText,
  Users, MapPin, Trophy, ArrowRight, Globe, ExternalLink,
  Ticket, CheckCircle2, ShoppingBag, Wheat, Package,
  Home, Shirt, Star, Smartphone, UserCheck, Store,
  ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";

const SvgFacebook  = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const SvgTwitter   = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const SvgInstagram = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>;
const SvgYoutube   = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true },
};

// Market photos — populated from admin-uploaded gallery images
const MARKET_PHOTOS: string[] = [];

interface Beneficiary {
  id: number;
  name: string;
  mobile?: string;
  address?: string;
  category?: string;
  businessName?: string;
  businessType?: string;
  beneficiaryCode?: string;
  stallNumber?: string;
  exhibitionDate?: string;
}

const BEN_PAGE_SIZE = 10;

const LandingPage = () => {
  const { images: galleryImages } = useLandingGallery();
  const { settings } = useLandingSettings();
  const { language, setLanguage, t } = useLanguage();

  const [benList, setBenList]           = useState<Beneficiary[]>([]);
  const [benPage, setBenPage]           = useState(0);
  const [benTotalPages, setBenTotalPages] = useState(0);
  const [benTotal, setBenTotal]         = useState(0);
  const [benLoading, setBenLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setBenLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(benPage),
          size: String(BEN_PAGE_SIZE),
          sort: "id,asc",
        });
        const res = await fetch(`${config.apiBaseUrl}/beneficiaries?${params}`);
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (!cancelled && json?.data) {
          setBenList(json.data.content ?? []);
          setBenTotalPages(json.data.totalPages ?? 0);
          setBenTotal(json.data.totalElements ?? 0);
        }
      } catch {
        // silently ignore — beneficiaries section just stays empty
      } finally {
        if (!cancelled) setBenLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [benPage]);

  const sliderImages = [...galleryImages];

  const features = [
    { icon: CalendarCheck, title: t("features.booking.title"),      desc: t("features.booking.desc") },
    { icon: LayoutGrid,    title: t("features.availability.title"), desc: t("features.availability.desc") },
    { icon: ShieldCheck,   title: t("features.access.title"),       desc: t("features.access.desc") },
    { icon: FileText,      title: t("features.invoices.title"),     desc: t("features.invoices.desc") },
  ];

  const stats = [
    { value: settings.statExhibitors,  label: t("stats.exhibitors"),  icon: Users },
    { value: settings.statExhibitions, label: t("stats.exhibitions"), icon: Trophy },
    { value: settings.statDistricts,   label: t("stats.districts"),   icon: MapPin },
  ];

  const objectives = [
    { en: "Providing a direct marketplace for local producers and entrepreneurs",  mr: "स्थानिक उत्पादक आणि उद्योजकांना थेट बाजारपेठ उपलब्ध करून देणे" },
    { en: "Promoting local products and handicrafts",                               mr: "स्थानिक उत्पादने व हस्तकला यांना प्रोत्साहन देणे" },
    { en: "Increasing self-employment and entrepreneurship",                        mr: "स्वयंरोजगार आणि उद्योजकता वाढविणे" },
    { en: "Providing quality products to customers at fair prices",                 mr: "ग्राहकांना दर्जेदार उत्पादने योग्य किमतीत उपलब्ध करून देणे" },
    { en: "Providing sales opportunities through digital platforms",                mr: "डिजिटल प्लॅटफॉर्मद्वारे विक्रीची संधी उपलब्ध करून देणे" },
  ];

  const keyFeatures = [
    { en: "Direct sales from producers to customers",      mr: "थेट उत्पादकांकडून ग्राहकांपर्यंत विक्री" },
    { en: "Availability of various local products",         mr: "विविध प्रकारच्या स्थानिक उत्पादनांची उपलब्धता" },
    { en: "Online and offline sales facility",              mr: "ऑनलाइन आणि ऑफलाइन विक्रीची सुविधा" },
    { en: "Integrated management system",                   mr: "एकात्मिक व्यवस्थापन प्रणाली" },
    { en: "Online marketplace for sellers",                 mr: "विक्रेत्यांसाठी ऑनलाइन मार्केटप्लेस" },
    { en: "Independent profile and dashboard",              mr: "स्वतंत्र प्रोफाइल व डॅशबोर्डची सुविधा" },
    { en: "Easy shopping experience for customers",         mr: "ग्राहकांसाठी सोपा खरेदी अनुभव" },
  ];

  const products = [
    { icon: Wheat,       en: "Agricultural Products",        mr: "कृषी उत्पादने" },
    { icon: Package,     en: "Processed Food Items",         mr: "प्रक्रिया केलेले अन्नपदार्थ" },
    { icon: Star,        en: "Handicraft Products",          mr: "हस्तकला उत्पादने" },
    { icon: Home,        en: "Home Products",                mr: "घरगुती उत्पादने" },
    { icon: Shirt,       en: "Clothing & Textiles",          mr: "कपडे आणि वस्त्र उत्पादने" },
    { icon: ShoppingBag, en: "Local & Traditional Products", mr: "स्थानिक व पारंपरिक उत्पादने" },
  ];

  const bookingSteps = [
    { num: "1", key: "process.step1" },
    { num: "2", key: "process.step2" },
    { num: "3", key: "process.step3" },
  ];

  const sellerFacilities = [
    { icon: Store,      en: "Stall facility",                    mr: "स्टॉलची सुविधा" },
    { icon: FileText,   en: "Sales management system",           mr: "विक्री व्यवस्थापन प्रणाली" },
    { icon: Smartphone, en: "Digital registration",              mr: "डिजिटल नोंदणी" },
    { icon: LayoutGrid, en: "Space to display products",         mr: "उत्पादनांचे प्रदर्शन करण्यासाठी जागा" },
    { icon: UserCheck,  en: "Direct contact with customers",     mr: "ग्राहकांशी थेट संपर्क" },
  ];

  const T = (item: { en: string; mr: string }) => language === "mr" ? item.mr : item.en;

  const SectionBadge = ({ tk }: { tk: string }) => (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
      {t(tk)}
    </span>
  );

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2 min-w-0">
            <img src={logoIcon} alt="Amrut" className="w-10 h-10 rounded-lg object-contain shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground leading-tight truncate">अमृत पेठ थेट बाजारपेठ</p>
              <p className="text-xs text-muted-foreground truncate">{t("nav.brand")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "en" ? "mr" : "en")} className="gap-1 text-xs">
              <Globe size={13} /> {t("lang.switch")}
            </Button>
            {settings.ecommerceUrl && (
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <a href={settings.ecommerceUrl} target="_blank" rel="noopener noreferrer" className="gap-1 text-xs">
                  <ExternalLink size={13} /> {t("cta.visitStore")}
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild><Link to="/login">{t("nav.login")}</Link></Button>
            <Button size="sm" asChild><Link to="/register">{t("nav.register")}</Link></Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 py-10 lg:py-16 grid lg:grid-cols-2 gap-8 items-center">
          <motion.div {...fadeUp}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
              {t("hero.badge")}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-1">
              {t("brand.name")}
            </h1>
            <h2 className="text-base text-primary font-semibold mb-3">{t("hero.title")}</h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-lg leading-relaxed">
              {settings.subtitle_mr && language === "mr" ? settings.subtitle_mr : settings.subtitle_en || t("hero.subtitle")}
            </p>

            {/* Introduction — inline below subtitle */}
            <div className="border-l-4 border-primary pl-4 mb-6 space-y-2 max-w-lg">
              <p className="text-sm text-muted-foreground leading-relaxed">{t("intro.body1")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("intro.body2")}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild >
                <a href="https://app.mahaamrut.org.in/amrut-new/apply/284" target="_blank" rel="noopener noreferrer">
                  {t("apply.now")} <ArrowRight size={16} className="ml-1" />
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }} className="hidden lg:block rounded-xl overflow-hidden shadow-xl border aspect-[4/3]">
            <LoginSlideshow images={sliderImages} />
          </motion.div>
        </div>
      </section>

      {/* ── Book Stall CTA ─────────────────────────────────────── */}
      <section className="border-y bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <motion.div {...fadeUp} className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border bg-card/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Ticket size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{t("cta.bookNow")}</h3>
                <p className="text-xs text-muted-foreground">{t("features.availability.desc")}</p>
              </div>
            </div>
            <Button asChild>
              <Link to="/login?redirect=/book-stall">{t("cta.checkAvailability")} <ArrowRight size={14} className="ml-1" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div {...stagger} className="grid grid-cols-3 gap-6">
            {stats.map((stat) => (
              <motion.div key={stat.label} {...fadeUp} className="text-center">
                <stat.icon size={24} className="mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Exhibitions ────────────────────────────────────────── */}
      <LandingExhibitions language={language} />

      {/* ── Objectives ─────────────────────────────────────────── */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <motion.div {...fadeUp} className="text-center mb-6">
            <SectionBadge tk="objectives.label" />
            <h2 className="text-2xl font-bold text-foreground">{t("objectives.heading")}</h2>
          </motion.div>
          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {objectives.map((obj, i) => (
              <motion.div key={i} {...fadeUp}>
                <Card className="h-full hover:shadow-md hover:-translate-y-0.5 transition-all border-l-4 border-l-primary">
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{T(obj)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Photo Gallery ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <motion.div {...fadeUp} className="text-center mb-6">
          <SectionBadge tk="gallery.label" />
          <h2 className="text-2xl font-bold text-foreground mb-1">{t("gallery.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("gallery.subheading")}</p>
        </motion.div>
        <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...MARKET_PHOTOS, ...galleryImages.slice(0, 4)].map((src, i) => (
            <motion.div key={i} {...fadeUp} className="rounded-lg overflow-hidden aspect-square bg-muted">
              <img
                src={src}
                alt={`Amrut Peth ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Key Features ───────────────────────────────────────── */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <motion.div {...fadeUp} className="text-center mb-6">
            <SectionBadge tk="features.label" />
            <h2 className="text-2xl font-bold text-foreground mb-1">{t("features.heading")}</h2>
            <p className="text-sm text-muted-foreground">{t("features.subheading")}</p>
          </motion.div>
          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {features.map((f) => (
              <motion.div key={f.title} {...fadeUp}>
                <Card className="h-full hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <f.icon size={20} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <motion.div {...fadeUp} className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
            {keyFeatures.map((kf, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span className="text-foreground">{T(kf)}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Products ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <motion.div {...fadeUp} className="text-center mb-6">
          <SectionBadge tk="products.label" />
          <h2 className="text-2xl font-bold text-foreground mb-1">{t("products.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("products.sub")}</p>
        </motion.div>
        <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {products.map((p, i) => (
            <motion.div key={i} {...fadeUp}>
              <Card className="h-full text-center hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <CardContent className="p-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                    <p.icon size={20} className="text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{T(p)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Booking Process ────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/10 border-y">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <motion.div {...fadeUp} className="text-center mb-6">
            <SectionBadge tk="process.label" />
            <h2 className="text-2xl font-bold text-foreground mb-1">{t("process.heading")}</h2>
            <p className="text-sm text-muted-foreground">{t("process.sub")}</p>
          </motion.div>
          <motion.div {...stagger} className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-6">
            {bookingSteps.map((s, i) => (
              <motion.div key={i} {...fadeUp} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-lg font-bold text-primary-foreground">{s.num}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{t(s.key)}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div {...fadeUp} className="text-center">
            <Button asChild>
              <Link to="/register">{t("process.register")} <ArrowRight size={14} className="ml-1" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Seller Facilities ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <motion.div {...fadeUp} className="text-center mb-6">
          <SectionBadge tk="facilities.label" />
          <h2 className="text-2xl font-bold text-foreground mb-1">{t("facilities.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("facilities.sub")}</p>
        </motion.div>
        <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {sellerFacilities.map((f, i) => (
            <motion.div key={i} {...fadeUp}>
              <Card className="h-full hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <f.icon size={18} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{T(f)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Beneficiaries ──────────────────────────────────────── */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <motion.div {...fadeUp} className="text-center mb-6">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
              {language === "mr" ? "लाभार्थी" : "Beneficiaries"}
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              {language === "mr" ? "नोंदणीकृत लाभार्थी" : "Registered Beneficiaries"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "mr"
                ? "अमृत पेठ योजनेतील नोंदणीकृत लाभार्थ्यांची यादी"
                : "List of beneficiaries registered under the AMRUT Peth scheme"}
            </p>
          </motion.div>

          <motion.div {...fadeUp}>
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                        {language === "mr" ? "नाव" : "Name"}
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Exhibition Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benLoading && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                          <Loader2 size={20} className="animate-spin inline-block mr-2" />
                          {language === "mr" ? "लोड होत आहे…" : "Loading…"}
                        </td>
                      </tr>
                    )}
                    {!benLoading && benList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground text-sm">
                          {language === "mr" ? "कोणतेही लाभार्थी नोंदणीकृत नाहीत." : "No beneficiaries registered yet."}
                        </td>
                      </tr>
                    )}
                    {!benLoading && benList.map((b, idx) => (
                      <tr key={b.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground">{benPage * BEN_PAGE_SIZE + idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{b.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{b.exhibitionDate || "-"}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-[260px] truncate" title={b.address}>{b.address || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              {benTotal > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
                  <span className="text-xs text-muted-foreground">
                    {language === "mr"
                      ? `${benPage * BEN_PAGE_SIZE + 1}–${Math.min((benPage + 1) * BEN_PAGE_SIZE, benTotal)} / ${benTotal} लाभार्थी`
                      : `Showing ${benPage * BEN_PAGE_SIZE + 1}–${Math.min((benPage + 1) * BEN_PAGE_SIZE, benTotal)} of ${benTotal} beneficiaries`}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBenPage((p) => p - 1)}
                      disabled={benPage === 0 || benLoading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    {Array.from({ length: Math.min(benTotalPages, 5) }, (_, i) => {
                      const p = benTotalPages <= 5 ? i
                        : benPage < 3 ? i
                        : benPage > benTotalPages - 4 ? benTotalPages - 5 + i
                        : benPage - 2 + i;
                      return (
                        <Button
                          key={p}
                          variant={p === benPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBenPage(p)}
                          disabled={benLoading}
                          className="h-8 w-8 p-0 text-xs"
                        >
                          {p + 1}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBenPage((p) => p + 1)}
                      disabled={benPage >= benTotalPages - 1 || benLoading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <motion.div {...fadeUp} className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 lg:p-12 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-2">{t("cta.heading")}</h2>
          <p className="text-primary-foreground/80 mb-6 text-sm max-w-md mx-auto">{t("cta.subheading")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild className="bg-background text-primary hover:bg-background/90 font-semibold shadow-md">
              <Link to="/register">{t("cta.register")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold">
              <Link to="/login">{t("cta.signIn")}</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <img src={logoIcon} alt="Amrut" className="w-7 h-7 rounded object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div>
                  <p className="font-bold text-sm text-foreground leading-tight">अमृत पेठ</p>
                  <p className="text-xs text-muted-foreground">{t("nav.brand")}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {settings.description || t("footer.about")}
              </p>
              <div className="flex items-center gap-2">
                {[
                  { href: "https://www.facebook.com/MahaAmrutOfficial", icon: SvgFacebook,  hover: "hover:text-blue-600 hover:bg-blue-50" },
                  { href: "https://x.com/Maha_Amrut",                   icon: SvgTwitter,   hover: "hover:text-sky-500 hover:bg-sky-50" },
                  { href: "https://www.instagram.com/amrutpeth/",        icon: SvgInstagram, hover: "hover:text-pink-600 hover:bg-pink-50" },
                  { href: "https://www.youtube.com/@MahaAmrutPune",      icon: SvgYoutube,   hover: "hover:text-red-600 hover:bg-red-50" },
                ].map(({ href, icon: Icon, hover }) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                    className={`w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-colors ${hover}`}>
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">{t("footer.quickLinks")}</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><Link to="/login" className="hover:text-primary transition-colors">{t("nav.login")}</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">{t("nav.register")}</Link></li>
                <li><a href="https://amrutpeth.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t("footer.store")}</a></li>
                <li><a href="https://mahaamrut.org.in/coordinators-contact" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t("footer.viewContact")}</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">{t("footer.contact")}</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="leading-relaxed">{settings.address || "Maharaja Sayajirao Gaikwad Udyog Bhavan, Fifth Floor, Aundh, Pune 411067"}</li>
                <li><a href={`tel:${settings.phone || "+919730151450"}`} className="hover:text-primary transition-colors">{settings.phone || "+91 9730151450"}</a></li>
                <li><a href={`mailto:${settings.email || "info@mahaamrut.org.in"}`} className="hover:text-primary transition-colors">{settings.email || "info@mahaamrut.org.in"}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-6 pt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} अमृत पेठ — {t("footer.rights")}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
