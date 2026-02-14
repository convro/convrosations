import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function LoadingScreen({ topic, currentStep }) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 500);
    return () => clearInterval(t);
  }, []);

  const steps = [
    { key: "start",      label: "Analyzing thesis" },
    { key: "group_meta", label: "Generating group name" },
    { key: "agents",     label: "Agents forming positions" },
  ];

  const currentIdx = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="loading">
      <div className="loading__spinner" />

      <div className="loading__steps">
        {steps.map((step, i) => {
          const done = currentIdx > i;
          const active = currentIdx === i;
          const pending = !done && !active;
          const cls = done ? "loading__step--done" : active ? "loading__step--active" : "loading__step--pending";

          return (
            <motion.div
              key={step.key}
              className={`loading__step ${cls}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: pending ? 0.3 : done ? 0.6 : 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <div className="loading__step-indicator">
                {done ? <Check size={14} strokeWidth={3} /> : active ? (
                  <motion.div
                    style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                ) : null}
              </div>
              <span className="loading__step-label">
                {step.label}{active ? dots : ""}
              </span>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="loading__topic"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="loading__topic-label">Debate topic</div>
        <div className="loading__topic-text">"{topic}"</div>
      </motion.div>
    </div>
  );
}
