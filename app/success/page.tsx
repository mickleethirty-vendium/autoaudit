"use client";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [msg, setMsg] = useState("Payment confirmed ✅ Loading your report…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setMsg("Payment confirmed ✅ (missing session id). Please return to your preview page.");
      return;
    }

    fetch(`/api/session-report?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.report_id) {
          window.location.href = `/report/${d.report_id}`;
        } else {
          setMsg("Payment confirmed ✅ but we couldn't find your report. Please refresh or return to the preview page.");
        }
      })
      .catch(() => {
        setMsg("Payment confirmed ✅ but we couldn't load your report. Please refresh.");
      });
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>{msg}</h1>
      <p>If you are not redirected within a few seconds, refresh the page.</p>
    </div>
  );
}