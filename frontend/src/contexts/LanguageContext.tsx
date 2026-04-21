import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Language = "en" | "mr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const en: Record<string, string> = {
  "hero.title": "AMRUT Peth Stall Booking Platform",
  "hero.subtitle": "Manage exhibitions, stalls, and bookings efficiently — all in one place.",
  "hero.getStarted": "Get Started",
  "hero.createAccount": "Create Account",
  "nav.login": "Login",
  "nav.register": "Register",
  "features.heading": "Why AMRUT Peth?",
  "features.subheading": "Everything you need to manage exhibitions and stall bookings seamlessly.",
  "features.booking.title": "Easy Stall Booking",
  "features.booking.desc": "Browse available stalls and book in minutes with our intuitive wizard.",
  "features.availability.title": "Real-time Availability",
  "features.availability.desc": "See live stall status across all exhibitions — no double bookings.",
  "features.access.title": "Role-based Access",
  "features.access.desc": "Admins, organizers, and exhibitors each get tailored dashboards.",
  "features.invoices.title": "Automated Invoices",
  "features.invoices.desc": "GST-compliant invoices generated instantly for every booking.",
  "stats.exhibitors": "Exhibitors",
  "stats.exhibitions": "Exhibitions",
  "stats.districts": "Districts",
  "gallery.heading": "Exhibition Showcase",
  "gallery.subheading": "Glimpses from our past exhibitions",
  "cta.heading": "Ready to Book Your Stall?",
  "cta.subheading": "Join hundreds of exhibitors on the AMRUT Peth platform today.",
  "cta.register": "Register Now",
  "cta.signIn": "Sign In",
  "cta.bookNow": "Book Your Stall Now",
  "cta.checkAvailability": "Check Availability",
  "cta.visitStore": "Visit AmrutPeth Store",
  "footer.about": "Direct Market Management & Stall Booking System for exhibitions across Maharashtra.",
  "footer.quickLinks": "Quick Links",
  "footer.contact": "Contact",
  "footer.rights": "All rights reserved.",
  "availability.title": "Stall Availability",
  "availability.selectExhibition": "Select Exhibition",
  "availability.total": "Total",
  "availability.available": "Available",
  "availability.booked": "Booked",
  "availability.proceed": "Proceed to Booking",
  "availability.noActive": "No active exhibitions available",
  "lang.switch": "मराठी",
};

const mr: Record<string, string> = {
  "hero.title": "अमृत पेठ स्टॉल बुकिंग प्लॅटफॉर्म",
  "hero.subtitle": "प्रदर्शने, स्टॉल आणि बुकिंग कार्यक्षमतेने व्यवस्थापित करा — सर्व एकाच ठिकाणी.",
  "hero.getStarted": "सुरू करा",
  "hero.createAccount": "खाते तयार करा",
  "nav.login": "लॉगिन",
  "nav.register": "नोंदणी करा",
  "features.heading": "अमृत पेठ का?",
  "features.subheading": "प्रदर्शने आणि स्टॉल बुकिंग सुलभपणे व्यवस्थापित करण्यासाठी आवश्यक सर्व काही.",
  "features.booking.title": "सोपे स्टॉल बुकिंग",
  "features.booking.desc": "आमच्या सहज विझार्डने उपलब्ध स्टॉल ब्राउझ करा आणि मिनिटांत बुक करा.",
  "features.availability.title": "रिअल-टाइम उपलब्धता",
  "features.availability.desc": "सर्व प्रदर्शनांमध्ये लाइव्ह स्टॉल स्थिती पहा — डबल बुकिंग नाही.",
  "features.access.title": "भूमिका-आधारित प्रवेश",
  "features.access.desc": "प्रशासक, आयोजक आणि प्रदर्शकांना प्रत्येकी अनुकूल डॅशबोर्ड मिळतात.",
  "features.invoices.title": "स्वयंचलित बिले",
  "features.invoices.desc": "प्रत्येक बुकिंगसाठी GST-अनुरूप बिले तात्काळ तयार होतात.",
  "stats.exhibitors": "प्रदर्शक",
  "stats.exhibitions": "प्रदर्शने",
  "stats.districts": "जिल्हे",
  "gallery.heading": "प्रदर्शन शोकेस",
  "gallery.subheading": "आमच्या मागील प्रदर्शनांमधील झलक",
  "cta.heading": "तुमचा स्टॉल बुक करायला तयार आहात?",
  "cta.subheading": "आजच अमृत पेठ प्लॅटफॉर्मवर शेकडो प्रदर्शकांसोबत सामील व्हा.",
  "cta.register": "आता नोंदणी करा",
  "cta.signIn": "साइन इन करा",
  "cta.bookNow": "आता तुमचा स्टॉल बुक करा",
  "cta.checkAvailability": "उपलब्धता तपासा",
  "cta.visitStore": "अमृतपेठ स्टोअर भेट द्या",
  "footer.about": "महाराष्ट्रातील प्रदर्शनांसाठी थेट बाजार व्यवस्थापन आणि स्टॉल बुकिंग प्रणाली.",
  "footer.quickLinks": "जलद दुवे",
  "footer.contact": "संपर्क",
  "footer.rights": "सर्व हक्क राखीव.",
  "availability.title": "स्टॉल उपलब्धता",
  "availability.selectExhibition": "प्रदर्शन निवडा",
  "availability.total": "एकूण",
  "availability.available": "उपलब्ध",
  "availability.booked": "बुक केलेले",
  "availability.proceed": "बुकिंगसाठी पुढे जा",
  "availability.noActive": "सध्या कोणतीही सक्रिय प्रदर्शने उपलब्ध नाहीत",
  "lang.switch": "English",
};

const translations: Record<Language, Record<string, string>> = { en, mr };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLang] = useState<Language>(() => {
    return (localStorage.getItem("amrut_lang") as Language) || "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    localStorage.setItem("amrut_lang", lang);
  }, []);

  const t = useCallback(
    (key: string) => translations[language][key] || translations.en[key] || key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
