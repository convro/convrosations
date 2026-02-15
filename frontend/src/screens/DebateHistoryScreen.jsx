import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Users, Clock } from "lucide-react";

export default function DebateHistoryScreen({ debates, onLoad, onBack }) {
  return (
    <div className="history-screen">
      <div className="history-screen__header">
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="history-screen__title">Past debates</h2>
      </div>

      {debates.length === 0 ? (
        <div className="history-screen__empty">
          <Clock size={48} style={{ color: "var(--text-tertiary)", marginBottom: 16 }} />
          <p className="history-screen__empty-text">No debates yet</p>
          <p className="history-screen__empty-sub">Start your first debate and it will appear here</p>
        </div>
      ) : (
        <div className="history-screen__list">
          {debates.map((debate, i) => (
            <motion.button
              key={debate.id}
              className="history-card"
              onClick={() => onLoad(debate.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="history-card__top">
                <div className="history-card__name">{debate.groupName || "Debate"}</div>
                <div className="history-card__time">
                  {new Date(debate.timestamp).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </div>
              </div>
              <div className="history-card__topic">{debate.topic}</div>
              <div className="history-card__stats">
                <span className="history-card__stat">
                  <MessageSquare size={12} />
                  {debate.messageCount} messages
                </span>
                <span className="history-card__stat">
                  <Users size={12} />
                  {debate.agentCount} agents
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
