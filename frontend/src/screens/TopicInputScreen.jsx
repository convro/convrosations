import React, { useState, useRef, useEffect } from "react";

const EXAMPLES = [
  "AI zastąpi wszystkich programistów do 2030 roku",
  "Media społecznościowe niszczą demokrację",
  "Kryptowaluty to największe oszustwo XXI wieku",
  "Praca zdalna jest lepsza niż biurowa",
  "Szkoła publiczna jest przeżytkiem",
  "Wolność słowa powinna mieć granice",
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
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px",
      animation: "fadeInUp 0.4s ease",
    }}>
      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.8, marginBottom: 6 }}>
            Twoja teza
          </h2>
          <p style={{ color: "#4a6fa5", fontSize: 14, lineHeight: 1.6 }}>
            Wpisz dowolną tezę — agenci automatycznie podzielą się na obozy i będą się kłócić.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={handleKey}
            placeholder='np. "Demokracja jest przereklamowana..."'
            rows={3}
            style={{
              width: "100%",
              background: "#1a2438",
              border: "2px solid #2AABEE33",
              borderRadius: 16,
              color: "#e8f0fe",
              fontSize: 15,
              padding: "14px 18px",
              resize: "none",
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              lineHeight: 1.6,
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#2AABEE88"}
            onBlur={e => e.target.style.borderColor = "#2AABEE33"}
          />
          <div style={{
            position: "absolute", bottom: 10, right: 14,
            fontSize: 11, color: topic.length > 200 ? "#EF5350" : "#3a5275",
            fontFamily: "'DM Mono', monospace",
          }}>
            {topic.length}/300
          </div>
        </div>

        {/* Examples */}
        <div>
          <div style={{
            color: "#3a5275", fontSize: 10, fontWeight: 700,
            letterSpacing: 1, textTransform: "uppercase", marginBottom: 10,
          }}>
            Przykłady
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setTopic(ex)}
                style={{
                  background: topic === ex ? "#1e3050" : "#1a2438",
                  border: `1px solid ${topic === ex ? "#2AABEE44" : "#2AABEE11"}`,
                  borderRadius: 10,
                  color: topic === ex ? "#e8f0fe" : "#7a9cc0",
                  fontSize: 13,
                  padding: "9px 14px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  if (topic !== ex) {
                    e.currentTarget.style.borderColor = "#2AABEE44";
                    e.currentTarget.style.color = "#c0d0e8";
                  }
                }}
                onMouseLeave={e => {
                  if (topic !== ex) {
                    e.currentTarget.style.borderColor = "#2AABEE11";
                    e.currentTarget.style.color = "#7a9cc0";
                  }
                }}
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>

        {!connected && (
          <div style={{
            background: "#2d1a1a", border: "1px solid #EF535033",
            borderRadius: 10, padding: "10px 14px",
            color: "#EF5350", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>⚠️</span>
            <span>Łączenie z serwerem...</span>
          </div>
        )}

        <button
          onClick={() => canSubmit && onSubmit(topic.trim())}
          disabled={!canSubmit}
          style={{
            background: canSubmit
              ? "linear-gradient(135deg, #2AABEE, #1a8bc4)"
              : "#1a2438",
            border: "none",
            color: canSubmit ? "#fff" : "#3a5275",
            padding: "15px 0",
            borderRadius: 50,
            fontSize: 16,
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
            boxShadow: canSubmit ? "0 8px 28px rgba(42,171,238,0.4)" : "none",
          }}
          onMouseEnter={e => {
            if (canSubmit) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 12px 36px rgba(42,171,238,0.5)";
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = canSubmit ? "0 8px 28px rgba(42,171,238,0.4)" : "none";
          }}
        >
          {connected ? "Rozpocznij debatę →" : "Łączenie..."}
        </button>
      </div>
    </div>
  );
}
