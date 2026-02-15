import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Reply } from "lucide-react";

export default function InputBar({ value, onChange, onSend, inputRef, replyingTo, replyAgent, onCancelReply }) {
  const hasText = value.trim().length > 0;

  return (
    <div className="input-bar">
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            className="input-bar__reply"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="input-bar__reply-inner">
              <Reply size={14} style={{ color: replyAgent?.color || "var(--accent)", flexShrink: 0 }} />
              <div className="input-bar__reply-info">
                <span className="input-bar__reply-name" style={{ color: replyAgent?.color || "var(--accent)" }}>
                  {replyingTo.isUser ? "You" : replyAgent?.name || "?"}
                </span>
                <span className="input-bar__reply-text">
                  {replyingTo.text?.substring(0, 60)}{replyingTo.text?.length > 60 ? "..." : ""}
                </span>
              </div>
              <button className="input-bar__reply-close" onClick={onCancelReply}>
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="input-bar__row">
        <input
          ref={inputRef}
          className="input-bar__input"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSend()}
          placeholder="Write a message..."
        />
        <button
          className={`input-bar__send ${hasText ? "input-bar__send--active" : "input-bar__send--disabled"}`}
          onClick={onSend}
          disabled={!hasText}
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}
