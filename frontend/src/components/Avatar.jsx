import React from "react";

export default function Avatar({ agent, size = 40, showOnline = false }) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        letterSpacing: -0.5,
        background: `radial-gradient(circle at 30% 30%, ${agent.color}dd, ${agent.color}88)`,
        boxShadow: `0 2px 8px ${agent.color}33`,
      }}
    >
      {agent.initials}
      {showOnline && (
        <div
          className="avatar__online-dot"
          style={{
            width: size * 0.26,
            height: size * 0.26,
            border: `2px solid var(--bg-secondary)`,
          }}
        />
      )}
    </div>
  );
}
