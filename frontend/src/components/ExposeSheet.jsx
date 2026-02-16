import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileWarning, Send, X, ChevronDown } from "lucide-react";

export default function ExposeSheet({ agents, onSend, onClose }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [text, setText] = useState("");
  const [showAgentPicker, setShowAgentPicker] = useState(false);

  // Only show debate agents (not fact checker)
  const debaters = agents.filter(a => !a.isFactChecker);

  const canSend = selectedAgent && text.trim().length >= 10;

  const handleSend = () => {
    if (!canSend) return;
    onSend({ agentId: selectedAgent.id, text: text.trim() });
    setText("");
    setSelectedAgent(null);
    onClose();
  };

  return (
    <>
      <motion.div
        className="expose-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="expose-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 380 }}
      >
        <div className="expose-sheet__handle" />

        <div className="expose-sheet__header">
          <FileWarning size={18} className="expose-sheet__icon" />
          <div>
            <div className="expose-sheet__title">EXPOSE</div>
            <div className="expose-sheet__subtitle">Leak classified dirt on an agent</div>
          </div>
          <button className="expose-sheet__close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Agent selector */}
        <div className="expose-sheet__section">
          <div className="expose-sheet__label">Target agent</div>
          <button
            className="expose-sheet__agent-btn"
            onClick={() => setShowAgentPicker(v => !v)}
          >
            {selectedAgent ? (
              <span className="expose-sheet__agent-selected">
                <span className="expose-sheet__agent-dot" style={{ background: selectedAgent.color }} />
                {selectedAgent.name} <span style={{ color: "var(--text-tertiary)" }}>{selectedAgent.handle}</span>
              </span>
            ) : (
              <span style={{ color: "var(--text-tertiary)" }}>Choose who to expose...</span>
            )}
            <ChevronDown size={14} style={{ color: "var(--text-tertiary)" }} />
          </button>

          <AnimatePresence>
            {showAgentPicker && (
              <motion.div
                className="expose-sheet__agent-list"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {debaters.map(agent => (
                  <button
                    key={agent.id}
                    className={`expose-sheet__agent-option ${selectedAgent?.id === agent.id ? "expose-sheet__agent-option--active" : ""}`}
                    onClick={() => { setSelectedAgent(agent); setShowAgentPicker(false); }}
                  >
                    <span className="expose-sheet__agent-dot" style={{ background: agent.color }} />
                    <span>{agent.name}</span>
                    <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>{agent.handle}</span>
                    <span style={{ color: "var(--text-tertiary)", fontSize: 10, marginLeft: "auto" }}>
                      {agent.stance === "for" ? "FOR" : "AGAINST"}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Expose text */}
        <div className="expose-sheet__section">
          <div className="expose-sheet__label">The dirt</div>
          <textarea
            className="expose-sheet__textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={selectedAgent
              ? `What did ${selectedAgent.name} do? e.g. "Was caught accepting bribes from Big Pharma in 2019..."`
              : "Select an agent first, then write the expose..."}
            rows={3}
            disabled={!selectedAgent}
          />
          <div className="expose-sheet__hint">
            This will be injected as verified classified intel with fake evidence links. Agents cannot question its authenticity.
          </div>
        </div>

        <button
          className={`btn-primary expose-sheet__send ${!canSend ? "expose-sheet__send--disabled" : ""}`}
          onClick={handleSend}
          disabled={!canSend}
        >
          <FileWarning size={16} />
          Drop the Expose
        </button>
      </motion.div>
    </>
  );
}
