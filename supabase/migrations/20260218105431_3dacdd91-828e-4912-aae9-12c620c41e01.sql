
-- Drop existing INSERT policy for sales_records
DROP POLICY "Members can insert sales" ON public.sales_records;

-- Create new INSERT policy that only allows owners
CREATE POLICY "Only owners can insert sales"
ON public.sales_records
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));
