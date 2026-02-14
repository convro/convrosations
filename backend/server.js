require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const OpenAI = require("openai");

const app = express();
const server = http.createServer(app);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"],
}));
app.use(express.json());

// ─── DeepSeek client (OpenAI-compatible API) ─────────────────────────────────
const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// ─── WebSocket server ─────────────────────────────────────────────────────────
const wss = new WebSocket.Server({ server });

// Active debate sessions: Map<sessionId, DebateSession>
const sessions = new Map();

// ─── Agent definitions ────────────────────────────────────────────────────────
const AGENT_TEMPLATES = [
  { id: "aleksandra", name: "Aleksandra", initials: "AK", color: "#2AABEE", personality: "analityczna, opiera się na danych i faktach, cytuje badania, chłodna i logiczna" },
  { id: "marcus",     name: "Marcus",     initials: "MR", color: "#E53935", personality: "emocjonalny, pasjonuje się tematem, używa mocnych słów, odwołuje się do wartości i moralności" },
  { id: "sophia",     name: "Sophia",     initials: "SP", color: "#43A047", personality: "filozoficzna, zadaje pytania retoryczne, odwołuje się do historii i wielkich myślicieli, ironiczna" },
  { id: "dmitri",     name: "Dmitri",     initials: "DM", color: "#FB8C00", personality: "pragmatyczny, skupia się na konsekwencjach praktycznych, przytacza przykłady z życia, bezpośredni" },
  { id: "yuki",       name: "Yuki",       initials: "YK", color: "#8E24AA", personality: "sceptyczny, kwestionuje założenia, szuka dziur w argumentach innych, prowokacyjny" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function broadcast(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function assignStances(agents) {
  // Ensure good spread: ~2 for, ~2 against, ~1 neutral (or similar)
  const stances = ["for", "for", "against", "against", "neutral"];
  const shuffled = stances.sort(() => Math.random() - 0.5);
  return agents.map((agent, i) => ({ ...agent, stance: shuffled[i] }));
}

// ─── DeepSeek calls ───────────────────────────────────────────────────────────

async function generateGroupMeta(topic) {
  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: "Jesteś kreatywnym asystentem. Odpowiadaj TYLKO w JSON, bez markdown, bez komentarzy.",
      },
      {
        role: "user",
        content: `Na podstawie tematu debaty wygeneruj nazwę grupy czatowej (max 40 znaków, może zawierać emoji) i krótki opis (max 120 znaków). Temat: "${topic}"\n\nOdpowiedz w formacie JSON: {"name": "...", "description": "..."}`,
      },
    ],
  });

  try {
    const raw = response.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return {
      name: `🔥 Debata: ${topic.substring(0, 30)}...`,
      description: `Gorąca debata AI na temat: "${topic}"`,
    };
  }
}

async function generateAgentOpening(agent, topic, allAgents) {
  const stanceLabel = agent.stance === "for" ? "ZDECYDOWANIE ZA tą tezą" :
    agent.stance === "against" ? "ZDECYDOWANIE PRZECIWKO tej tezie" :
      "NEUTRALNY, ale prowokujesz do myślenia";

  const othersContext = allAgents
    .filter(a => a.id !== agent.id)
    .map(a => `${a.name} (${a.stance === "for" ? "za" : a.stance === "against" ? "przeciwko" : "neutralny"})`)
    .join(", ");

  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 180,
    messages: [
      {
        role: "system",
        content: `Jesteś ${agent.name}, uczestnikiem gorącej debaty grupowej. Twoja osobowość: ${agent.personality}. Twoje stanowisko: ${stanceLabel}. NIGDY nie zmieniasz zdania, bronisz swojej pozycji za wszelką cenę. Piszesz jak w grupowym czacie — krótko, naturalnie, po polsku. Max 2-3 zdania. Bez powitań i bez tytułowania innych.`,
      },
      {
        role: "user",
        content: `Temat debaty: "${topic}". Inni uczestnicy: ${othersContext}. Napisz swoje PIERWSZE zdanie otwierające debatę — przedstaw swoje stanowisko mocno i wyraźnie.`,
      },
    ],
  });

  return response.choices[0].message.content.trim();
}

