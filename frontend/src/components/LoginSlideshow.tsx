import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const defaultImages = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
];

export function LoginSlideshow({ images }: { images?: string[] }) {
  const slides = images && images.length > 0 ? images : defaultImages;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-primary">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={slides[index]}
          alt="AMRUT Exhibition"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 z-10">
        <h1 className="text-5xl font-bold text-white mb-4">AMRUT</h1>
        <p className="text-lg text-white/90">Peth Direct Market Management</p>
        <p className="text-sm text-white/70 mt-2">Stall Booking System</p>

        {/* Dots */}
        <div className="flex gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index ? "bg-white w-6" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
