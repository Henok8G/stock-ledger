import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: { title: string; content: string; color?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("notes").insert({
        ...note,
        user_id: user.id,
        color: note.color ?? "default",
      }).select().single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Note saved", description: "Your note has been saved successfully." });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase.from("notes").update(fields).eq("id", id).select().single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Note updated" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Note deleted" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
}