async function generateAgentResponse(agent, topic, history, allAgents, settings) {
  const stanceLabel = agent.stance === "for" ? "ZDECYDOWANIE ZA tą tezą" :
    agent.stance === "against" ? "ZDECYDOWANIE PRZECIWKO tej tezie" :
      "NEUTRALNY, ale prowokujesz do myślenia";

  const aggressivenessMap = {
    calm: "spokojny, merytoryczny, grzeczny",
    moderate: "zaangażowany, wyraźnie broni swojego zdania",
    heated: "gorący, nie bierze jeńców, lekko agresywny",
    aggressive: "bardzo agresywny, bezpośrednio atakuje argumenty innych, może być sarkastyczny",
  };

  const aggressiveness = aggressivenessMap[settings.aggressiveness] || aggressivenessMap.moderate;

  const historyText = history.slice(-8).map(m => {
    const sender = m.isUser ? "USER (obserwator)" : allAgents.find(a => a.id === m.agentId)?.name || "?";
    return `${sender}: ${m.text}`;
  }).join("\n");

  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: `Jesteś ${agent.name}, uczestnikiem gorącej debaty grupowej. Twoja osobowość: ${agent.personality}. Twoje NIEZMIENNE stanowisko: ${stanceLabel}. Styl: ${aggressiveness}. ZASADY: nigdy nie zmieniasz zdania, możesz ripostować innych uczestników po imieniu, piszesz krótko jak w czacie (2-4 zdania max), po polsku, naturalnie. Debata toczy się w grupowym czacie Telegram.`,
      },
      {
        role: "user",
        content: `Temat: "${topic}"\n\nOstatnie wiadomości:\n${historyText}\n\nNapisz swoją odpowiedź — zareaguj na ostatnie wiadomości lub rozwiń swój argument.`,
      },
    ],
  });

  return response.choices[0].message.content.trim();
}

// ─── Debate session logic ─────────────────────────────────────────────────────

async function runDebateSession(sessionId, ws, topic, settings) {
  const session = sessions.get(sessionId);
  if (!session) return;

  // 1. Generate group meta
  broadcast(ws, { type: "loading_step", step: "group_meta", message: "Generuję nazwę grupy..." });
  const meta = await generateGroupMeta(topic);

  session.group = {
    ...meta,
    inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
    messageCount: 0,
    roundCount: 0,
  };
  broadcast(ws, { type: "group_ready", group: session.group });

  // 2. Assign stances & generate opening positions
  const agents = assignStances([...AGENT_TEMPLATES]);
  session.agents = agents;

  broadcast(ws, { type: "loading_step", step: "agents", message: "Agenci formułują stanowiska..." });

  for (const agent of agents) {
    broadcast(ws, { type: "loading_agent", agentId: agent.id, agentName: agent.name });
    await sleep(randomBetween(300, 700));
  }

  broadcast(ws, { type: "agents_ready", agents });

  // 3. Start debate — opening statements
  broadcast(ws, { type: "debate_start" });
  await sleep(1000);

  // Opening round — each agent speaks once
  for (const agent of agents) {
    if (!sessions.has(sessionId)) return; // session ended

    broadcast(ws, { type: "typing_start", agentId: agent.id });
    await sleep(randomBetween(1500, 3000));

    const text = await generateAgentOpening(agent, topic, agents);
    broadcast(ws, { type: "typing_stop", agentId: agent.id });

    const msg = {
      id: uuidv4(),
      agentId: agent.id,
      text,
      time: getTime(),
      round: 0,
    };
    session.messages.push(msg);
    session.group.messageCount++;
    broadcast(ws, { type: "message", message: msg });
    broadcast(ws, { type: "group_update", group: session.group });

    await sleep(randomBetween(800, 1500));
  }

  // 4. Main debate loop
  session.group.roundCount = 1;
  let round = 1;
  const maxRounds = settings.maxRounds || 10;

  while (round <= maxRounds && sessions.has(sessionId)) {
    const agentIndex = (round - 1) % agents.length;
    const agent = agents[agentIndex];

    // Typing delay
    broadcast(ws, { type: "typing_start", agentId: agent.id });

    const baseDelay = (settings.responseDelay || 5) * 1000;
    const jitter = randomBetween(-1000, 2000);
    await sleep(Math.max(1500, baseDelay + jitter));

    if (!sessions.has(sessionId)) return;

    const text = await generateAgentResponse(agent, topic, session.messages, agents, settings);
    broadcast(ws, { type: "typing_stop", agentId: agent.id });

    const msg = {
      id: uuidv4(),
      agentId: agent.id,
      text,
      time: getTime(),
      round,
    };
    session.messages.push(msg);
    session.group.messageCount++;
    session.group.roundCount = round;
    broadcast(ws, { type: "message", message: msg });
    broadcast(ws, { type: "group_update", group: session.group });

    round++;
    await sleep(randomBetween(500, 1200));
  }

  if (sessions.has(sessionId)) {
    broadcast(ws, { type: "debate_end", totalMessages: session.group.messageCount });
  }
}

