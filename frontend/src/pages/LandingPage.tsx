import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoginSlideshow } from "@/components/LoginSlideshow";
import { useLandingGallery } from "@/hooks/useLandingGallery";
import { useLandingSettings } from "@/hooks/useLandingSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import logoIcon from "@/assets/amrut-logo.png";
import {
  CalendarCheck,
  LayoutGrid,
  ShieldCheck,
  FileText,
  Users,
  MapPin,
  Trophy,
  ArrowRight,
  Globe,
  ExternalLink,
  Ticket,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.12 } },
  viewport: { once: true },
};

const LandingPage = () => {
  const { images: galleryImages } = useLandingGallery();
  const { settings } = useLandingSettings();
  const { language, setLanguage, t } = useLanguage();

  const title = language === "mr" ? settings.title_mr : settings.title_en;
  const subtitle = language === "mr" ? settings.subtitle_mr : settings.subtitle_en;

  const features = [
    { icon: CalendarCheck, title: t("features.booking.title"), desc: t("features.booking.desc") },
    { icon: LayoutGrid, title: t("features.availability.title"), desc: t("features.availability.desc") },
    { icon: ShieldCheck, title: t("features.access.title"), desc: t("features.access.desc") },
    { icon: FileText, title: t("features.invoices.title"), desc: t("features.invoices.desc") },
  ];

  const stats = [
    { value: settings.statExhibitors, label: t("stats.exhibitors"), icon: Users },
    { value: settings.statExhibitions, label: t("stats.exhibitions"), icon: Trophy },
    { value: settings.statDistricts, label: t("stats.districts"), icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logoIcon} alt="Amrut Stall Booking System" className="w-14 h-14 rounded-lg object-contain shrink-0" />
            <span className="font-bold text-lg sm:text-xl text-foreground truncate">Amrut Stall Booking System</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "mr" : "en")}
              className="gap-1"
            >
              <Globe size={14} />
              {t("lang.switch")}
            </Button>
            {settings.ecommerceUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={settings.ecommerceUrl} target="_blank" rel="noopener noreferrer" className="gap-1">
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">{t("cta.visitStore")}</span>
                </a>
              </Button>
            )}
            <Button variant="ghost" asChild><Link to="/login">{t("nav.login")}</Link></Button>
            <Button asChild><Link to="/register">{t("nav.register")}</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {settings.heroBackgroundUrl ? (
          <div className="absolute inset-0">
            <img src={settings.heroBackgroundUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/70" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 pointer-events-none" />
        )}
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center relative">
          <motion.div {...fadeUp}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
              Direct Market Management
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">{subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                asChild
                className="shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link to="/login">{t("hero.getStarted")} <ArrowRight size={18} className="ml-1" /></Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-primary text-primary bg-background hover:bg-primary/10 hover:border-primary-hover hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Link to="/register">{t("hero.createAccount")}</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }} className="hidden lg:block rounded-2xl overflow-hidden shadow-xl border aspect-[4/3]">
            {galleryImages.length > 0 ? (
              <LoginSlideshow images={galleryImages} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid size={32} className="text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">AMRUT Peth</p>
                  <p className="text-sm text-muted-foreground">Stall Booking System</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Book Stall CTA */}
      <section className="border-y bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <motion.div {...fadeUp} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border bg-card/60 backdrop-blur shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Ticket size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{t("cta.bookNow")}</h3>
                <p className="text-sm text-muted-foreground">{t("features.availability.desc")}</p>
              </div>
            </div>
            <Button size="lg" asChild>
              <Link to="/login?redirect=/book-stall">
                {t("cta.checkAvailability")} <ArrowRight size={16} className="ml-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div {...staggerContainer} className="grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <motion.div key={stat.label} {...fadeUp} className="text-center">
                <stat.icon size={28} className="mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">{t("features.heading")}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">{t("features.subheading")}</p>
        </motion.div>
        <motion.div {...staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <motion.div key={f.title} {...fadeUp}>
              <Card className="h-full hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
                <CardContent className="p-6">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="bg-muted/30 border-y">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <motion.div {...fadeUp} className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-3">{t("gallery.heading")}</h2>
              <p className="text-muted-foreground">{t("gallery.subheading")}</p>
            </motion.div>
            <motion.div {...staggerContainer} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.slice(0, 8).map((img, i) => (
                <motion.div key={i} {...fadeUp} className="rounded-xl overflow-hidden aspect-square">
                  <img src={img} alt={`Exhibition ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <motion.div {...fadeUp} className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-10 lg:p-16 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-3">{t("cta.heading")}</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">{t("cta.subheading")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              asChild
              className="bg-background text-primary hover:bg-background/90 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold"
            >
              <Link to="/register">{t("cta.register")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:-translate-y-0.5 transition-all duration-200 font-semibold"
            >
              <Link to="/login">{t("cta.signIn")}</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={logoIcon} alt="Amrut" className="w-8 h-8 rounded-lg object-contain" />
                <span className="font-bold text-foreground">Amrut Stall Booking System</span>
              </div>
              <p className="text-sm text-muted-foreground">{settings.description || t("footer.about")}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">{t("footer.quickLinks")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-primary transition-colors">{t("nav.login")}</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">{t("nav.register")}</Link></li>
                {settings.ecommerceUrl && (
                  <li><a href={settings.ecommerceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t("cta.visitStore")}</a></li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">{t("footer.contact")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{settings.email}</li>
                <li>{settings.phone}</li>
                <li>{settings.address}</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Amrut Stall Booking System. {t("footer.rights")}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
