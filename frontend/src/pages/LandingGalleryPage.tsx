import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Trash2, Image, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { api, ApiError } from "@/lib/apiClient";
import { config } from "@/config/env";

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface GalleryImageItem {
  id?: number;
  url: string;
}

interface UploadResponse {
  id?: number;
  url?: string;
}

const LandingGalleryPage = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadGallery = async () => {
      setError("");
      try {
        const response = await api.get<ApiResponse<string[]>>("/landing/gallery");
        if (!cancelled) {
          setImages((response.data ?? []).map((url) => ({ url })));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load landing gallery");
        }
      }
    };

    void loadGallery();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!user || user.role !== "admin") return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      const token = localStorage.getItem("amrut_auth_token");
      const uploadedItems: GalleryImageItem[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${config.apiBaseUrl}/landing/gallery`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new ApiError(payload?.message || "Failed to upload gallery image", response.status, payload);
        }

        uploadedItems.push({
          id: payload?.data?.id,
          url: payload?.data?.url,
        });
      }

      setImages((prev) => [...uploadedItems.filter((item) => item.url), ...prev]);
      toast.success(`${uploadedItems.length} image(s) uploaded to landing gallery`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload gallery image");
    } finally {
      e.target.value = "";
    }
  };

  const handleRemove = async (image: GalleryImageItem, index: number) => {
    if (!image.id) {
      toast.error("This image can be viewed, but delete is unavailable until the backend returns gallery IDs on list.");
      return;
    }

    try {
      await api.delete<ApiResponse<void>>(`/landing/gallery/${image.id}`);
      setImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
      toast.success("Image removed");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove image");
    }
  };

  return (
    <div>
      <PageHeader
        title="Landing Page Gallery"
        description="Manage images displayed on the login page slideshow"
        actions={
          <label className="cursor-pointer">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
            <Button asChild>
              <span><Upload size={16} className="mr-1" /> Upload Images</span>
            </Button>
          </label>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <motion.div {...fadeIn}>
        {images.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Image size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No Images Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload images to customize the login page slideshow</p>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                <Button variant="outline" asChild>
                  <span><Upload size={16} className="mr-1" /> Upload Images</span>
                </Button>
              </label>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Card key={`${image.url}-${index}`} className="group relative overflow-hidden">
                <CardContent className="p-0">
                  <img src={image.url} alt={`Landing gallery ${index + 1}`} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button size="icon" variant="secondary" onClick={() => setPreviewImage(image.url)}>
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      disabled={!image.id}
                      onClick={() => void handleRemove(image, index)}
                      title={image.id ? "Delete image" : "Delete unavailable for previously uploaded images"}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Image Preview</DialogTitle></DialogHeader>
          {previewImage && <img src={previewImage} alt="Preview" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingGalleryPage;
