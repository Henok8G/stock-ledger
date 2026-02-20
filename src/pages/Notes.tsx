import { useState, useEffect } from "react";
import { StickyNote, Plus, Trash2, Save, Pencil, X, Search, Calendar } from "lucide-react";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, type Note } from "@/hooks/useNotes";
import { format } from "date-fns";

const NOTE_COLORS: { key: string; label: string; bg: string; border: string; dot: string }[] = [
  { key: "default", label: "Default", bg: "bg-card", border: "border-border", dot: "bg-muted-foreground" },
  { key: "yellow",  label: "Amber",   bg: "bg-warning/10", border: "border-warning/30", dot: "bg-warning" },
  { key: "blue",    label: "Blue",    bg: "bg-info/10",    border: "border-info/30",    dot: "bg-info" },
  { key: "green",   label: "Green",   bg: "bg-success/10", border: "border-success/30", dot: "bg-success" },
  { key: "red",     label: "Red",     bg: "bg-destructive/10", border: "border-destructive/30", dot: "bg-destructive" },
];

function colorMeta(key: string) {
  return NOTE_COLORS.find((c) => c.key === key) ?? NOTE_COLORS[0];
}

function formatDate(dt: string) {
  return format(new Date(dt), "MMM d, yyyy");
}

export default function Notes() {
  const { data: notes = [], isLoading } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("default");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");

  const filtered = notes.filter((n) =>
    !search ||
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const resetEditor = () => {
    setTitle("");
    setContent("");
    setColor("default");
    setEditingId(null);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    if (editingId) {
      updateNote.mutate({ id: editingId, title: title || "Untitled Note", content, color });
      resetEditor();
    } else {
      createNote.mutate({ title: title || "Untitled Note", content, color });
      resetEditor();
    }
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setSelectedNote(null);
  };

  const handleDelete = (id: string) => {
    deleteNote.mutate(id);
    if (selectedNote?.id === id) setSelectedNote(null);
    if (editingId === id) resetEditor();
  };

  // word + char count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Notes</h4>
        </div>
        <span className="text-xs text-muted-foreground">{notes.length} note{notes.length !== 1 ? "s" : ""} total</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* LEFT: Editor */}
        <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {editingId ? "Edit Note" : "New Note"}
            </span>
            {editingId && (
              <button onClick={resetEditor} className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Title */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title…"
              className="w-full bg-transparent text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 outline-none border-none"
            />

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Color picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Color:</span>
              <div className="flex gap-1.5">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setColor(c.key)}
                    title={c.label}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${c.dot} ${color === c.key ? "border-foreground scale-110 shadow" : "border-transparent opacity-70 hover:opacity-100"}`}
                  />
                ))}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here… Use this space for reminders, observations, supplier notes, or anything your team needs to know."
              rows={12}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed"
            />

            {/* Footer bar */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">{wordCount} words · {charCount} chars</span>
              <button
                onClick={handleSave}
                disabled={createNote.isPending || updateNote.isPending || (!title.trim() && !content.trim())}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Save className="w-3.5 h-3.5" />
                {editingId ? "Update Note" : "Save Note"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: History + Detail */}
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground"
            />
          </div>

          {/* Notes list */}
          <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Note History</span>
              <span className="text-xs text-muted-foreground">{filtered.length} notes</span>
            </div>
            <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
              {isLoading && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</div>
              )}
              {!isLoading && filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notes yet. Write your first one!</div>
              )}
              {filtered.map((note) => {
                const cm = colorMeta(note.color);
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(selectedNote?.id === note.id ? null : note)}
                    className={`group px-4 py-3 cursor-pointer hover:bg-accent/40 transition-colors ${selectedNote?.id === note.id ? "bg-accent/50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${cm.dot}`} />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{note.title}</div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5 max-w-[200px]">{note.content || "No content"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(note.updated_at)}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-1 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(note); }}
                            className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                            className="p-1 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail view */}
          {selectedNote && (() => {
            const cm = colorMeta(selectedNote.color);
            return (
              <div className={`rounded-xl border ${cm.border} ${cm.bg} card-shadow overflow-hidden`}>
                <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Note Detail</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(selectedNote)} className="p-1 rounded hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(selectedNote.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setSelectedNote(null)} className="p-1 rounded hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Title</div>
                    <div className="text-base font-semibold text-foreground">{selectedNote.title}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground mb-0.5">Created</div>
                      <div className="font-medium text-foreground">{formatDate(selectedNote.created_at)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-0.5">Last Updated</div>
                      <div className="font-medium text-foreground">{formatDate(selectedNote.updated_at)}</div>
                    </div>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">Content</div>
                    <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {selectedNote.content || <span className="text-muted-foreground italic">No content</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
