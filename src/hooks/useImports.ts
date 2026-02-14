import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type ImportRecord = Tables<"import_records"> & {
  import_line_items: Tables<"import_line_items">[];
};

export function useImports() {
  return useQuery({
    queryKey: ["imports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("import_records")
        .select("*, import_line_items(*)")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as ImportRecord[];
    },
  });
}

export function useAddImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      supplier: string;
      date: string;
      lines: {
        product_name: string;
        brand: string;
        category: string;
        description: string;
        qty: number;
        unit_buying_price: number;
      }[];
    }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      // Create import record
      const { data: importRec, error: impErr } = await supabase
        .from("import_records")
        .insert({
          supplier: input.supplier,
          date: input.date,
          entered_by: userId,
        })
        .select()
        .single();
      if (impErr) throw impErr;

      // Create line items
      const lineItems = input.lines.map((l) => ({
        import_id: importRec.id,
        product_name: l.product_name,
        brand: l.brand,
        category: l.category,
        description: l.description,
        qty: l.qty,
        unit_buying_price: l.unit_buying_price,
      }));

      const { error: lineErr } = await supabase.from("import_line_items").insert(lineItems);
      if (lineErr) throw lineErr;

      // Also add/update products for each line
      for (const line of input.lines) {
        // Check if product exists by name + brand
        const { data: existing } = await supabase
          .from("products")
          .select("id, qty_in_stock")
          .eq("name", line.product_name)
          .eq("brand", line.brand)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("products")
            .update({ qty_in_stock: existing.qty_in_stock + line.qty, buying_price: line.unit_buying_price })
            .eq("id", existing.id);
        } else {
          const { data: sku } = await supabase.rpc("generate_sku", {
            p_category: line.category,
            p_brand: line.brand,
            p_name: line.product_name,
          });
          await supabase.from("products").insert({
            name: line.product_name,
            sku: (sku as string) || `SKU-${Date.now()}`,
            brand: line.brand,
            category: line.category,
            description: line.description,
            qty_in_stock: line.qty,
            buying_price: line.unit_buying_price,
            date_of_entry: input.date,
            created_by: userId,
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["imports"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Import Added", description: "Import record and products saved." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Delete line items first (cascade should handle but be safe)
      await supabase.from("import_line_items").delete().eq("import_id", id);
      const { error } = await supabase.from("import_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["imports"] });
      toast({ title: "Deleted", description: "Import record deleted." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
