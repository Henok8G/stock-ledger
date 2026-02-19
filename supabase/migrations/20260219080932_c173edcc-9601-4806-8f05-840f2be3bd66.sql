
-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Function to notify owners on product insert
CREATE OR REPLACE FUNCTION public.notify_owners_on_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message)
  SELECT ur.user_id, 'New Product Added', 'Product "' || NEW.name || '" has been added to inventory.'
  FROM public.user_roles ur
  WHERE ur.role = 'owner'
    AND ur.user_id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_owners_product
AFTER INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.notify_owners_on_product();

-- Function to notify owners on import insert
CREATE OR REPLACE FUNCTION public.notify_owners_on_import()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message)
  SELECT ur.user_id, 'New Import Recorded', 'A new import from "' || NEW.supplier || '" has been recorded.'
  FROM public.user_roles ur
  WHERE ur.role = 'owner'
    AND ur.user_id != COALESCE(NEW.entered_by, '00000000-0000-0000-0000-000000000000');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_owners_import
AFTER INSERT ON public.import_records
FOR EACH ROW
EXECUTE FUNCTION public.notify_owners_on_import();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
