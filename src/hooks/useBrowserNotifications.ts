import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function useBrowserNotifications(enabled: boolean) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabled || !("Notification" in window)) return;

    const channel = supabase
      .channel("browser-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          if (!enabledRef.current) return;
          if (Notification.permission !== "granted") return;

          const { title, message } = payload.new as { title: string; message: string };
          new Notification(title, {
            body: message,
            icon: "/logo.png",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled]);
}
