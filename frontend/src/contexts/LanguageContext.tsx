import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Language = "en" | "mr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const en: Record<string, string> = {
  "brand.name": "Amrut Peth Direct Market",
  "brand.name.short": "Amrut Peth",
  "nav.brand": "Stall Booking System",
  "apply.now": "Apply Now",
  "apply.scheme": "Apply for Stall Scheme",
  "nav.login": "Login",
  "nav.register": "Register",
  "lang.switch": "मराठी",

  "hero.badge": "Direct Market Management",
  "hero.title": "AMRUT Peth Stall Booking Platform",
  "hero.subtitle": "Manage exhibitions, stalls, and bookings efficiently — all in one place.",
  "hero.getStarted": "Get Started",
  "hero.createAccount": "Create Account",

  "intro.label": "Introduction",
  "intro.heading": "Amrut Peth Direct Market Management",
  "intro.body1": "The Amrut Peth Direct Market Management scheme provides a digital and physical marketplace for local producers, farmers, self-employed entrepreneurs, and artisans to directly sell their products.",
  "intro.body2": "Through this initiative, producers get the opportunity to market their products directly to customers, reducing intermediaries and giving both producers more benefit and customers quality products at reasonable prices.",

  "objectives.label": "Objectives",
  "objectives.heading": "Our Objectives",

  "gallery.label": "Photo Gallery",
  "gallery.heading": "Exhibition Showcase",
  "gallery.subheading": "Glimpses from Amrut Peth markets",

  "features.label": "Features",
  "features.heading": "Why AMRUT Peth?",
  "features.keyheading": "Key Features",
  "features.subheading": "Everything you need to manage exhibitions and stall bookings seamlessly.",
  "features.booking.title": "Easy Stall Booking",
  "features.booking.desc": "Browse available stalls and book in minutes with our intuitive wizard.",
  "features.availability.title": "Real-time Availability",
  "features.availability.desc": "See live stall status across all exhibitions — no double bookings.",
  "features.access.title": "Role-based Access",
  "features.access.desc": "Admins, organizers, and exhibitors each get tailored dashboards.",
  "features.invoices.title": "Automated Invoices",
  "features.invoices.desc": "GST-compliant invoices generated instantly for every booking.",

  "products.label": "Products",
  "products.heading": "Available Products",
  "products.sub": "The following types of products are available in this marketplace",

  "process.label": "Process",
  "process.heading": "Stall Booking Process",
  "process.sub": "Simple 3-step process to book your stall",
  "process.step1": "Register on AMRUT Portal",
  "process.step2": "Login to your account",
  "process.step3": "Complete the stall booking process",
  "process.register": "Register Now",

  "facilities.label": "Facilities",
  "facilities.heading": "Facilities for Sellers",
  "facilities.sub": "Facilities provided to sellers / exhibitors",

  "stats.exhibitors": "Exhibitors",
  "stats.exhibitions": "Exhibitions",
  "stats.districts": "Districts",

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
  "footer.store": "AmrutPeth Store",
  "footer.viewContact": "View Contact",

  "availability.title": "Stall Availability",
  "availability.selectExhibition": "Select Exhibition",
  "availability.total": "Total",
  "availability.available": "Available",
  "availability.booked": "Booked",
  "availability.proceed": "Proceed to Booking",
  "availability.noActive": "No active exhibitions available",
};

