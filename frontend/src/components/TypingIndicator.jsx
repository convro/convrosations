import React from "react";
import { motion } from "framer-motion";
import Avatar from "./Avatar.jsx";

export default function TypingIndicator({ agent }) {
  if (!agent) return null;

  return (
    <motion.div
      className="typing"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Avatar agent={agent} size={32} />
      <div className="typing__content">
        <span className="typing__name" style={{ color: agent.color }}>
          {agent.name}
        </span>
        <div className="typing__bubble" style={{ borderLeft: `3px solid ${agent.color}` }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="typing__dot"
              style={{ background: agent.color }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
