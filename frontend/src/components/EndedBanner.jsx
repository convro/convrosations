import React from "react";
import { RotateCcw, History } from "lucide-react";

export default function EndedBanner({ messageCount, onNewDebate, onShowHistory }) {
  return (
    <div className="ended-banner">
      <div className="ended-banner__info">
        <div className="ended-banner__title">Debate ended</div>
        <div className="ended-banner__count">{messageCount} messages</div>
      </div>
      <div className="ended-banner__actions">
        {onShowHistory && (
          <button className="ended-banner__btn ended-banner__btn--ghost" onClick={onShowHistory}>
            <History size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            History
          </button>
        )}
        <button className="ended-banner__btn" onClick={onNewDebate}>
          <RotateCcw size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          New debate
        </button>
      </div>
    </div>
  );
}
