import React from "react";
import Avatar from "./Avatar.jsx";

export default function TypingIndicator({ agent }) {
  if (!agent) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 8,
      padding: "3px 16px",
      animation: "fadeInUp 0.25s ease",
    }}>
      <Avatar agent={agent} size={34} />
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{
          fontSize: 11,
          color: agent.color,
          fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif",
          paddingLeft: 2,
        }}>
          {agent.name}
        </span>
        <div style={{
          background: "#1a2438",
          borderRadius: "18px 18px 18px 4px",
          padding: "12px 16px",
          display: "flex",
          gap: 5,
          alignItems: "center",
          borderLeft: `3px solid ${agent.color}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: agent.color,
              opacity: 0.7,
              animation: `typingDot 1.3s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
