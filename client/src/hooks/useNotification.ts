import { useCallback, useEffect, useState } from "react";
import icon from "/favicon-32x32.png";

export function useNotification() {
  const [granted, setGranted] = useState(Notification.permission === "granted");

  const showNotification = useCallback((message: string) => {
    const notification = new Notification(message, {
      icon: icon,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => {
      notification.close();
    }, 1000 * 5);
  }, []);

  useEffect(() => {
    if (!granted) {
      async function getNotificationAccess() {
        if (!("Notification" in window)) {
          alert("This browser does not support desktop notifications!");
          return;
        }

        if (Notification.permission === "granted") {
          setGranted(true);
        } else if (Notification.permission !== "denied") {
          const permission = await Notification.requestPermission();
          setGranted(permission === "granted");
        }

        if (Notification.permission !== "granted")
          alert("You blocked the notifications!");
      }

      getNotificationAccess();
    }
  }, [granted]);

  return { showNotification };
}
