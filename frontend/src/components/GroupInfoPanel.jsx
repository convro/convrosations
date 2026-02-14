import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Swords, User } from "lucide-react";
import Avatar from "./Avatar.jsx";

const TABS = ["info", "members", "settings"];
const TAB_LABELS = { info: "Info", members: "Members", settings: "Settings" };

export default function GroupInfoPanel({ group, agents, settings, onSettingsChange, onClose }) {
  const [tab, setTab] = useState("info");

  return (
    <motion.div
      className="panel"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 350 }}
    >
      {/* Header */}
      <div className="panel__header">
        <span className="panel__title">Details</span>
        <button className="panel__close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="panel__tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={`panel__tab ${tab === t ? "panel__tab--active" : ""}`}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="panel__content">

        {/* ── INFO TAB ─────────────────────── */}
        {tab === "info" && (
          <div className="panel-info">
            <div className="panel-info__avatar">
              <Swords size={32} />
            </div>

            <div className="panel-info__name">
              <div className="panel-info__group-name">{group?.name || "Debate"}</div>
              <div className="panel-info__participant-count">{agents.length + 1} participants</div>
            </div>

            <div className="panel-card">
              <div className="panel-card__label">Description</div>
              <p className="panel-card__text">{group?.description || "—"}</p>
            </div>

            <div className="panel-info__stats">
              <div className="panel-stat">
                <div className="panel-stat__value">{group?.messageCount ?? 0}</div>
                <div className="panel-stat__label">messages</div>
              </div>
              <div className="panel-stat">
                <div className="panel-stat__value">{group?.roundCount ?? 0}</div>
                <div className="panel-stat__label">rounds</div>
              </div>
              <div className="panel-stat">
                <div className="panel-stat__value">{agents.length}</div>
                <div className="panel-stat__label">agents</div>
              </div>
            </div>
          </div>
        )}

        {/* ── MEMBERS TAB ─────────────────── */}
        {tab === "members" && (
          <div className="panel-members">
            <div className="panel-member">
              <div className="panel-member__user-avatar">
                <User size={18} />
              </div>
              <div className="panel-member__info">
                <div className="panel-member__name">You</div>
                <div className="panel-member__role" style={{ color: "var(--accent)" }}>Admin &middot; Observer</div>
              </div>
              <div className="panel-member__online" />
            </div>

            <div className="panel-divider" />

            {agents.map(agent => {
              const stanceLabel = agent.stance === "for" ? "For"
                : agent.stance === "against" ? "Against"
                : "Neutral";
              return (
                <div key={agent.id} className="panel-member">
                  <Avatar agent={agent} size={40} showOnline />
                  <div className="panel-member__info">
                    <div className="panel-member__name">{agent.name}</div>
                    <div className="panel-member__role" style={{ color: agent.color }}>
                      AI Agent &middot; {stanceLabel}
                    </div>
                  </div>
                  <div className="panel-member__online" />
                </div>
              );
            })}
          </div>
        )}

        {/* ── SETTINGS TAB ─────────────────── */}
        {tab === "settings" && (
          <div className="panel-settings">

            {/* Response delay */}
            <div className="setting-card">
              <div className="setting-card__label">Response delay</div>
              <div className="setting-card__sub">{settings.responseDelay}s between responses</div>
              <div className="setting-card__control">
                <input
                  type="range" min={2} max={20}
                  className="setting-card__range"
                  value={settings.responseDelay}
                  onChange={e => onSettingsChange({ ...settings, responseDelay: +e.target.value })}
                />
                <div className="setting-card__range-labels">
                  <span className="setting-card__range-label">2s</span>
                  <span className="setting-card__range-value">{settings.responseDelay}s</span>
                  <span className="setting-card__range-label">20s</span>
                </div>
              </div>
            </div>

            {/* Max rounds */}
            <div className="setting-card">
              <div className="setting-card__label">Number of rounds</div>
              <div className="setting-card__control">
                <div className="setting-card__grid">
                  {[5, 10, 15, 20].map(r => (
                    <button
                      key={r}
                      className={`setting-card__grid-btn ${settings.maxRounds === r ? "setting-card__grid-btn--active" : ""}`}
                      onClick={() => onSettingsChange({ ...settings, maxRounds: r })}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Aggressiveness */}
            <div className="setting-card">
              <div className="setting-card__label">Debate intensity</div>
              <div className="setting-card__control">
                <select
                  className="setting-card__select"
                  value={settings.aggressiveness}
                  onChange={e => onSettingsChange({ ...settings, aggressiveness: e.target.value })}
                >
                  <option value="calm">Calm</option>
                  <option value="moderate">Moderate</option>
                  <option value="heated">Heated</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>

            {/* Allow user join */}
            <div className="setting-card">
              <div className="setting-card__label">Join debate</div>
              <div className="setting-card__sub">Allow yourself to participate</div>
              <div className="setting-card__control">
                <div
                  className={`toggle ${settings.allowUserJoin ? "toggle--on" : "toggle--off"}`}
                  onClick={() => onSettingsChange({ ...settings, allowUserJoin: !settings.allowUserJoin })}
                >
                  <div className="toggle__knob" />
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </motion.div>
  );
}
