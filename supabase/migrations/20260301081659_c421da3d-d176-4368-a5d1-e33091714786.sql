
-- Create storage bucket for product photos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-photos', 'product-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view product photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-photos');

CREATE POLICY "Authenticated members can upload product photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-photos' AND public.is_authenticated_member(auth.uid()));

CREATE POLICY "Authenticated members can update product photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-photos' AND public.is_authenticated_member(auth.uid()));

CREATE POLICY "Owners can delete product photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-photos' AND public.has_role(auth.uid(), 'owner'::public.app_role));

-- Create product_photos table to track photos linked to products
CREATE TABLE public.product_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view product photos"
ON public.product_photos FOR SELECT
USING (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Members can insert product photos"
ON public.product_photos FOR INSERT
WITH CHECK (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Owners can delete product photos"
ON public.product_photos FOR DELETE
USING (public.has_role(auth.uid(), 'owner'::public.app_role));

CREATE POLICY "Owners can update product photos"
ON public.product_photos FOR UPDATE
USING (public.has_role(auth.uid(), 'owner'::public.app_role));
