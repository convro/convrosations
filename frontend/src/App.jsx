import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDebateSocket } from "./hooks/useDebateSocket.js";
import Avatar from "./components/Avatar.jsx";
import Message from "./components/Message.jsx";
import TypingIndicator from "./components/TypingIndicator.jsx";
import GroupInfoPanel from "./components/GroupInfoPanel.jsx";
import WelcomeScreen from "./screens/WelcomeScreen.jsx";
import TopicInputScreen from "./screens/TopicInputScreen.jsx";
import LoadingScreen from "./screens/LoadingScreen.jsx";

const PHASES = {
  WELCOME: "welcome",
  INPUT: "input",
  LOADING: "loading",
  DEBATE: "debate",
  ENDED: "ended",
};

const DEFAULT_SETTINGS = {
  responseDelay: 5,
  maxRounds: 10,
  allowUserJoin: true,
  aggressiveness: "moderate",
};

export default function App() {
  const [phase, setPhase] = useState(PHASES.WELCOME);
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [group, setGroup] = useState(null);
  const [typingAgent, setTypingAgent] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [userInput, setUserInput] = useState("");
  const [loadingStep, setLoadingStep] = useState("start");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { connected, send, on } = useDebateSocket();

  /* ── Auto-scroll ─────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingAgent]);

  /* ── WebSocket event handlers ────────────────────── */
  useEffect(() => {
    on("loading_step", ({ step }) => setLoadingStep(step));

    on("group_ready", ({ group }) => setGroup(group));

    on("agents_ready", ({ agents }) => setAgents(agents));

    on("debate_start", () => {
      setPhase(PHASES.DEBATE);
      setLoadingStep("done");
    });

    on("typing_start", ({ agentId }) => {
      setTypingAgent(prev => {
        // find agent from current agents list
        return { id: agentId };
      });
    });

    on("message", ({ message }) => {
      setTypingAgent(null);
      setMessages(prev => [...prev, message]);
    });

    on("group_update", ({ group }) => setGroup(group));

    on("typing_stop", () => {
      // typing_stop is handled implicitly by "message" arriving
    });

    on("debate_end", () => setPhase(PHASES.ENDED));

    on("error", ({ message }) => {
      console.error("[DEBATE ERROR]", message);
      alert(`Błąd: ${message}`);
      setPhase(PHASES.INPUT);
    });
  }, [on]);

  // Resolve typing agent from agents list
  const resolvedTypingAgent = typingAgent
    ? agents.find(a => a.id === typingAgent.id) || null
    : null;

  /* ── Actions ─────────────────────────────────────── */
  const handleTopicSubmit = useCallback((t) => {
    setTopic(t);
    setMessages([]);
    setAgents([]);
    setGroup(null);
    setTypingAgent(null);
    setLoadingStep("start");
    setPhase(PHASES.LOADING);

    send({
      type: "start_debate",
      topic: t,
      settings,
    });
  }, [send, settings]);

  const handleUserSend = useCallback(() => {
    const text = userInput.trim();
    if (!text) return;
    send({ type: "user_message", text });
    setUserInput("");
    inputRef.current?.focus();
  }, [userInput, send]);

  const handleNewDebate = useCallback(() => {
    send({ type: "stop_debate" });
    setMessages([]);
    setAgents([]);
    setGroup(null);
    setTypingAgent(null);
    setPhase(PHASES.INPUT);
  }, [send]);

  /* ── Render ──────────────────────────────────────── */
  return (
    <div style={{
      width: "100vw",
      height: "100dvh",
      background: "#0e1621",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Phone-like container */}
      <div style={{
        width: "100%",
        maxWidth: 480,
        height: "100%",
        maxHeight: 900,
        background: "#131d2e",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px #1e2d44",
      }}>

        {/* ── Chat Header (only in debate/ended) ──────── */}
        {(phase === PHASES.DEBATE || phase === PHASES.ENDED) && group && (
          <ChatHeader
            group={group}
            agents={agents}
            typingAgent={resolvedTypingAgent}
            connected={connected}
            onInfoClick={() => setShowPanel(v => !v)}
          />
        )}

        {/* ── Main content ─────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
          {phase === PHASES.WELCOME && (
            <WelcomeScreen onStart={() => setPhase(PHASES.INPUT)} />
          )}

          {phase === PHASES.INPUT && (
            <TopicInputScreen
              onSubmit={handleTopicSubmit}
              connected={connected}
            />
          )}

          {phase === PHASES.LOADING && (
            <LoadingScreen topic={topic} currentStep={loadingStep} />
          )}

          {(phase === PHASES.DEBATE || phase === PHASES.ENDED) && (
            <ChatFeed
              messages={messages}
              agents={agents}
              typingAgent={resolvedTypingAgent}
              messagesEndRef={messagesEndRef}
              group={group}
            />
          )}
        </div>

        {/* ── Input bar ─────────────────────────────────── */}
        {phase === PHASES.DEBATE && settings.allowUserJoin && (
          <InputBar
            value={userInput}
            onChange={setUserInput}
            onSend={handleUserSend}
            inputRef={inputRef}
          />
        )}

        {/* ── Ended banner ─────────────────────────────── */}
        {phase === PHASES.ENDED && (
          <EndedBanner
            messageCount={group?.messageCount || 0}
            onNewDebate={handleNewDebate}
          />
        )}

        {/* ── Group Info Panel ─────────────────────────── */}
        {showPanel && group && (
          <GroupInfoPanel
            group={group}
            agents={agents}
            settings={settings}
            onSettingsChange={setSettings}
            onClose={() => setShowPanel(false)}
          />
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────── */

function ChatHeader({ group, agents, typingAgent, connected, onInfoClick }) {
  return (
    <div
      onClick={onInfoClick}
      style={{
        padding: "10px 16px",
        background: "#111927",
        borderBottom: "1px solid #1e2d44",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        flexShrink: 0,
        userSelect: "none",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#141e2e"}
      onMouseLeave={e => e.currentTarget.style.background = "#111927"}
    >
      {/* Group avatar */}
      <div style={{
        width: 46, height: 46, borderRadius: "50%",
        background: "linear-gradient(135deg, #2AABEE, #1a5fa8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, flexShrink: 0,
        boxShadow: "0 2px 12px rgba(42,171,238,0.35)",
      }}>🔥</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: "#e8f0fe", fontWeight: 700, fontSize: 16,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {group.name}
        </div>
        <div style={{ color: "#4a6fa5", fontSize: 12, marginTop: 1 }}>
          {typingAgent
            ? <span style={{ color: "#43A047" }}>{typingAgent.name} pisze...</span>
            : `${agents.length + 1} uczestników`}
        </div>
      </div>

      {/* Connection dot */}
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: connected ? "#43A047" : "#EF5350",
        boxShadow: connected ? "0 0 8px #43A04788" : "none",
        flexShrink: 0,
        transition: "all 0.3s",
      }} />

      <div style={{ color: "#3a5275", fontSize: 20, flexShrink: 0 }}>⋮</div>
    </div>
  );
}

function ChatFeed({ messages, agents, typingAgent, messagesEndRef, group }) {
  return (
    <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Date separator */}
      <div style={{ textAlign: "center", padding: "4px 16px", marginBottom: 6 }}>
        <span style={{
          background: "#1a2438", color: "#4a6fa5", fontSize: 11,
          padding: "5px 14px", borderRadius: 20,
          fontFamily: "'DM Mono', monospace",
        }}>
          {new Date().toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {messages.map(msg => (
        <Message key={msg.id} msg={msg} agents={agents} />
      ))}

      {typingAgent && <TypingIndicator agent={typingAgent} />}

      <div ref={messagesEndRef} style={{ height: 8 }} />
    </div>
  );
}

function InputBar({ value, onChange, onSend, inputRef }) {
  return (
    <div style={{
      padding: "10px 14px",
      background: "#111927",
      borderTop: "1px solid #1e2d44",
      display: "flex",
      gap: 10,
      alignItems: "flex-end",
      flexShrink: 0,
    }}>
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSend()}
        placeholder="Napisz wiadomość..."
        style={{
          flex: 1,
          background: "#1a2438",
          border: "1px solid #2AABEE1a",
          borderRadius: 24,
          color: "#e8f0fe",
          fontSize: 14,
          padding: "11px 18px",
          outline: "none",
          fontFamily: "'DM Sans', sans-serif",
          transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = "#2AABEE55"}
        onBlur={e => e.target.style.borderColor = "#2AABEE1a"}
      />
      <button
        onClick={onSend}
        disabled={!value.trim()}
        style={{
          width: 44, height: 44, borderRadius: "50%",
          background: value.trim() ? "linear-gradient(135deg, #2AABEE, #1a8bc4)" : "#1a2438",
          border: "none",
          cursor: value.trim() ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, flexShrink: 0,
          boxShadow: value.trim() ? "0 4px 16px rgba(42,171,238,0.4)" : "none",
          transition: "all 0.2s",
          color: value.trim() ? "#fff" : "#3a5275",
        }}
      >
        ➤
      </button>
    </div>
  );
}

function EndedBanner({ messageCount, onNewDebate }) {
  return (
    <div style={{
      padding: "14px 20px",
      background: "#111927",
      borderTop: "1px solid #1e2d44",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      gap: 12,
    }}>
      <div>
        <div style={{ color: "#e8f0fe", fontWeight: 700, fontSize: 14 }}>Debata zakończona</div>
        <div style={{ color: "#4a6fa5", fontSize: 12, marginTop: 2 }}>{messageCount} wiadomości</div>
      </div>
      <button
        onClick={onNewDebate}
        style={{
          background: "linear-gradient(135deg, #2AABEE, #1a8bc4)",
          border: "none", color: "#fff",
          padding: "10px 20px", borderRadius: 24,
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 4px 16px rgba(42,171,238,0.35)",
          whiteSpace: "nowrap",
        }}
      >
        Nowa debata
      </button>
    </div>
  );
}
