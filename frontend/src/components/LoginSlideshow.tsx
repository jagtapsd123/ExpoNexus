import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const SLIDES = [
  {
    gradient: "from-orange-800 via-orange-700 to-amber-600",
    mr: "थेट बाजारपेठ व्यवस्थापन",
    en: "Direct Market Management",
  },
  {
    gradient: "from-red-900 via-orange-800 to-orange-700",
    mr: "स्थानिक उत्पादकांना संधी",
    en: "Opportunity for Local Producers",
  },
  {
    gradient: "from-amber-800 via-orange-700 to-yellow-700",
    mr: "स्टॉल बुकिंग सहजपणे",
    en: "Stall Booking Made Easy",
  },
  {
    gradient: "from-orange-900 via-red-800 to-orange-700",
    mr: "डिजिटल बाजारपेठ",
    en: "Digital Marketplace",
  },
];

export function LoginSlideshow({ images }: { images?: string[] }) {
  const { language } = useLanguage();
  const [index, setIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  // Try to use admin-uploaded images; fall back to gradient slides
  useEffect(() => {
    if (!images || images.length === 0) return;
    const valid: string[] = [];
    let pending = images.length;
    images.forEach((src) => {
      const img = new Image();
      img.onload  = () => { valid.push(src); if (--pending === 0) setLoadedImages(valid); };
      img.onerror = () => { if (--pending === 0) setLoadedImages(valid); };
      img.src = src;
    });
  }, [images]);

  const hasImages = loadedImages.length > 0;
  const count     = hasImages ? loadedImages.length : SLIDES.length;

  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % count), 4500);
    return () => clearInterval(t);
  }, [count]);

  const slide = SLIDES[index % SLIDES.length];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {/* Gradient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>

      {/* Uploaded image overlay (if available) */}
      {hasImages && (
        <AnimatePresence mode="wait">
          <motion.img
            key={`img-${index}`}
            src={loadedImages[index % loadedImages.length]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10">
        <motion.div
          key={`text-${index}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">
            अमृत पेठ
          </h2>
          <p className="text-base text-white/90 font-medium">
            {language === "mr" ? slide.mr : slide.en}
          </p>
          <p className="text-xs text-white/60 mt-1">
            {language === "mr" ? "AMRUT Peth Stall Booking" : "अमृत पेठ स्टॉल बुकिंग"}
          </p>
        </motion.div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "bg-white w-5" : "bg-white/40 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