function getTime() {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// ─── WebSocket handler ────────────────────────────────────────────────────────

wss.on("connection", (ws) => {
  const sessionId = uuidv4();
  console.log(`[WS] New connection: ${sessionId}`);

  sessions.set(sessionId, {
    id: sessionId,
    ws,
    messages: [],
    agents: [],
    group: null,
    running: false,
  });

  broadcast(ws, { type: "connected", sessionId });

  ws.on("message", async (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    const session = sessions.get(sessionId);
    if (!session) return;

    switch (msg.type) {
      case "start_debate": {
        if (session.running) return;
        session.running = true;
        const { topic, settings } = msg;

        if (!topic || topic.trim().length < 3) {
          broadcast(ws, { type: "error", message: "Temat jest za krótki." });
          return;
        }

        console.log(`[DEBATE] Starting: "${topic}" (session: ${sessionId})`);

        try {
          await runDebateSession(sessionId, ws, topic.trim(), settings || {});
        } catch (err) {
          console.error(`[DEBATE ERROR] ${err.message}`);
          broadcast(ws, { type: "error", message: "Błąd podczas debaty. Sprawdź klucz API." });
        }
        break;
      }

      case "user_message": {
        if (!session.running || !session.agents.length) return;
        const userMsg = {
          id: uuidv4(),
          agentId: null,
          isUser: true,
          text: msg.text,
          time: getTime(),
        };
        session.messages.push(userMsg);
        session.group.messageCount++;
        broadcast(ws, { type: "message", message: userMsg });
        broadcast(ws, { type: "group_update", group: session.group });
        break;
      }

      case "stop_debate": {
        sessions.delete(sessionId);
        broadcast(ws, { type: "debate_stopped" });
        break;
      }

      case "ping": {
        broadcast(ws, { type: "pong" });
        break;
      }
    }
  });

  ws.on("close", () => {
    console.log(`[WS] Disconnected: ${sessionId}`);
    sessions.delete(sessionId);
  });

  ws.on("error", (err) => {
    console.error(`[WS ERROR] ${sessionId}: ${err.message}`);
    sessions.delete(sessionId);
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", sessions: sessions.size, uptime: process.uptime() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Debate Arena backend running on port ${PORT}`);
  console.log(`📡 WebSocket ready`);
  console.log(`🔑 DeepSeek API: ${process.env.DEEPSEEK_API_KEY ? "configured ✓" : "MISSING ✗"}`);
});
