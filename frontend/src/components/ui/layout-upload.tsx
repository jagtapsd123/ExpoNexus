import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Eye, Trash2, Image } from "lucide-react";

interface LayoutUploadProps {
  layoutImage?: string;
  layoutHistory?: string[];
  canUpload: boolean;
  canDelete: boolean;
  onUpload: (file: File, previewUrl: string) => void;
  onDelete: () => void;
}

export function LayoutUpload({ layoutImage, layoutHistory = [], canUpload, canDelete, onUpload, onDelete }: LayoutUploadProps) {
  const [viewOpen, setViewOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    onUpload(file, previewUrl);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {canUpload && (
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <Button variant="outline" size="sm" asChild>
              <span><Upload size={14} className="mr-1" /> {layoutImage ? "Replace Layout" : "Upload Layout"}</span>
            </Button>
          </label>
        )}
        {layoutImage && (
          <Button variant="outline" size="sm" onClick={() => setViewOpen(true)}>
            <Eye size={14} className="mr-1" /> View Layout
          </Button>
        )}
        {layoutImage && canDelete && (
          <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 size={14} className="mr-1" /> Remove
          </Button>
        )}
      </div>

      {layoutImage && (
        <div className="rounded-lg border border-border overflow-hidden">
          <img src={layoutImage} alt="Exhibition layout" className="w-full h-40 object-cover" />
        </div>
      )}

      {/* View modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Exhibition Layout</DialogTitle>
          </DialogHeader>
          {layoutImage && <img src={layoutImage} alt="Exhibition layout" className="w-full rounded-lg" />}
          {layoutHistory.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><Image size={14} /> Previous Layouts</h4>
              <div className="grid grid-cols-3 gap-2">
                {layoutHistory.map((img, i) => (
                  <img key={i} src={img} alt={`Previous layout ${i + 1}`} className="w-full h-20 object-cover rounded border border-border" />
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
