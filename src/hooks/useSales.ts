import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type SaleRecord = Tables<"sales_records">;

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_records")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as SaleRecord[];
    },
  });
}

export function useRecordSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sale: {
      product_id: string;
      product_name: string;
      brand: string;
      category: string;
      qty: number;
      unit_selling_price: number;
      unit_buying_price: number;
      payment_method: string;
      notes?: string;
    }) => {
      const profit = (sale.unit_selling_price - sale.unit_buying_price) * sale.qty;
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const { error } = await supabase.from("sales_records").insert({
        product_id: sale.product_id,
        product_name: sale.product_name,
        brand: sale.brand,
        category: sale.category,
        qty: sale.qty,
        unit_selling_price: sale.unit_selling_price,
        unit_buying_price: sale.unit_buying_price,
        payment_method: sale.payment_method,
        notes: sale.notes || "",
        profit,
        entered_by: userId,
      });
      if (error) throw error;

      // Decrease stock
      const { data: product } = await supabase
        .from("products")
        .select("qty_in_stock")
        .eq("id", sale.product_id)
        .single();

      if (product) {
        await supabase
          .from("products")
          .update({ qty_in_stock: Math.max(0, product.qty_in_stock - sale.qty) })
          .eq("id", sale.product_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Sale Recorded", description: "Sale saved and stock updated." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      toast({ title: "Deleted", description: "Sale record deleted." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
