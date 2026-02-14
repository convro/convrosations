import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { useDebateSocket } from "./hooks/useDebateSocket.jsx";
import Avatar from "./components/Avatar.jsx";
import Message from "./components/Message.jsx";
import TypingIndicator from "./components/TypingIndicator.jsx";
import GroupInfoPanel from "./components/GroupInfoPanel.jsx";
import InputBar from "./components/InputBar.jsx";
import EndedBanner from "./components/EndedBanner.jsx";
import WelcomeScreen from "./screens/WelcomeScreen.jsx";
import TopicInputScreen from "./screens/TopicInputScreen.jsx";
import LoadingScreen from "./screens/LoadingScreen.jsx";
import { Swords, MoreVertical } from "lucide-react";

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

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
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
      setTypingAgent({ id: agentId });
    });

    on("message", ({ message }) => {
      setTypingAgent(null);
      setMessages(prev => [...prev, message]);
    });

    on("group_update", ({ group }) => setGroup(group));
    on("typing_stop", () => {});
    on("debate_end", () => setPhase(PHASES.ENDED));

    on("error", ({ message }) => {
      console.error("[DEBATE ERROR]", message);
      toast.error(message || "Something went wrong");
      setPhase(PHASES.INPUT);
    });
  }, [on]);

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
    send({ type: "start_debate", topic: t, settings });
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
  const showChat = phase === PHASES.DEBATE || phase === PHASES.ENDED;

  return (
    <>
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
          },
        }}
      />

      <div className="app-shell">
        {/* ── Chat Header ──────────────────────────── */}
        {showChat && group && (
          <ChatHeader
            group={group}
            agents={agents}
            typingAgent={resolvedTypingAgent}
            connected={connected}
            onInfoClick={() => setShowPanel(v => !v)}
          />
        )}

        {/* ── Main content ─────────────────────────── */}
        <div className="app-content">
          <AnimatePresence mode="wait">
            {phase === PHASES.WELCOME && (
              <motion.div key="welcome" style={{ flex: 1, display: "flex" }} {...pageVariants}>
                <WelcomeScreen onStart={() => setPhase(PHASES.INPUT)} />
              </motion.div>
            )}

            {phase === PHASES.INPUT && (
              <motion.div key="input" style={{ flex: 1, display: "flex" }} {...pageVariants}>
                <TopicInputScreen
                  onSubmit={handleTopicSubmit}
                  connected={connected}
                />
              </motion.div>
            )}

            {phase === PHASES.LOADING && (
              <motion.div key="loading" style={{ flex: 1, display: "flex" }} {...pageVariants}>
                <LoadingScreen topic={topic} currentStep={loadingStep} />
              </motion.div>
            )}

            {showChat && (
              <motion.div key="chat" style={{ flex: 1, display: "flex", flexDirection: "column" }} {...pageVariants}>
                <ChatFeed
                  messages={messages}
                  agents={agents}
                  typingAgent={resolvedTypingAgent}
                  messagesEndRef={messagesEndRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Input bar ────────────────────────────── */}
        {phase === PHASES.DEBATE && settings.allowUserJoin && (
          <InputBar
            value={userInput}
            onChange={setUserInput}
            onSend={handleUserSend}
            inputRef={inputRef}
          />
        )}

        {/* ── Ended banner ─────────────────────────── */}
        {phase === PHASES.ENDED && (
          <EndedBanner
            messageCount={group?.messageCount || 0}
            onNewDebate={handleNewDebate}
          />
        )}

        {/* ── Group Info Panel ─────────────────────── */}
        <AnimatePresence>
          {showPanel && group && (
            <>
              <motion.div
                className="panel-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowPanel(false)}
              />
              <GroupInfoPanel
                group={group}
                agents={agents}
                settings={settings}
                onSettingsChange={setSettings}
                onClose={() => setShowPanel(false)}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ── Sub-components ──────────────────────────────────── */

function ChatHeader({ group, agents, typingAgent, connected, onInfoClick }) {
  return (
    <div className="chat-header" onClick={onInfoClick}>
      <div className="chat-header__avatar">
        <Swords size={20} />
      </div>

      <div className="chat-header__info">
        <div className="chat-header__name">{group.name}</div>
        <div className={`chat-header__status ${typingAgent ? "chat-header__status--typing" : ""}`}>
          {typingAgent
            ? `${typingAgent.name} is typing...`
            : `${agents.length + 1} participants`}
        </div>
      </div>

      <div className={`chat-header__dot ${connected ? "chat-header__dot--online" : "chat-header__dot--offline"}`} />
      <button className="btn-ghost" onClick={e => { e.stopPropagation(); onInfoClick(); }}>
        <MoreVertical size={18} />
      </button>
    </div>
  );
}

function ChatFeed({ messages, agents, typingAgent, messagesEndRef }) {
  return (
    <div className="chat-feed">
      <div className="chat-feed__date">
        <span className="chat-feed__date-badge">
          {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
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
