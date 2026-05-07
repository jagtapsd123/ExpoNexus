import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface GalleryItem { id: number; url: string; }

export function useLandingGallery() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadGallery = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<ApiResponse<GalleryItem[]>>("/landing/gallery");
        if (!cancelled) {
          setImages((response.data ?? []).map((item) => item.url));
        }
      } catch {
        if (!cancelled) setImages([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadGallery();
    return () => { cancelled = true; };
  }, []);

  return { images, setImages, isLoading };
}
