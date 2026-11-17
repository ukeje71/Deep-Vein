import { memo, useState } from "react";
import { Check, Copy, RotateCw } from "lucide-react";
import UserAvatar from "../assets/Samuel.jpg";

const renderInlineFormatting = (text, keyPrefix) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-bold-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyPrefix}-text-${index}`}>{part}</span>;
  });
};

const renderMessageText = (text) =>
  text.split("\n").map((line, index) => {
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (bullet || numbered) {
      return (
        <div className="formatted-list-item" key={`line-${index}`}>
          <span className="list-marker" aria-hidden="true">
            {numbered ? `${line.match(/^\s*(\d+)/)?.[1]}.` : "•"}
          </span>
          <span>{renderInlineFormatting((bullet ?? numbered)[1], index)}</span>
        </div>
      );
    }

    return (
      <p className="formatted-line" key={`line-${index}`}>
        {line ? renderInlineFormatting(line, index) : <br />}
      </p>
    );
  });

const ChatMessage = memo(function ChatMessage({ chat, onRetry }) {
  const [copied, setCopied] = useState(false);
  const isBot = chat.role === "assistant";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chat.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard access may be unavailable in non-secure contexts.
    }
  };

  if (chat.loading) {
    return (
      <div className="message bot-message" aria-label="Navigator is replying">
        <div className="message-text typing-bubble">
          <span className="typing-label">Navigator is thinking</span>
          <span className="typing-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`message ${isBot ? "bot-message" : "user-message"}`}>
      {isBot ? (
        <div className="message-content">
          <div className={`message-text ${chat.error ? "error-bubble" : "bot-bubble"}`}>
            {renderMessageText(chat.text)}
            {chat.error && chat.retryPrompt && (
              <button
                type="button"
                className="retry-button"
                onClick={() => onRetry?.(chat.retryPrompt, chat.id)}
              >
                <RotateCw size={15} />
                <span>Retry</span>
              </button>
            )}
          </div>
          {!chat.error && (
            <button
              type="button"
              className="copy-button"
              onClick={handleCopy}
              aria-label={copied ? "Copied reply" : "Copy reply"}
              title={copied ? "Copied" : "Copy reply"}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="message-text user-bubble">
            {renderMessageText(chat.text)}
          </div>
          <img
            src={UserAvatar}
            alt=""
            className="user-avatar"
            loading="lazy"
          />
        </>
      )}
    </div>
  );
});

export default ChatMessage;
