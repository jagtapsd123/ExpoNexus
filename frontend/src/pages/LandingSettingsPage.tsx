import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useLandingSettings, type LandingSettings } from "@/hooks/useLandingSettings";
import { api, ApiError } from "@/lib/apiClient";
import { config } from "@/config/env";

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

const mapSettingsToApi = (settings: LandingSettings): LandingSettingsApi => ({
  titleEn: settings.title_en,
  titleMr: settings.title_mr,
  subtitleEn: settings.subtitle_en,
  subtitleMr: settings.subtitle_mr,
  description: settings.description,
  phone: settings.phone,
  email: settings.email,
  address: settings.address,
  ecommerceUrl: settings.ecommerceUrl,
  statExhibitors: settings.statExhibitors,
  statExhibitions: settings.statExhibitions,
  statDistricts: settings.statDistricts,
  heroBackgroundUrl: settings.heroBackgroundUrl,
});

const mapApiToSettings = (data?: LandingSettingsApi): LandingSettings => ({
  title_en: data?.titleEn || "",
  title_mr: data?.titleMr || "",
  subtitle_en: data?.subtitleEn || "",
  subtitle_mr: data?.subtitleMr || "",
  description: data?.description || "",
  phone: data?.phone || "",
  email: data?.email || "",
  address: data?.address || "",
  ecommerceUrl: data?.ecommerceUrl || "",
  statExhibitors: data?.statExhibitors || "",
  statExhibitions: data?.statExhibitions || "",
  statDistricts: data?.statDistricts || "",
  heroBackgroundUrl: data?.heroBackgroundUrl || "",
});

const LandingSettingsPage = () => {
  const { user } = useAuth();
  const { settings, setSettings } = useLandingSettings();
  const [form, setForm] = useState<LandingSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  if (!user || user.role !== "admin") return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.put<ApiResponse<LandingSettingsApi>>("/landing/settings", mapSettingsToApi(form));
      const updated = mapApiToSettings(response.data);
      setForm(updated);
      setSettings(updated);
      toast.success("Landing page settings saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key: keyof LandingSettings, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleHeroBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("amrut_auth_token");
      const response = await fetch(`${config.apiBaseUrl}/landing/hero-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new ApiError(payload?.message || "Failed to upload hero image", response.status, payload);
      }

      const imageUrl = payload?.data?.url || "";
      setForm((prev) => ({ ...prev, heroBackgroundUrl: imageUrl }));
      setSettings((prev) => ({ ...prev, heroBackgroundUrl: imageUrl }));
      toast.success("Hero image uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload hero image");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div>
      <PageHeader
        title="Landing Page Settings"
        description="Control content displayed on the public landing page"
        actions={
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            <Save size={16} className="mr-1" /> {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        }
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Content (English)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Title</Label><Input value={form.title_en} onChange={(e) => set("title_en", e.target.value)} /></div>
            <div><Label>Subtitle</Label><Textarea value={form.subtitle_en} onChange={(e) => set("subtitle_en", e.target.value)} rows={2} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Content (Marathi)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Title (Marathi)</Label><Input value={form.title_mr} onChange={(e) => set("title_mr", e.target.value)} /></div>
            <div><Label>Subtitle (Marathi)</Label><Textarea value={form.subtitle_mr} onChange={(e) => set("subtitle_mr", e.target.value)} rows={2} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Statistics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Exhibitors Count</Label><Input value={form.statExhibitors} onChange={(e) => set("statExhibitors", e.target.value)} /></div>
            <div><Label>Exhibitions Count</Label><Input value={form.statExhibitions} onChange={(e) => set("statExhibitions", e.target.value)} /></div>
            <div><Label>Districts</Label><Input value={form.statDistricts} onChange={(e) => set("statDistricts", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Links & Media</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>E-commerce URL</Label><Input value={form.ecommerceUrl} onChange={(e) => set("ecommerceUrl", e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} /></div>
            <div>
              <Label>Hero Background Image</Label>
              <Input type="file" accept="image/*" onChange={handleHeroBg} />
              {form.heroBackgroundUrl && (
                <img src={form.heroBackgroundUrl} alt="Hero bg" className="mt-2 h-24 rounded-lg object-cover" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandingSettingsPage;
