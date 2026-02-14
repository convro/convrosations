import React, { useState, useEffect } from "react";

export default function LoadingScreen({ topic, currentStep }) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 500);
    return () => clearInterval(t);
  }, []);

  const steps = [
    { key: "start",      label: "Analizuję tezę" },
    { key: "group_meta", label: "Generuję nazwę grupy" },
    { key: "agents",     label: "Agenci formułują stanowiska" },
  ];

  const currentIdx = steps.findIndex(s => s.key === currentStep);

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 32px",
      animation: "fadeIn 0.4s ease",
    }}>
      {/* Spinner */}
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        border: "3px solid #1a2438",
        borderTop: "3px solid #2AABEE",
        animation: "spin 0.9s linear infinite",
        marginBottom: 36,
        boxShadow: "0 0 20px rgba(42,171,238,0.2)",
      }} />

      {/* Steps */}
      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {steps.map((step, i) => {
          const done = currentIdx > i;
          const active = currentIdx === i;
          return (
            <div key={step.key} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: active ? "#1e3050" : done ? "#1a2438" : "#141e2e",
              borderRadius: 12,
              padding: "12px 16px",
              border: `1px solid ${active ? "#2AABEE44" : done ? "#2AABEE22" : "#1e2d44"}`,
              transition: "all 0.3s ease",
              opacity: i > currentIdx + 1 ? 0.4 : 1,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "#2AABEE" : active ? "#2AABEE22" : "#1a2438",
                border: `2px solid ${done || active ? "#2AABEE" : "#2a3a52"}`,
                fontSize: 12,
                transition: "all 0.3s",
              }}>
                {done ? "✓" : active ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2AABEE", animation: "pulse 1s ease-in-out infinite" }} /> : ""}
              </div>
              <span style={{
                fontSize: 14,
                color: active ? "#e8f0fe" : done ? "#7a9cc0" : "#3a5275",
                fontWeight: active ? 600 : 400,
                transition: "all 0.3s",
              }}>
                {step.label}{active ? dots : done ? "" : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Topic reminder */}
      <div style={{
        background: "#1a2438", borderRadius: 12, padding: "12px 20px",
        maxWidth: 360, width: "100%",
      }}>
        <div style={{ color: "#3a5275", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          Temat debaty
        </div>
        <div style={{ color: "#8aabcc", fontSize: 13, lineHeight: 1.5, fontStyle: "italic" }}>
          "{topic}"
        </div>
      </div>
    </div>
  );
}
