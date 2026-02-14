import React, { useState } from "react";
import Avatar from "./Avatar.jsx";

const TABS = ["info", "members", "settings"];
const TAB_LABELS = { info: "Info", members: "Członkowie", settings: "Ustawienia" };

export default function GroupInfoPanel({ group, agents, settings, onSettingsChange, onClose }) {
  const [tab, setTab] = useState("info");

  return (
    <div style={{
      position: "absolute",
      top: 0, right: 0,
      width: "min(320px, 100%)",
      height: "100%",
      background: "#111927",
      borderLeft: "1px solid #1e2d44",
      display: "flex",
      flexDirection: "column",
      zIndex: 20,
      animation: "slideInRight 0.22s cubic-bezier(0.4,0,0.2,1)",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid #1e2d44",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ color: "#e8f0fe", fontWeight: 700, fontSize: 16 }}>Informacje</span>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#4a6fa5",
          cursor: "pointer", fontSize: 22, lineHeight: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 32, height: 32, borderRadius: "50%",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#1e2d44"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >×</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e2d44", flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1,
            padding: "11px 0",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: tab === t ? 700 : 500,
            color: tab === t ? "#2AABEE" : "#4a6fa5",
            fontFamily: "'DM Sans', sans-serif",
            textTransform: "uppercase",
            letterSpacing: 0.6,
            borderBottom: tab === t ? "2px solid #2AABEE" : "2px solid transparent",
            transition: "all 0.15s",
          }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

        {/* ── INFO TAB ─────────────────────── */}
        {tab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Group avatar */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #2AABEE, #1a5fa8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, margin: "8px auto 0",
              boxShadow: "0 4px 24px rgba(42,171,238,0.4)",
              animation: "glow 3s ease-in-out infinite",
            }}>🔥</div>

            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#e8f0fe", fontWeight: 800, fontSize: 17, lineHeight: 1.3 }}>
                {group?.name || "Debata"}
              </div>
              <div style={{ color: "#4a6fa5", fontSize: 13, marginTop: 4 }}>
                {agents.length + 1} uczestników
              </div>
            </div>

            <InfoCard label="Opis">
              <p style={{ color: "#c0d0e8", fontSize: 13, lineHeight: 1.6 }}>
                {group?.description || "—"}
              </p>
            </InfoCard>

            <InfoCard label="Link zaproszenia">
              <span style={{ color: "#2AABEE", fontSize: 13, fontFamily: "'DM Mono', monospace", wordBreak: "break-all" }}>
                t.me/+{group?.inviteCode || "..."}
              </span>
            </InfoCard>

            <div style={{ display: "flex", gap: 10 }}>
              <StatBox label="wiadomości" value={group?.messageCount ?? 0} />
              <StatBox label="rund" value={group?.roundCount ?? 0} />
              <StatBox label="agentów" value={agents.length} />
            </div>
          </div>
        )}

        {/* ── MEMBERS TAB ─────────────────── */}
        {tab === "members" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* You */}
            <MemberRow
              avatar={
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#1e2d44",
                  border: "2px solid #2AABEE",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                }}>👤</div>
              }
              name="Ty"
              sub="Administrator • Obserwator"
              subColor="#2AABEE"
              online
            />

            <div style={{ height: 1, background: "#1e2d44", margin: "8px 0" }} />

            {agents.map(agent => {
              const stanceLabel = agent.stance === "for" ? "Za tezą"
                : agent.stance === "against" ? "Przeciwko"
                : "Neutralny";
              return (
                <MemberRow
                  key={agent.id}
                  avatar={<Avatar agent={agent} size={40} showOnline />}
                  name={agent.name}
                  sub={`AI Agent • ${stanceLabel}`}
                  subColor={agent.color}
                  online
                />
              );
            })}
          </div>
        )}

        {/* ── SETTINGS TAB ─────────────────── */}
        {tab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Response delay */}
            <SettingCard label="Czas odpowiedzi agenta" sub={`${settings.responseDelay}s`}>
              <input type="range" min={2} max={20} value={settings.responseDelay}
                onChange={e => onSettingsChange({ ...settings, responseDelay: +e.target.value })}
                style={{ width: "100%", accentColor: "#2AABEE", marginTop: 10 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: "#3a5275", fontSize: 11 }}>2s</span>
                <span style={{ color: "#2AABEE", fontWeight: 700, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
                  {settings.responseDelay}s
                </span>
                <span style={{ color: "#3a5275", fontSize: 11 }}>20s</span>
              </div>
            </SettingCard>

            {/* Max rounds */}
            <SettingCard label="Liczba rund">
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {[5, 10, 15, 20].map(r => (
                  <button key={r} onClick={() => onSettingsChange({ ...settings, maxRounds: r })} style={{
                    flex: 1, padding: "9px 0",
                    borderRadius: 8, border: "none",
                    background: settings.maxRounds === r ? "#2AABEE" : "#1a2438",
                    color: settings.maxRounds === r ? "#fff" : "#4a6fa5",
                    cursor: "pointer", fontWeight: 700, fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.15s",
                  }}>{r}</button>
                ))}
              </div>
            </SettingCard>

            {/* Aggressiveness */}
            <SettingCard label="Agresywność debaty">
              <select value={settings.aggressiveness}
                onChange={e => onSettingsChange({ ...settings, aggressiveness: e.target.value })}
                style={{
                  marginTop: 10, width: "100%",
                  background: "#1a2438", border: "1px solid #2AABEE33",
                  color: "#c0d0e8", borderRadius: 10,
                  padding: "10px 14px", fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                  outline: "none",
                }}>
                <option value="calm">😌 Spokojny</option>
                <option value="moderate">💬 Umiarkowany</option>
                <option value="heated">🔥 Gorący</option>
                <option value="aggressive">💥 Agresywny</option>
              </select>
            </SettingCard>

            {/* Allow user join */}
            <SettingCard label="Możliwość dołączenia" sub="Zezwól sobie na udział w debacie">
              <div style={{ marginTop: 12 }}>
                <Toggle
                  value={settings.allowUserJoin}
                  onChange={v => onSettingsChange({ ...settings, allowUserJoin: v })}
                />
              </div>
            </SettingCard>

          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────── */

function InfoCard({ label, children }) {
  return (
    <div style={{ background: "#1a2438", borderRadius: 12, padding: 14 }}>
      <div style={{ color: "#3a6080", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ flex: 1, background: "#1a2438", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
      <div style={{ color: "#e8f0fe", fontWeight: 800, fontSize: 22, fontFamily: "'DM Mono', monospace" }}>{value}</div>
      <div style={{ color: "#3a5275", fontSize: 10, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function MemberRow({ avatar, name, sub, subColor, online }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      {avatar}
      <div style={{ flex: 1 }}>
        <div style={{ color: "#e8f0fe", fontWeight: 600, fontSize: 14 }}>{name}</div>
        <div style={{ color: subColor || "#4a6fa5", fontSize: 12, marginTop: 1 }}>{sub}</div>
      </div>
      {online && (
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", boxShadow: "0 0 6px #4CAF5088" }} />
      )}
    </div>
  );
}

function SettingCard({ label, sub, children }) {
  return (
    <div style={{ background: "#1a2438", borderRadius: 12, padding: 14 }}>
      <div style={{ color: "#c0d0e8", fontSize: 14, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ color: "#3a5275", fontSize: 12, marginTop: 2 }}>{sub}</div>}
      {children}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 50, height: 28, borderRadius: 14,
      background: value ? "#2AABEE" : "#1e2d44",
      border: `2px solid ${value ? "#2AABEE" : "#3a5275"}`,
      position: "relative", cursor: "pointer",
      transition: "all 0.2s",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        background: "#fff",
        position: "absolute", top: 2,
        left: value ? 24 : 2,
        transition: "left 0.2s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
      }} />
    </div>
  );
}
