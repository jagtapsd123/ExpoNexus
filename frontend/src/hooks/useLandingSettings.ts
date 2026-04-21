import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

export interface LandingSettings {
  title_en: string;
  title_mr: string;
  subtitle_en: string;
  subtitle_mr: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  ecommerceUrl: string;
  statExhibitors: string;
  statExhibitions: string;
  statDistricts: string;
  heroBackgroundUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface LandingSettingsApi {
  titleEn?: string;
  titleMr?: string;
  subtitleEn?: string;
  subtitleMr?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  ecommerceUrl?: string;
  statExhibitors?: string;
  statExhibitions?: string;
  statDistricts?: string;
  heroBackgroundUrl?: string;
}

export const defaults: LandingSettings = {
  title_en: "AMRUT Peth Stall Booking Platform",
  title_mr: "AMRUT Peth Stall Booking Platform",
  subtitle_en: "Manage exhibitions, stalls, and bookings efficiently - all in one place.",
  subtitle_mr: "Manage exhibitions, stalls, and bookings efficiently - all in one place.",
  description: "Direct Market Management & Stall Booking System for exhibitions across Maharashtra.",
  phone: "+91 20 1234 5678",
  email: "support@amrutpeth.in",
  address: "Pune, Maharashtra",
  ecommerceUrl: "https://amrutpeth.com/",
  statExhibitors: "500+",
  statExhibitions: "50+",
  statDistricts: "36",
  heroBackgroundUrl: "",
};

const mapApiToSettings = (data?: LandingSettingsApi): LandingSettings => ({
  title_en: data?.titleEn || defaults.title_en,
  title_mr: data?.titleMr || defaults.title_mr,
  subtitle_en: data?.subtitleEn || defaults.subtitle_en,
  subtitle_mr: data?.subtitleMr || defaults.subtitle_mr,
  description: data?.description || defaults.description,
  phone: data?.phone || defaults.phone,
  email: data?.email || defaults.email,
  address: data?.address || defaults.address,
  ecommerceUrl: data?.ecommerceUrl || defaults.ecommerceUrl,
  statExhibitors: data?.statExhibitors || defaults.statExhibitors,
  statExhibitions: data?.statExhibitions || defaults.statExhibitions,
  statDistricts: data?.statDistricts || defaults.statDistricts,
  heroBackgroundUrl: data?.heroBackgroundUrl || defaults.heroBackgroundUrl,
});

export function useLandingSettings() {
  const [settings, setSettings] = useState<LandingSettings>(defaults);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<ApiResponse<LandingSettingsApi>>("/landing/settings");
        if (!cancelled) {
          setSettings(mapApiToSettings(response.data));
        }
      } catch {
        if (!cancelled) {
          setSettings(defaults);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, setSettings, isLoading, defaults };
}
