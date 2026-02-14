import React from "react";

export default function Avatar({ agent, size = 40, showOnline = false }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(135deg at 30% 30%, ${agent.color}dd, ${agent.color}88)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: -0.5,
        boxShadow: `0 2px 10px ${agent.color}44, inset 0 1px 0 rgba(255,255,255,0.2)`,
        userSelect: "none",
      }}>
        {agent.initials}
      </div>
      {showOnline && (
        <div style={{
          position: "absolute",
          bottom: 1,
          right: 1,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: "50%",
          background: "#4CAF50",
          border: "2px solid #131d2e",
          boxShadow: "0 0 6px #4CAF5088",
        }} />
      )}
    </div>
  );
}
