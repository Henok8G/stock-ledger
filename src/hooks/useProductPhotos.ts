import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ProductPhoto {
  id: string;
  product_id: string;
  file_path: string;
  created_at: string;
}

export function useProductPhotos(productId?: string) {
  return useQuery({
    queryKey: ["product-photos", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_photos")
        .select("*")
        .eq("product_id", productId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ProductPhoto[];
    },
  });
}

export function useUploadProductPhotos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, files }: { productId: string; files: File[] }) => {
      const uploaded: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("product-photos")
          .upload(path, file);
        if (uploadErr) throw uploadErr;

        const { error: dbErr } = await supabase
          .from("product_photos")
          .insert({ product_id: productId, file_path: path });
        if (dbErr) throw dbErr;
        uploaded.push(path);
      }
      return uploaded;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["product-photos", vars.productId] });
      toast({ title: "Photos Uploaded", description: "Photos saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Upload Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteProductPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, filePath, productId }: { id: string; filePath: string; productId: string }) => {
      await supabase.storage.from("product-photos").remove([filePath]);
      const { error } = await supabase.from("product_photos").delete().eq("id", id);
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      qc.invalidateQueries({ queryKey: ["product-photos", productId] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function getPhotoUrl(filePath: string) {
  const { data } = supabase.storage.from("product-photos").getPublicUrl(filePath);
  return data.publicUrl;
}
