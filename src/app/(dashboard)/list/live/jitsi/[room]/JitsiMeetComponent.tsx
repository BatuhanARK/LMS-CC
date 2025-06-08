"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiMeetComponent() {
  const { room } = useParams();
  const jitsiContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (!room || !window) return;

      const domain = "meet.jit.si";
      const options = {
          roomName: room as string,
          width: "100%",
          height: 700,
          parentNode: jitsiContainer.current,
          interfaceConfigOverwrite: { DEFAULT_REMOTE_DISPLAY_NAME: 'Guest' }
      };

      let api: any;

      // CDN'den Jitsi script ekle
      if (!window.JitsiMeetExternalAPI) {
          const script = document.createElement("script");
          script.src = "https://meet.jit.si/external_api.js";
          script.async = true;
          script.onload = () => {
              // @ts-ignore
              api = new window.JitsiMeetExternalAPI(domain, options);
          };
          document.body.appendChild(script);
      } else {
          // @ts-ignore
          api = new window.JitsiMeetExternalAPI(domain, options);
      }

      return () => {
          // Temizlik işlemi (gerekirse)
          if (api) {
              api.dispose?.();
          }
      };
  }, [room]);

  return <div ref={jitsiContainer} className="w-full rounded shadow-lg" />;
}
