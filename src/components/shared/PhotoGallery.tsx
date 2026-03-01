import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Upload, Trash2 } from "lucide-react";
import { useProductPhotos, useUploadProductPhotos, useDeleteProductPhoto, getPhotoUrl } from "@/hooks/useProductPhotos";
import { useAuth } from "@/hooks/useAuth";

interface PhotoGalleryProps {
  productId: string;
  allowUpload?: boolean;
}

export default function PhotoGallery({ productId, allowUpload = false }: PhotoGalleryProps) {
  const { data: photos = [] } = useProductPhotos(productId);
  const uploadPhotos = useUploadProductPhotos();
  const deletePhoto = useDeleteProductPhoto();
  const { role } = useAuth();
  const [fullscreen, setFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      uploadPhotos.mutate({ productId, files });
    }
    e.target.value = "";
  };

  const openFullscreen = (index: number) => {
    setCurrentIndex(index);
    setFullscreen(true);
  };

  const navigate = (dir: number) => {
    setCurrentIndex((prev) => (prev + dir + photos.length) % photos.length);
  };

  if (photos.length === 0 && !allowUpload) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Photos ({photos.length})</span>
        {(allowUpload || role === "owner") && (
          <label className="flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer">
            <Upload className="w-3 h-3" /> Upload
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="relative shrink-0 w-20 h-16 rounded-md overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => openFullscreen(i)}
            >
              <img
                src={getPhotoUrl(photo.file_path)}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {role === "owner" && (
                <button
                  onClick={(e) => { e.stopPropagation(); deletePhoto.mutate({ id: photo.id, filePath: photo.file_path, productId }); }}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete photo"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadPhotos.isPending && (
        <div className="text-xs text-muted-foreground animate-pulse">Uploading…</div>
      )}

      {/* Fullscreen overlay */}
      {fullscreen && photos.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setFullscreen(false)}>
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10" aria-label="Close">
            <X className="w-5 h-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={getPhotoUrl(photos[currentIndex].file_path)}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {photos.length > 1 && (
            <div className="absolute bottom-6 flex gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
