import React from "react";

const FACT_CHECKER_IMG = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.shutterstock.com%2Fimage-vector%2Ffact-check-concept-thorough-factchecking-260nw-2294620971.jpg&f=1&nofb=1&ipt=aa133693f121800666833e636486930636fe3bac2a17f18c4dac0110590d9e8b";

export default function Avatar({ agent, size = 40, showOnline = false, onClick }) {
  const isFC = agent.isFactChecker;

  return (
    <div
      className={`avatar ${onClick ? "avatar--clickable" : ""} ${isFC ? "avatar--fc" : ""}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        letterSpacing: -0.5,
        ...(!isFC ? {
          background: `linear-gradient(135deg, ${agent.color}ee, ${agent.color}99)`,
          boxShadow: `0 2px 12px ${agent.color}40`,
        } : {}),
      }}
      onClick={onClick}
    >
      {isFC ? (
        <img
          src={FACT_CHECKER_IMG}
          alt="FC"
          className="avatar__fc-img"
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        agent.initials
      )}
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