const mr: Record<string, string> = {
  "brand.name": "अमृत पेठ थेट बाजारपेठ",
  "brand.name.short": "अमृत पेठ",
  "nav.brand": "स्टॉल बुकिंग प्रणाली",
  "apply.now": "अर्ज करा",
  "apply.scheme": "स्टॉल योजनेसाठी अर्ज करा",
  "nav.login": "लॉगिन",
  "nav.register": "नोंदणी करा",
  "lang.switch": "English",

  "hero.badge": "थेट बाजारपेठ व्यवस्थापन",
  "hero.title": "अमृत पेठ स्टॉल बुकिंग प्लॅटफॉर्म",
  "hero.subtitle": "प्रदर्शने, स्टॉल आणि बुकिंग कार्यक्षमतेने व्यवस्थापित करा — सर्व एकाच ठिकाणी.",
  "hero.getStarted": "सुरू करा",
  "hero.createAccount": "खाते तयार करा",

  "intro.label": "परिचय",
  "intro.heading": "अमृत पेठ थेट बाजारपेठ व्यवस्थापन",
  "intro.body1": "अमृत पेठ थेट बाजारपेठ व्यवस्थापन ही योजना स्थानिक उत्पादक, शेतकरी, स्वयंरोजगार करणारे उद्योजक आणि कारागीर यांना त्यांच्या उत्पादनांची थेट विक्री करण्यासाठी एक डिजिटल आणि भौतिक बाजारपेठ उपलब्ध करून देण्यासाठी राबविण्यात येत आहे.",
  "intro.body2": "या उपक्रमाच्या माध्यमातून उत्पादकांना त्यांच्या उत्पादनांचे थेट ग्राहकांपर्यंत विपणन करण्याची संधी मिळते. यामुळे मध्यस्थांची संख्या कमी होऊन उत्पादकांना अधिक लाभ मिळतो तसेच ग्राहकांना दर्जेदार उत्पादने वाजवी दरात उपलब्ध होतात.",

  "objectives.label": "उद्दिष्टे",
  "objectives.heading": "आमची उद्दिष्टे",

  "gallery.label": "फोटो गॅलरी",
  "gallery.heading": "प्रदर्शन शोकेस",
  "gallery.subheading": "अमृत पेठ बाजारपेठांमधील झलक",

  "features.label": "वैशिष्ट्ये",
  "features.heading": "अमृत पेठ का?",
  "features.keyheading": "प्रमुख वैशिष्ट्ये",
  "features.subheading": "प्रदर्शने आणि स्टॉल बुकिंग सुलभपणे व्यवस्थापित करण्यासाठी आवश्यक सर्व काही.",
  "features.booking.title": "सोपे स्टॉल बुकिंग",
  "features.booking.desc": "आमच्या सहज विझार्डने उपलब्ध स्टॉल ब्राउझ करा आणि मिनिटांत बुक करा.",
  "features.availability.title": "रिअल-टाइम उपलब्धता",
  "features.availability.desc": "सर्व प्रदर्शनांमध्ये लाइव्ह स्टॉल स्थिती पहा — डबल बुकिंग नाही.",
  "features.access.title": "भूमिका-आधारित प्रवेश",
  "features.access.desc": "प्रशासक, आयोजक आणि प्रदर्शकांना प्रत्येकी अनुकूल डॅशबोर्ड मिळतात.",
  "features.invoices.title": "स्वयंचलित बिले",
  "features.invoices.desc": "प्रत्येक बुकिंगसाठी GST-अनुरूप बिले तात्काळ तयार होतात.",

  "products.label": "उत्पादने",
  "products.heading": "उपलब्ध उत्पादने",
  "products.sub": "या बाजारपेठेत खालील प्रकारची उत्पादने उपलब्ध असू शकतात",

  "process.label": "प्रक्रिया",
  "process.heading": "स्टॉल बुकिंग प्रक्रिया",
  "process.sub": "स्टॉल बुक करण्यासाठी सोपी ३-पायरी प्रक्रिया",
  "process.step1": "अमृत पोर्टलवर नोंदणी करा",
  "process.step2": "लॉगिन करा",
  "process.step3": "स्टॉल बुकिंग प्रक्रिया पूर्ण करा",
  "process.register": "नोंदणी करा",

  "facilities.label": "सुविधा",
  "facilities.heading": "विक्रेत्यांसाठी सुविधा",
  "facilities.sub": "विक्रेते / प्रदर्शकांना पुरविल्या जाणाऱ्या सुविधा",

  "stats.exhibitors": "प्रदर्शक",
  "stats.exhibitions": "प्रदर्शने",
  "stats.districts": "जिल्हे",

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
  "footer.store": "अमृतपेठ स्टोअर",
  "footer.viewContact": "संपर्क पहा",

  "availability.title": "स्टॉल उपलब्धता",
  "availability.selectExhibition": "प्रदर्शन निवडा",
  "availability.total": "एकूण",
  "availability.available": "उपलब्ध",
  "availability.booked": "बुक केलेले",
  "availability.proceed": "बुकिंगसाठी पुढे जा",
  "availability.noActive": "सध्या कोणतीही सक्रिय प्रदर्शने उपलब्ध नाहीत",
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
