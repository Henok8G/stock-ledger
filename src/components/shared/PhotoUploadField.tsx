import { Upload, X } from "lucide-react";

interface PhotoUploadFieldProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export default function PhotoUploadField({ files, onChange }: PhotoUploadFieldProps) {
  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    onChange([...files, ...newFiles]);
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground mb-1 block">Photos</label>
      <div className="flex flex-wrap gap-2">
        {files.map((file, i) => (
          <div key={i} className="relative w-16 h-14 rounded-md overflow-hidden border border-border group">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-0.5 right-0.5 p-0.5 rounded bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        <label className="flex items-center justify-center w-16 h-14 rounded-md border border-dashed border-border bg-accent/30 cursor-pointer hover:bg-accent/50 transition-colors">
          <Upload className="w-4 h-4 text-muted-foreground" />
          <input type="file" accept="image/*" multiple onChange={handleAdd} className="hidden" />
        </label>
      </div>
    </div>
  );
}
