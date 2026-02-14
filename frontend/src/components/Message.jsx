import React from "react";
import { motion } from "framer-motion";
import Avatar from "./Avatar.jsx";

const messageVariants = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.25, ease: [0.34, 1.2, 0.64, 1] },
  },
};

export default function Message({ msg, agents }) {
  /* ── User message ────────────────────────────────── */
  if (msg.isUser) {
    return (
      <motion.div className="message message--user" {...messageVariants}>
        <div className="message__user-wrap">
          <div className="message__user-bubble">{msg.text}</div>
          <span className="message__time message__time--user">{msg.time}</span>
        </div>
      </motion.div>
    );
  }

  /* ── Agent message ───────────────────────────────── */
  const agent = agents.find(a => a.id === msg.agentId);
  if (!agent) return null;

  const stanceBadge = agent.stance === "for"
    ? { label: "FOR", bg: "rgba(72, 187, 120, 0.1)", color: "#68d391", border: "rgba(72, 187, 120, 0.2)" }
    : agent.stance === "against"
    ? { label: "AGAINST", bg: "rgba(252, 129, 129, 0.1)", color: "#fc8181", border: "rgba(252, 129, 129, 0.2)" }
    : { label: "NEUTRAL", bg: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", border: "rgba(148, 163, 184, 0.2)" };

  return (
    <motion.div className="message message--agent" {...messageVariants}>
      <Avatar agent={agent} size={32} />
      <div className="message__agent-wrap">
        <div className="message__agent-header">
          <span className="message__agent-name" style={{ color: agent.color }}>
            {agent.name}
          </span>
          <span
            className="message__stance-badge"
            style={{
              color: stanceBadge.color,
              background: stanceBadge.bg,
              border: `1px solid ${stanceBadge.border}`,
            }}
          >
            {stanceBadge.label}
          </span>
        </div>
        <div className="message__agent-bubble" style={{ borderLeftColor: agent.color }}>
          {msg.text}
        </div>
        <span className="message__time">{msg.time}</span>
      </div>
    </motion.div>
  );
}
