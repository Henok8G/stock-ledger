import { type ReactNode } from "react";
import { X } from "lucide-react";

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function DetailDrawer({ open, onClose, title, children }: DetailDrawerProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/15 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l border-border modal-shadow animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between h-[52px] px-5 border-b border-border shrink-0">
          <h3 className="text-[15px] font-semibold truncate tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </>
  );
}
