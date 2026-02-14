import React from "react";

export default function WelcomeScreen({ onStart }) {
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 32px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glows */}
      <div style={{
        position: "absolute", top: "15%", left: "5%",
        width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle, #2AABEE0a, transparent 70%)",
        animation: "pulse 5s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "5%",
        width: 200, height: 200, borderRadius: "50%",
        background: "radial-gradient(circle, #8E24AA0a, transparent 70%)",
        animation: "pulse 5s ease-in-out 2s infinite",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", textAlign: "center", maxWidth: 400, animation: "fadeInUp 0.6s ease" }}>
        <div style={{
          fontSize: 72, marginBottom: 28,
          filter: "drop-shadow(0 0 24px rgba(42,171,238,0.5))",
          animation: "pulse 3s ease-in-out infinite",
        }}>🔥</div>

        <h1 style={{
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: -1.5,
          lineHeight: 1.1,
          margin: "0 0 14px",
          background: "linear-gradient(135deg, #e8f0fe 30%, #2AABEE)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Debate Arena
        </h1>

        <p style={{
          color: "#4a6fa5",
          fontSize: 15,
          lineHeight: 1.7,
          margin: "0 0 44px",
        }}>
          Wrzuć kontrowersyjną tezę. Pięć agentów AI podzieli się na obozy i będzie walczyć argumentami w real time — każdy broni swojej pozycji za wszelką cenę.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 44 }}>
          {[
            { emoji: "⚡", text: "Real-time debate przez WebSocket" },
            { emoji: "🤖", text: "5 unikalnych osobowości AI" },
            { emoji: "💬", text: "Interfejs jak Telegram" },
          ].map(({ emoji, text }) => (
            <div key={text} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#1a2438", borderRadius: 10, padding: "10px 16px",
              textAlign: "left",
            }}>
              <span style={{ fontSize: 18 }}>{emoji}</span>
              <span style={{ color: "#8aabcc", fontSize: 13 }}>{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          style={{
            background: "linear-gradient(135deg, #2AABEE, #1a8bc4)",
            border: "none", color: "#fff",
            padding: "16px 56px",
            borderRadius: 50,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: 0.2,
            boxShadow: "0 8px 32px rgba(42,171,238,0.45)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(42,171,238,0.55)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(42,171,238,0.45)";
          }}
        >
          Wejdź do areny →
        </button>
      </div>
    </div>
  );
}
