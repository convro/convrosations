import React from "react";
import { motion } from "framer-motion";
import { X, TrendingUp, TrendingDown, Minus, Shield, AlertTriangle, Eye } from "lucide-react";
import Avatar from "./Avatar.jsx";

export default function AgentProfileCard({ agent, messages, onClose }) {
  if (!agent) return null;

  const agentMessages = messages.filter(m => m.agentId === agent.id);
  const msgCount = agentMessages.length;

  const stanceLabel = agent.isFactChecker ? "Fact Checker"
    : agent.stance === "for" ? "Supporting"
    : agent.stance === "against" ? "Opposing"
    : "Neutral";

  const stanceColor = agent.isFactChecker ? "#FFD700"
    : agent.stance === "for" ? "#34d399"
    : agent.stance === "against" ? "#fb7185"
    : "#94a3b8";

  const StanceIcon = agent.isFactChecker ? Shield
    : agent.stance === "for" ? TrendingUp
    : agent.stance === "against" ? TrendingDown
    : Minus;

  // Summarize their position from last few messages
  const lastMsgs = agentMessages.slice(-3).map(m => m.text).join(" ");
  const summary = lastMsgs.length > 0
    ? lastMsgs.substring(0, 180) + (lastMsgs.length > 180 ? "..." : "")
    : "Hasn't spoken yet.";

  const biasLabel = agent.secretBias === "for" ? "Secretly FOR" : agent.secretBias === "against" ? "Secretly AGAINST" : null;
  const biasColor = agent.secretBias === "for" ? "#34d399" : "#fb7185";

  return (
    <>
      <motion.div
        className="profile-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        className="profile-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <button className="profile-card__close" onClick={onClose}>
          <X size={16} />
        </button>

        <div className="profile-card__header">
          <div className="profile-card__avatar-wrap">
            <Avatar agent={agent} size={72} />
            <div className="profile-card__online-badge" />
          </div>
          <div className="profile-card__name" style={{ color: agent.color }}>{agent.name}</div>
          <div className="profile-card__stance" style={{ color: stanceColor }}>
            <StanceIcon size={14} />
            <span>{stanceLabel}</span>
          </div>
        </div>

        <div className="profile-card__stats-row">
          <div className="profile-card__stat">
            <div className="profile-card__stat-val">{msgCount}</div>
            <div className="profile-card__stat-label">messages</div>
          </div>
          <div className="profile-card__stat-divider" />
          <div className="profile-card__stat">
            <div className="profile-card__stat-val">{agent.isFactChecker ? "NEUTRAL" : agent.stance?.toUpperCase()}</div>
            <div className="profile-card__stat-label">public position</div>
          </div>
          <div className="profile-card__stat-divider" />
          <div className="profile-card__stat">
            <div className="profile-card__stat-val" style={{ color: "var(--success)" }}>Online</div>
            <div className="profile-card__stat-label">status</div>
          </div>
        </div>

        <div className="profile-card__section">
          <div className="profile-card__section-label">Latest take</div>
          <div className="profile-card__summary">{summary}</div>
        </div>

        {agent.isFactChecker && (
          <>
            <div className="profile-card__fc-badge">
              <Shield size={14} />
              <span>Verified Fact Checker</span>
            </div>

            {biasLabel && (
              <div className="profile-card__secret-bias">
                <div className="profile-card__secret-bias-header">
                  <Eye size={13} />
                  <span>Secret Intel</span>
                </div>
                <div className="profile-card__secret-bias-body">
                  <AlertTriangle size={14} style={{ color: biasColor, flexShrink: 0 }} />
                  <div>
                    <div className="profile-card__secret-bias-label" style={{ color: biasColor }}>
                      {biasLabel} the thesis
                    </div>
                    <div className="profile-card__secret-bias-desc">
                      This "neutral" fact checker is secretly biased. Watch their sources carefully &mdash; they'll subtly push data favoring the <strong style={{ color: biasColor }}>{agent.secretBias}</strong> side while pretending to be objective.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </>
  );
}
