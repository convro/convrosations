import React, { useState, useEffect } from "react";
import Avatar from "./Avatar.jsx";

export default function Message({ msg, agents }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const style = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.98)",
    transition: "opacity 0.28s ease, transform 0.28s cubic-bezier(0.34,1.2,0.64,1)",
  };

  /* ── User message (right side) ─────────────────────── */
  if (msg.isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "3px 16px", ...style }}>
        <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
          <div style={{
            background: "linear-gradient(135deg, #2AABEE, #1a8bc4)",
            borderRadius: "18px 18px 4px 18px",
            padding: "10px 15px",
            color: "#fff",
            fontSize: 14,
            lineHeight: 1.55,
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 3px 12px rgba(42,171,238,0.35)",
          }}>
            {msg.text}
          </div>
          <span style={{ fontSize: 10, color: "#4a6fa5", paddingRight: 4, fontFamily: "'DM Mono', monospace" }}>
            {msg.time} ✓✓
          </span>
        </div>
      </div>
    );
  }

  /* ── Agent message (left side) ─────────────────────── */
  const agent = agents.find(a => a.id === msg.agentId);
  if (!agent) return null;

  const stanceBadge = agent.stance === "for" ? { label: "ZA", bg: "#1B5E2020", color: "#4CAF50" }
    : agent.stance === "against" ? { label: "PRZECIW", bg: "#B71C1C20", color: "#EF5350" }
    : { label: "NEUTRAL", bg: "#37474F20", color: "#90A4AE" };

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "3px 16px", ...style }}>
      <Avatar agent={agent} size={34} />
      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 2 }}>
          <span style={{
            fontSize: 12,
            color: agent.color,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {agent.name}
          </span>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: stanceBadge.color,
            background: stanceBadge.bg,
            padding: "1px 6px",
            borderRadius: 4,
            fontFamily: "'DM Mono', monospace",
            border: `1px solid ${stanceBadge.color}33`,
          }}>
            {stanceBadge.label}
          </span>
        </div>
        <div style={{
          background: "#1a2438",
          borderRadius: "18px 18px 18px 4px",
          padding: "10px 14px",
          color: "#d0dff5",
          fontSize: 14,
          lineHeight: 1.55,
          fontFamily: "'DM Sans', sans-serif",
          borderLeft: `3px solid ${agent.color}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}>
          {msg.text}
        </div>
        <span style={{ fontSize: 10, color: "#3a5275", paddingLeft: 2, fontFamily: "'DM Mono', monospace" }}>
          {msg.time}
        </span>
      </div>
    </div>
  );
}
