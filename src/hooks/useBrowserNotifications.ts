import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (!("Notification" in window)) return null;
  if (Notification.permission === "default") {
    const result = await Notification.requestPermission();
    if (result === "granted") {
      new Notification("Notifications enabled 🎉", {
        body: "You'll now receive alerts for new products and imports.",
        icon: "/logo.png",
      });
    }
    return result;
  }
  return Notification.permission;
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
