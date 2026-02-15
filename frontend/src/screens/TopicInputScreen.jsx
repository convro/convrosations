import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, WifiOff, ChevronDown, Shield, Flame } from "lucide-react";

const EXAMPLES = [
  "AI will replace all programmers by 2030",
  "Social media is destroying democracy",
  "Crypto is the biggest scam of the 21st century",
  "Remote work is better than office work",
  "Public school is obsolete",
  "Free speech should have limits",
];

const LANGUAGES = [
  { code: "en", flag: "\u{1F1EC}\u{1F1E7}", name: "English" },
  { code: "pl", flag: "\u{1F1F5}\u{1F1F1}", name: "Polski" },
  { code: "es", flag: "\u{1F1EA}\u{1F1F8}", name: "Espa\u00f1ol" },
  { code: "de", flag: "\u{1F1E9}\u{1F1EA}", name: "Deutsch" },
  { code: "fr", flag: "\u{1F1EB}\u{1F1F7}", name: "Fran\u00e7ais" },
  { code: "it", flag: "\u{1F1EE}\u{1F1F9}", name: "Italiano" },
  { code: "pt", flag: "\u{1F1F5}\u{1F1F9}", name: "Portugu\u00eas" },
  { code: "ru", flag: "\u{1F1F7}\u{1F1FA}", name: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
  { code: "ja", flag: "\u{1F1EF}\u{1F1F5}", name: "\u65E5\u672C\u8A9E" },
  { code: "ko", flag: "\u{1F1F0}\u{1F1F7}", name: "\uD55C\uAD6D\uC5B4" },
  { code: "tr", flag: "\u{1F1F9}\u{1F1F7}", name: "T\u00fcrk\u00e7e" },
  { code: "ar", flag: "\u{1F1F8}\u{1F1E6}", name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
];

const AGGRESSION_LABELS = [
  { max: 15, label: "Calm", emoji: "\u{1F64F}" },
  { max: 35, label: "Moderate", emoji: "\u{1F914}" },
  { max: 55, label: "Heated", emoji: "\u{1F525}" },
  { max: 75, label: "Aggressive", emoji: "\u{1F4A2}" },
  { max: 90, label: "Toxic", emoji: "\u{2620}\u{FE0F}" },
  { max: 100, label: "RAGE", emoji: "\u{1F92C}" },
];

function getAggrLabel(val) {
  return AGGRESSION_LABELS.find(l => val <= l.max) || AGGRESSION_LABELS[AGGRESSION_LABELS.length - 1];
}

export default function TopicInputScreen({ onSubmit, connected, settings, onSettingsChange }) {
  const [topic, setTopic] = useState("");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const textareaRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Close lang picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLangPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const canSubmit = topic.trim().length >= 5 && connected;
  const selectedLang = LANGUAGES.find(l => l.code === (settings.language || "en")) || LANGUAGES[0];
  const aggrInfo = getAggrLabel(settings.aggressiveness ?? 50);

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

      {/* ── Language Selector ─────────────────────── */}
      <div className="topic-input__row">
        <div className="lang-selector" ref={langRef}>
          <button
            className="lang-selector__btn"
            onClick={() => setShowLangPicker(v => !v)}
          >
            <span className="lang-selector__flag">{selectedLang.flag}</span>
            <span className="lang-selector__name">{selectedLang.name}</span>
            <ChevronDown size={14} className={`lang-selector__chevron ${showLangPicker ? "lang-selector__chevron--open" : ""}`} />
          </button>

          <AnimatePresence>
            {showLangPicker && (
              <motion.div
                className="lang-selector__dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-selector__option ${lang.code === selectedLang.code ? "lang-selector__option--active" : ""}`}
                    onClick={() => {
                      onSettingsChange({ ...settings, language: lang.code });
                      setShowLangPicker(false);
                    }}
                  >
                    <span className="lang-selector__option-flag">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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

      {/* ── Settings section ─────────────────────── */}
      <div className="topic-input__settings">
        <div className="topic-input__settings-label">Debate settings</div>

        {/* Aggression slider */}
        <div className="setting-inline">
          <div className="setting-inline__header">
            <Flame size={14} />
            <span className="setting-inline__title">Intensity</span>
            <span className="setting-inline__value" style={{
              color: (settings.aggressiveness ?? 50) > 75 ? "var(--error)" :
                     (settings.aggressiveness ?? 50) > 55 ? "var(--warning)" : "var(--accent)"
            }}>
              {aggrInfo.emoji} {aggrInfo.label}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            className="setting-inline__slider"
            value={settings.aggressiveness ?? 50}
            onChange={e => onSettingsChange({ ...settings, aggressiveness: +e.target.value })}
          />
          <div className="setting-inline__labels">
            <span>Calm</span>
            <span>RAGE</span>
          </div>
        </div>

        {/* Fact Checker toggle */}
        <div className="setting-inline setting-inline--row">
          <div className="setting-inline__left">
            <Shield size={14} />
            <div>
              <span className="setting-inline__title">Fact Checker AI</span>
              <span className="setting-inline__hint">Adds a "neutral" fact-checker agent</span>
            </div>
          </div>
          <div
            className={`toggle toggle--sm ${settings.enableFactChecker ? "toggle--on" : "toggle--off"}`}
            onClick={() => onSettingsChange({ ...settings, enableFactChecker: !settings.enableFactChecker })}
          >
            <div className="toggle__knob" />
          </div>
        </div>

        {/* Max rounds */}
        <div className="setting-inline">
          <div className="setting-inline__header">
            <span className="setting-inline__title">Rounds</span>
          </div>
          <div className="setting-inline__grid">
            {[5, 10, 15, 20].map(r => (
              <button
                key={r}
                className={`setting-inline__grid-btn ${settings.maxRounds === r ? "setting-inline__grid-btn--active" : ""}`}
                onClick={() => onSettingsChange({ ...settings, maxRounds: r })}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
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
