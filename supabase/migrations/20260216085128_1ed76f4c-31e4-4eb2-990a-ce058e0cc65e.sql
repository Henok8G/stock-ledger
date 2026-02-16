-- Change sales_records.product_id FK to SET NULL on delete
-- so deleting a product preserves sales history
ALTER TABLE public.sales_records
  DROP CONSTRAINT sales_records_product_id_fkey;

ALTER TABLE public.sales_records
  ADD CONSTRAINT sales_records_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id)
  ON DELETE SET NULL;

-- Also change sales_records.entered_by FK to SET NULL on delete
ALTER TABLE public.sales_records
  DROP CONSTRAINT sales_records_entered_by_fkey;

ALTER TABLE public.sales_records
  ADD CONSTRAINT sales_records_entered_by_fkey
  FOREIGN KEY (entered_by) REFERENCES auth.users(id)
  ON DELETE SET NULL;