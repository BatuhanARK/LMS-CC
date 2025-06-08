"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const JitsiMeetComponent = () => {
  const { room } = useParams();

  useEffect(() => {
    if (!room) return;
    const domain = "meet.jit.si";
    const options = {
      roomName: room,
      width: "100%",
      height: 700,
      parentNode: document.getElementById("jitsi-container"),
      interfaceConfigOverwrite: { DEFAULT_REMOTE_DISPLAY_NAME: 'Guest' }
    };
    // @ts-ignore
    const api = new window.JitsiMeetExternalAPI(domain, options);

    return () => api?.dispose();
  }, [room]);

  return <div id="jitsi-container" className="w-full rounded shadow-lg" />;
};

export default JitsiMeetComponent;
