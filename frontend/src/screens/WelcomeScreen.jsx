import React from "react";
import { motion } from "framer-motion";
import { Swords, Zap, Users, MessageSquare, ArrowRight } from "lucide-react";

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome">
      <div className="welcome__glow welcome__glow--primary" />
      <div className="welcome__glow welcome__glow--secondary" />

      <motion.div
        className="welcome__content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="welcome__icon"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Swords size={32} />
        </motion.div>

        <h1 className="welcome__title">
          <span>DebateMyAgent</span>
        </h1>

        <p className="welcome__subtitle">
          Drop a controversial topic. Five AI agents will pick sides and argue it out in real time.
        </p>

        <motion.div
          className="welcome__features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          {[
            { icon: Zap, label: "Real-time" },
            { icon: Users, label: "5 AI agents" },
            { icon: MessageSquare, label: "Live debate" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="welcome__feature">
              <Icon />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>

        <motion.button
          className="btn-primary"
          onClick={onStart}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          whileTap={{ scale: 0.97 }}
          style={{ width: "100%", maxWidth: 280, padding: "16px 32px", fontSize: 16 }}
        >
          Start debating
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  );
}
