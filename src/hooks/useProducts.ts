import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: {
      name: string;
      brand: string;
      category: string;
      description: string;
      qty_in_stock: number;
      buying_price: number;
      date_of_entry: string;
    }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      // Generate SKU
      const { data: sku, error: skuErr } = await supabase.rpc("generate_sku", {
        p_category: product.category,
        p_brand: product.brand,
        p_name: product.name,
      });
      if (skuErr) throw skuErr;

      const { data, error } = await supabase
        .from("products")
        .insert({
          name: product.name,
          sku: sku as string,
          brand: product.brand,
          category: product.category,
          description: product.description,
          qty_in_stock: product.qty_in_stock,
          buying_price: product.buying_price,
          date_of_entry: product.date_of_entry,
          created_by: userId,
        })
        .select()
        .single();
      if (error) throw error;

      // Also create a corresponding import record so it appears in the Imported page
      const { data: importRec, error: impErr } = await supabase
        .from("import_records")
        .insert({
          supplier: "Direct Entry",
          date: product.date_of_entry,
          entered_by: userId,
        })
        .select()
        .single();

      if (!impErr && importRec) {
        await supabase.from("import_line_items").insert({
          import_id: importRec.id,
          product_name: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description,
          qty: product.qty_in_stock,
          unit_buying_price: product.buying_price,
        });
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["imports"] });
      toast({ title: "Product Added", description: "Product has been saved." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"products"> & { id: string }) => {
      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Updated", description: "Product updated." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
      toast({ title: "Deleted", description: "Product deleted. Sales history preserved." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
