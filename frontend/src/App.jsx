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
import AgentProfileCard from "./components/AgentProfileCard.jsx";
import WelcomeScreen from "./screens/WelcomeScreen.jsx";
import TopicInputScreen from "./screens/TopicInputScreen.jsx";
import LoadingScreen from "./screens/LoadingScreen.jsx";
import DebateHistoryScreen from "./screens/DebateHistoryScreen.jsx";
import SurveyScreen from "./screens/SurveyScreen.jsx";
import { Swords, MoreVertical, ArrowLeft, History } from "lucide-react";

const PHASES = {
  WELCOME: "welcome",
  INPUT: "input",
  SURVEY: "survey",
  LOADING: "loading",
  DEBATE: "debate",
  ENDED: "ended",
  HISTORY: "history",
  VIEWING: "viewing",
};

const DEFAULT_SETTINGS = {
  responseDelay: 5,
  maxRounds: 10,
  allowUserJoin: true,
  aggressiveness: 50,
  language: "en",
  enableFactChecker: false,
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
  const [debateHistory, setDebateHistory] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [profileAgent, setProfileAgent] = useState(null);
  const [replyMap, setReplyMap] = useState({}); // msgId -> replyToMsg

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { connected, send, on } = useDebateSocket();

  /* -- Auto-scroll --------------------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingAgent]);

  /* -- WebSocket event handlers -------------------- */
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

    on("debate_history", ({ debates }) => {
      setDebateHistory(debates);
    });

    on("debate_loaded", ({ debate }) => {
      setTopic(debate.topic);
      setMessages(debate.messages);
      setAgents(debate.agents);
      setGroup(debate.group);
      setPhase(PHASES.VIEWING);
    });

    on("error", ({ message }) => {
      console.error("[DEBATE ERROR]", message);
      toast.error(message || "Something went wrong");
      setPhase(PHASES.INPUT);
    });
  }, [on]);

  const resolvedTypingAgent = typingAgent
    ? agents.find(a => a.id === typingAgent.id) || null
    : null;

  /* -- Actions ------------------------------------- */
  const handleTopicSubmit = useCallback((t) => {
    setTopic(t);
    setPhase(PHASES.SURVEY);
  }, []);

  const handleSurveyComplete = useCallback((surveyAnswers) => {
    setMessages([]);
    setAgents([]);
    setGroup(null);
    setTypingAgent(null);
    setLoadingStep("start");
    setReplyingTo(null);
    setReplyMap({});
    setPhase(PHASES.LOADING);
    send({ type: "start_debate", topic, settings });
  }, [send, topic, settings]);

  const handleUserSend = useCallback(() => {
    const text = userInput.trim();
    if (!text) return;
    const replyId = replyingTo?.id || null;
    send({ type: "user_message", text, replyToId: replyId });
    if (replyingTo) {
      // We'll add the reply mapping when the message comes back
      // For now, store pending reply
      setReplyMap(prev => ({ ...prev, [`pending_${Date.now()}`]: replyingTo }));
    }
    setUserInput("");
    setReplyingTo(null);
    inputRef.current?.focus();
  }, [userInput, send, replyingTo]);

  const handleReply = useCallback((msg) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  }, []);

  const handleForward = useCallback((msg) => {
    // Copy to clipboard
    const agent = agents.find(a => a.id === msg.agentId);
    const prefix = msg.isUser ? "You" : (agent?.name || "?");
    const text = `[${prefix}]: ${msg.text}`;
    navigator.clipboard?.writeText(text).then(() => {
      toast.success("Message copied to clipboard");
    }).catch(() => {
      toast("Couldn't copy - check permissions");
    });
  }, [agents]);

  const handleNewDebate = useCallback(() => {
    send({ type: "stop_debate" });
    setMessages([]);
    setAgents([]);
    setGroup(null);
    setTypingAgent(null);
    setReplyingTo(null);
    setReplyMap({});
    setPhase(PHASES.INPUT);
  }, [send]);

  const handleExitDebate = useCallback(() => {
    send({ type: "stop_debate" });
    setMessages([]);
    setAgents([]);
    setGroup(null);
    setTypingAgent(null);
    setReplyingTo(null);
    setReplyMap({});
    setPhase(PHASES.INPUT);
  }, [send]);

  const handleShowHistory = useCallback(() => {
    send({ type: "get_history" });
    setPhase(PHASES.HISTORY);
  }, [send]);

  const handleLoadDebate = useCallback((debateId) => {
    send({ type: "load_debate", debateId });
  }, [send]);

  const handleBackFromViewing = useCallback(() => {
    setMessages([]);
    setAgents([]);
    setGroup(null);
    setPhase(PHASES.INPUT);
  }, []);

  const handleAvatarClick = useCallback((agent) => {
    setProfileAgent(agent);
  }, []);

  const replyAgent = replyingTo ? agents.find(a => a.id === replyingTo.agentId) : null;

  /* -- Render -------------------------------------- */
  const showChat = phase === PHASES.DEBATE || phase === PHASES.ENDED || phase === PHASES.VIEWING;

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
        {/* -- Chat Header ----------------------------- */}
        {showChat && group && (
          <ChatHeader
            group={group}
            agents={agents}
            typingAgent={resolvedTypingAgent}
            connected={connected}
            onInfoClick={() => setShowPanel(v => !v)}
            onBack={phase === PHASES.VIEWING ? handleBackFromViewing : handleExitDebate}
            isViewing={phase === PHASES.VIEWING}
          />
        )}

        {/* -- Main content ---------------------------- */}
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
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              </motion.div>
            )}

            {phase === PHASES.SURVEY && (
              <motion.div key="survey" style={{ flex: 1, display: "flex" }} {...pageVariants}>
                <SurveyScreen
                  topic={topic}
                  onComplete={handleSurveyComplete}
                  onBack={() => setPhase(PHASES.INPUT)}
                />
              </motion.div>
            )}

            {phase === PHASES.LOADING && (
              <motion.div key="loading" style={{ flex: 1, display: "flex" }} {...pageVariants}>
                <LoadingScreen topic={topic} currentStep={loadingStep} />
              </motion.div>
            )}

            {phase === PHASES.HISTORY && (
              <motion.div key="history" style={{ flex: 1, display: "flex" }} {...pageVariants}>
                <DebateHistoryScreen
                  debates={debateHistory}
                  onLoad={handleLoadDebate}
                  onBack={() => setPhase(PHASES.INPUT)}
                />
              </motion.div>
            )}

            {showChat && (
              <motion.div key="chat" style={{ flex: 1, display: "flex", flexDirection: "column" }} {...pageVariants}>
                <ChatFeed
                  messages={messages}
                  agents={agents}
                  typingAgent={resolvedTypingAgent}
                  messagesEndRef={messagesEndRef}
                  onReply={handleReply}
                  onForward={handleForward}
                  onAvatarClick={handleAvatarClick}
                  replyMap={replyMap}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* -- Input bar ------------------------------- */}
        {phase === PHASES.DEBATE && settings.allowUserJoin && (
          <InputBar
            value={userInput}
            onChange={setUserInput}
            onSend={handleUserSend}
            inputRef={inputRef}
            replyingTo={replyingTo}
            replyAgent={replyAgent}
            onCancelReply={() => setReplyingTo(null)}
          />
        )}

        {/* -- Ended banner ---------------------------- */}
        {phase === PHASES.ENDED && (
          <EndedBanner
            messageCount={group?.messageCount || 0}
            onNewDebate={handleNewDebate}
            onShowHistory={handleShowHistory}
          />
        )}

        {/* -- Viewing banner (read-only) -------------- */}
        {phase === PHASES.VIEWING && (
          <div className="ended-banner">
            <div className="ended-banner__info">
              <div className="ended-banner__title">Viewing past debate</div>
              <div className="ended-banner__count">{messages.length} messages</div>
            </div>
            <button className="ended-banner__btn" onClick={handleBackFromViewing}>
              <ArrowLeft size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              Back
            </button>
          </div>
        )}

        {/* -- History button (on input screen) -------- */}
        {phase === PHASES.INPUT && (
          <div className="history-fab" onClick={handleShowHistory}>
            <History size={18} />
          </div>
        )}

        {/* -- Group Info Panel ------------------------ */}
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
                onAgentClick={handleAvatarClick}
              />
            </>
          )}
        </AnimatePresence>

        {/* -- Agent Profile Card ---------------------- */}
        <AnimatePresence>
          {profileAgent && (
            <AgentProfileCard
              agent={profileAgent}
              messages={messages}
              onClose={() => setProfileAgent(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* -- Sub-components ----------------------------------- */

function ChatHeader({ group, agents, typingAgent, connected, onInfoClick, onBack, isViewing }) {
  return (
    <div className="chat-header">
      <button className="btn-ghost chat-header__back" onClick={onBack}>
        <ArrowLeft size={18} />
      </button>

      <div className="chat-header__avatar" onClick={onInfoClick}>
        <Swords size={20} />
      </div>

      <div className="chat-header__info" onClick={onInfoClick}>
        <div className="chat-header__name">{group.name}</div>
        <div className={`chat-header__status ${typingAgent ? "chat-header__status--typing" : ""}`}>
          {typingAgent
            ? `${typingAgent.name} is typing...`
            : isViewing
            ? "Past debate"
            : `${agents.length + 1} participants`}
        </div>
      </div>

      <div className={`chat-header__dot ${connected ? "chat-header__dot--online" : "chat-header__dot--offline"}`} />
      <button className="btn-ghost" onClick={onInfoClick}>
        <MoreVertical size={18} />
      </button>
    </div>
  );
}

function ChatFeed({ messages, agents, typingAgent, messagesEndRef, onReply, onForward, onAvatarClick, replyMap }) {
  return (
    <div className="chat-feed">
      <div className="chat-feed__date">
        <span className="chat-feed__date-badge">
          {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {messages.map(msg => (
        <Message
          key={msg.id}
          msg={msg}
          agents={agents}
          onReply={onReply}
          onForward={onForward}
          onAvatarClick={onAvatarClick}
          replyTo={replyMap[msg.id] || null}
        />
      ))}

      {typingAgent && <TypingIndicator agent={typingAgent} />}
      <div ref={messagesEndRef} style={{ height: 8 }} />
    </div>
  );
}
