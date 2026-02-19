
-- Company settings table (single row, owner-managed)
CREATE TABLE public.company_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL DEFAULT 'TechStock',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view company settings"
ON public.company_settings FOR SELECT
USING (is_authenticated_member(auth.uid()));

CREATE POLICY "Only owners can update company settings"
ON public.company_settings FOR UPDATE
USING (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Only owners can insert company settings"
ON public.company_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));

-- Insert default row
INSERT INTO public.company_settings (company_name) VALUES ('TechStock');

-- Trigger for updated_at
CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
