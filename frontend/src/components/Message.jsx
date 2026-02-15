import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./Avatar.jsx";
import { Reply, Forward, X } from "lucide-react";

const messageVariants = {
  initial: { opacity: 0, y: 8, scale: 0.97 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Message({ msg, agents, onReply, onForward, onAvatarClick, replyTo }) {
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef(null);
  const touchStartPos = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    longPressTimer.current = setTimeout(() => {
      setShowActions(true);
    }, 500);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStartPos.current) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
    if (dx > 10 || dy > 10) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setShowActions(true);
  }, []);

  // Find reply-to message agent
  const replyAgent = replyTo ? agents.find(a => a.id === replyTo.agentId) : null;

  /* -- User message --------------------------------- */
  if (msg.isUser) {
    return (
      <motion.div className="message message--user" {...messageVariants}>
        <div className="message__user-wrap"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={handleContextMenu}
        >
          {replyTo && (
            <div className="message__reply-preview message__reply-preview--user">
              <div className="message__reply-bar" style={{ background: replyAgent?.color || "var(--accent)" }} />
              <div className="message__reply-body">
                <span className="message__reply-name" style={{ color: replyAgent?.color || "var(--accent)" }}>
                  {replyTo.isUser ? "You" : replyAgent?.name || "?"}
                </span>
                <span className="message__reply-text">{replyTo.text?.substring(0, 80)}{replyTo.text?.length > 80 ? "..." : ""}</span>
              </div>
            </div>
          )}
          <div className="message__user-bubble">{msg.text}</div>
          <span className="message__time message__time--user">{msg.time}</span>

          <AnimatePresence>
            {showActions && (
              <MessageActions
                onReply={() => { onReply?.(msg); setShowActions(false); }}
                onForward={() => { onForward?.(msg); setShowActions(false); }}
                onClose={() => setShowActions(false)}
                align="right"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  /* -- Agent message -------------------------------- */
  const agent = agents.find(a => a.id === msg.agentId);
  if (!agent) return null;

  let stanceBadge;
  if (agent.isFactChecker) {
    stanceBadge = {
      label: "FACT CHECK",
      bg: "rgba(255, 215, 0, 0.1)",
      color: "#FFD700",
      border: "rgba(255, 215, 0, 0.2)",
    };
  } else if (agent.stance === "for") {
    stanceBadge = {
      label: "FOR",
      bg: "rgba(52, 211, 153, 0.08)",
      color: "#34d399",
      border: "rgba(52, 211, 153, 0.15)",
    };
  } else if (agent.stance === "against") {
    stanceBadge = {
      label: "AGAINST",
      bg: "rgba(251, 113, 133, 0.08)",
      color: "#fb7185",
      border: "rgba(251, 113, 133, 0.15)",
    };
  } else {
    stanceBadge = {
      label: "NEUTRAL",
      bg: "rgba(148, 163, 184, 0.08)",
      color: "#94a3b8",
      border: "rgba(148, 163, 184, 0.15)",
    };
  }

  return (
    <motion.div className={`message message--agent ${agent.isFactChecker ? "message--fact-checker" : ""}`} {...messageVariants}>
      <Avatar agent={agent} size={34} onClick={() => onAvatarClick?.(agent)} />
      <div className="message__agent-wrap"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
      >
        <div className="message__agent-header">
          <span className="message__agent-name" style={{ color: agent.color }} onClick={() => onAvatarClick?.(agent)}>
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

        {replyTo && (
          <div className="message__reply-preview">
            <div className="message__reply-bar" style={{ background: replyAgent?.color || "var(--accent)" }} />
            <div className="message__reply-body">
              <span className="message__reply-name" style={{ color: replyAgent?.color || "var(--accent)" }}>
                {replyTo.isUser ? "You" : replyAgent?.name || "?"}
              </span>
              <span className="message__reply-text">{replyTo.text?.substring(0, 80)}{replyTo.text?.length > 80 ? "..." : ""}</span>
            </div>
          </div>
        )}

        <div
          className={`message__agent-bubble ${agent.isFactChecker ? "message__agent-bubble--fc" : ""}`}
        >
          {msg.text}
        </div>
        <span className="message__time">{msg.time}</span>

        <AnimatePresence>
          {showActions && (
            <MessageActions
              onReply={() => { onReply?.(msg); setShowActions(false); }}
              onForward={() => { onForward?.(msg); setShowActions(false); }}
              onClose={() => setShowActions(false)}
              align="left"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MessageActions({ onReply, onForward, onClose, align }) {
  return (
    <>
      <motion.div
        className="message-actions__overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className={`message-actions ${align === "right" ? "message-actions--right" : "message-actions--left"}`}
        initial={{ opacity: 0, scale: 0.85, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 8 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <button className="message-actions__btn" onClick={onReply}>
          <Reply size={15} />
          <span>Reply</span>
        </button>
        <div className="message-actions__divider" />
        <button className="message-actions__btn" onClick={onForward}>
          <Forward size={15} />
          <span>Forward</span>
        </button>
      </motion.div>
    </>
  );
}
