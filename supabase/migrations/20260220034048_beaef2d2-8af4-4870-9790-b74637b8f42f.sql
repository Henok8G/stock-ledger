
-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Members can view all notes (shared workspace)
CREATE POLICY "Members can view notes"
ON public.notes
FOR SELECT
USING (is_authenticated_member(auth.uid()));

-- Members can insert their own notes
CREATE POLICY "Members can insert notes"
ON public.notes
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_authenticated_member(auth.uid()));

-- Members can update their own notes
CREATE POLICY "Members can update own notes"
ON public.notes
FOR UPDATE
USING (auth.uid() = user_id);

-- Members can delete their own notes
CREATE POLICY "Members can delete own notes"
ON public.notes
FOR DELETE
USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
