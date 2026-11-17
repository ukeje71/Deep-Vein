import {
  AudioLines,
  ChevronUpIcon,
  Mic,
  SlidersHorizontal,
} from "lucide-react";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const ChatForm = forwardRef(function ChatForm(
  {
    setChatHistory,
    isLoading,
    onLoadingChange,
    onInputFocus,
    onInputBlur,
  },
  ref,
) {
  const inputRef = useRef(null);
  const requestInFlightRef = useRef(false);
  const [isBusy, setIsBusy] = useState(false);
  const busy = isLoading ?? isBusy;

  const setBusy = (value) => {
    setIsBusy(value);
    onLoadingChange?.(value);
  };

  const sendPrompt = async (prompt, options = {}) => {
    const userMessage = prompt.trim();
    if (!userMessage || requestInFlightRef.current) return;

    requestInFlightRef.current = true;
    setBusy(true);

    const messageId = `assistant-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    setChatHistory((history) => {
      const withoutFailedMessage = options.failedMessageId
        ? history.filter((message) => message.id !== options.failedMessageId)
        : history;

      const nextHistory = options.failedMessageId
        ? withoutFailedMessage
        : [...withoutFailedMessage, { role: "user", text: userMessage }];

      return [
        ...nextHistory,
        { id: messageId, role: "assistant", text: "", loading: true },
      ];
    });

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
    }

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_APIKEY}`,
            "HTTP-Referer": "https://deep-vein.vercel.app/",
            "X-Title": "Deep Vein",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-3-ultra-550b-a55b:free",
            messages: [
              {
                role: "system",
                content:
                  "You are an **Africa Travel Expert Consultant** that recommends tourist spots, activities, and budget-friendly options. Follow these rules:\n\n1. **Destinations**: Suggest top/hidden-gem landmarks, cultural sites, and natural wonders with brief descriptions (best time to visit, significance).\n2. **Budget**: Adapt to 'cheap', 'luxury', or specific budgets (e.g., hostels vs. resorts, free vs. premium activities).\n3. **Activities/Food**: Recommend hikes, tours, festivals, and must-try local dishes.\n4. **Tips**: Include safety, visas, weather, and nearby attractions.\n5. **Format**: Use bullet points/short paragraphs. Ask follow-ups if needed.\n\n**Example**:\n- **Destination**: Cape Town, SA\n- **Why Visit?** Table Mountain, vineyards, penguin beaches.\n- **Budget**:\n  - 💸 Low: Free hiking, township tours (~$10).\n  - 💎 Luxury: Safari lodges ($500+/night), private wine tastings.\n- **Activities**: Robben Island tour, seafood at V&A Waterfront.\n- **Best Time**: Nov–Feb (summer).",
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || "The travel guide is unavailable.");
      }

      const assistantReply = data?.choices?.[0]?.message?.content;
      if (!assistantReply) {
        throw new Error("The travel guide returned an empty response.");
      }

      setChatHistory((history) =>
        history.map((message) =>
          message.id === messageId
            ? { ...message, text: assistantReply, loading: false }
            : message,
        ),
      );
    } catch (error) {
      console.error("API Error:", error);
      setChatHistory((history) =>
        history.map((message) =>
          message.id === messageId
            ? {
                ...message,
                text: "I couldn’t get a response just now. Please try again.",
                loading: false,
                error: true,
                retryPrompt: userMessage,
              }
            : message,
        ),
      );
    } finally {
      requestInFlightRef.current = false;
      setBusy(false);
    }
  };

  useImperativeHandle(ref, () => ({ sendPrompt }));

  const handleSubmit = (event) => {
    event.preventDefault();
    sendPrompt(inputRef.current?.value ?? "");
  };

  const handleInput = (event) => {
    const textarea = event.currentTarget;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      window.matchMedia("(min-width: 768px)").matches
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form className="chat-form" onSubmit={handleSubmit}>
      <fieldset className="composer-row" disabled={busy}>
        <textarea
          ref={inputRef}
          rows={1}
          placeholder="Ask Anything..."
          aria-label="Your message"
          className="message-input"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />
        <button
          type="submit"
          className="send-button"
          aria-label="Send message"
          disabled={busy}
        >
          <ChevronUpIcon size={22} aria-hidden="true" />
        </button>
      </fieldset>

      <div className="composer-tools" aria-hidden="true">
        <span className="tools-label">
          <SlidersHorizontal size={17} />
          <span>Tools</span>
          <span>+</span>
        </span>
        <span className="tools-icons">
          <Mic size={17} />
          <AudioLines size={17} />
        </span>
      </div>
    </form>
  );
});

export default ChatForm;
