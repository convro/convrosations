import React from "react";
import { RotateCcw } from "lucide-react";

export default function EndedBanner({ messageCount, onNewDebate }) {
  return (
    <div className="ended-banner">
      <div className="ended-banner__info">
        <div className="ended-banner__title">Debate ended</div>
        <div className="ended-banner__count">{messageCount} messages</div>
      </div>
      <button className="ended-banner__btn" onClick={onNewDebate}>
        <RotateCcw size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
        New debate
      </button>
    </div>
  );
}
