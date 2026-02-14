import React from "react";
import { Send } from "lucide-react";

export default function InputBar({ value, onChange, onSend, inputRef }) {
  const hasText = value.trim().length > 0;

  return (
    <div className="input-bar">
      <input
        ref={inputRef}
        className="input-bar__input"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSend()}
        placeholder="Write a message..."
      />
      <button
        className={`input-bar__send ${hasText ? "input-bar__send--active" : "input-bar__send--disabled"}`}
        onClick={onSend}
        disabled={!hasText}
      >
        <Send size={17} />
      </button>
    </div>
  );
}
