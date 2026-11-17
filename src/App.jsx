import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ChevronLeftIcon,
  Trash2,
} from "lucide-react";
import ChatForm from "./Components/ChatForm.jsx";
import ChatMessage from "./Components/ChatMessage.jsx";

const SUGGESTIONS = [
  "Best places to visit in Ghana",
  "Budget trip to Kenya",
  "Safari tips",
  "Hidden gems in Nigeria",
];

const formatDate = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const App = () => {
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const savedChats = localStorage.getItem("chatHistory");
      const parsed = savedChats ? JSON.parse(savedChats) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [currentDate, setCurrentDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesRef = useRef(null);
  const chatFormRef = useRef(null);
  const nearBottomRef = useRef(true);
  const inputFocusedRef = useRef(false);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    const list = messagesRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    setCurrentDate(formatDate());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    } catch {
      // Keep the chat usable if storage is unavailable or full.
    }
  }, [chatHistory]);

  useEffect(() => {
    const list = messagesRef.current;
    if (!list || !nearBottomRef.current) return;
    scrollToBottom();
  }, [chatHistory, isLoading, scrollToBottom]);

  useEffect(() => {
    const updateViewport = () => {
      const viewport = window.visualViewport;
      const height = viewport?.height ?? window.innerHeight;
      const top = viewport?.offsetTop ?? 0;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
      document.documentElement.style.setProperty("--app-top", `${top}px`);

      if (inputFocusedRef.current && nearBottomRef.current) {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      }
    };

    updateViewport();
    window.visualViewport?.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
      document.documentElement.style.removeProperty("--app-height");
      document.documentElement.style.removeProperty("--app-top");
    };
  }, [scrollToBottom]);

  const handleScroll = () => {
    const list = messagesRef.current;
    if (!list) return;

    const distanceFromBottom =
      list.scrollHeight - list.scrollTop - list.clientHeight;
    const isNearBottom = distanceFromBottom < 100;
    nearBottomRef.current = isNearBottom;
    setShowScrollButton(!isNearBottom);
  };

  const handleClearChat = () => {
    if (!chatHistory.length) return;
    if (window.confirm("Clear your chat history? This cannot be undone.")) {
      setChatHistory([]);
      nearBottomRef.current = true;
      setShowScrollButton(false);
    }
  };

  const handleRetry = (prompt, failedMessageId) => {
    chatFormRef.current?.sendPrompt(prompt, { failedMessageId });
  };

  const handleInputFocus = () => {
    inputFocusedRef.current = true;
    nearBottomRef.current = true;
    setShowScrollButton(false);
    requestAnimationFrame(() => scrollToBottom("smooth"));
  };

  return (
    <main className="container">
      <section className="chatbot-popup" aria-label="Deep Vein travel chat">
        <header className="chat-header">
          <div className="header-info">
            <ChevronLeftIcon aria-hidden="true" size={22} />
            <h1 className="logo-text">Chat Ai</h1>
          </div>
          <div className="header-actions">
            <p className="current-date">{currentDate}</p>
            <button
              type="button"
              className="icon-button clear-chat-button"
              aria-label="Clear chat history"
              title="Clear chat"
              onClick={handleClearChat}
              disabled={!chatHistory.length || isLoading}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </header>

        <div
          className="chat-body"
          ref={messagesRef}
          onScroll={handleScroll}
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          <div className="welcome-message">
            <p className="message-text welcome-bubble">Hey there!</p>
            <p className="message-text welcome-bubble">I&apos;m Navigator</p>
            <p className="message-text welcome-bubble">What should I call you?</p>
          </div>

          {chatHistory.length === 0 && (
            <section className="suggestions" aria-label="Suggested questions">
              <p className="suggestions-label">Not sure where to start?</p>
              <div className="suggestion-list">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    className="suggestion-chip"
                    key={suggestion}
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      chatFormRef.current?.sendPrompt(suggestion)
                    }
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </section>
          )}

          {chatHistory.map((chat, index) => (
            <ChatMessage
              key={chat.id ?? `${chat.role}-${index}`}
              chat={chat}
              onRetry={handleRetry}
            />
          ))}

          <div className="messages-end" />
        </div>

        {showScrollButton && (
          <button
            className="scroll-to-bottom"
            type="button"
            onClick={() => {
              nearBottomRef.current = true;
              setShowScrollButton(false);
              scrollToBottom();
            }}
            aria-label="Scroll to latest message"
          >
            <ArrowDown size={18} />
            <span>Latest</span>
          </button>
        )}

        <footer className="chat-footer">
          <ChatForm
            ref={chatFormRef}
            setChatHistory={setChatHistory}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
            onInputFocus={handleInputFocus}
            onInputBlur={() => {
              inputFocusedRef.current = false;
            }}
          />
        </footer>
      </section>
    </main>
  );
};

export default App;
