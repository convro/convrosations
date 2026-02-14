import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, WifiOff } from "lucide-react";

const EXAMPLES = [
  "AI will replace all programmers by 2030",
  "Social media is destroying democracy",
  "Crypto is the biggest scam of the 21st century",
  "Remote work is better than office work",
  "Public school is obsolete",
  "Free speech should have limits",
];

export default function TopicInputScreen({ onSubmit, connected }) {
  const [topic, setTopic] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const canSubmit = topic.trim().length >= 5 && connected;

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) onSubmit(topic.trim());
    }
  };

  return (
    <div className="topic-input">
      <div className="topic-input__header">
        <h2 className="topic-input__title">Your thesis</h2>
        <p className="topic-input__desc">
          Enter any statement — agents will automatically pick sides and debate it.
        </p>
      </div>

      <div className="topic-input__textarea-wrap">
        <textarea
          ref={textareaRef}
          className="topic-input__textarea"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={handleKey}
          placeholder='e.g. "Democracy is overrated..."'
          rows={3}
        />
        <div className={`topic-input__charcount ${topic.length > 200 ? "topic-input__charcount--over" : ""}`}>
          {topic.length}/300
        </div>
      </div>

      <div className="topic-input__examples-label">Examples</div>
      <div className="topic-input__examples">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            className={`topic-input__example ${topic === ex ? "topic-input__example--active" : ""}`}
            onClick={() => setTopic(ex)}
          >
            {ex}
          </button>
        ))}
      </div>

      {!connected && (
        <motion.div
          className="topic-input__error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <WifiOff size={16} />
          <span>Connecting to server...</span>
        </motion.div>
      )}

      <div className="topic-input__submit-area">
        <motion.button
          className="btn-primary"
          onClick={() => canSubmit && onSubmit(topic.trim())}
          disabled={!canSubmit}
          whileTap={canSubmit ? { scale: 0.97 } : {}}
          style={{ width: "100%", padding: "16px 0", fontSize: 16 }}
        >
          {connected ? "Start debate" : "Connecting..."}
          {connected && <ArrowRight size={18} />}
        </motion.button>
      </div>
    </div>
  );
}
