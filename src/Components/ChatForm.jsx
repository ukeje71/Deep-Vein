import { AudioLines, ChevronUpIcon, Mic, SlidersHorizontal } from "lucide-react";
import { useRef } from "react";

const ChatForm = ({ setChatHistory }) => {
  const inputRef = useRef();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;

    // Update UI with user message and thinking placeholder
    setChatHistory((history) => [
      ...history,
      { role: "user", text: userMessage },
      { role: "assistant", text: "Thinking..." },
    ]);

    // Clear input after message
    inputRef.current.value = "";

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
            model: "deepseek/deepseek-r1-0528:free", // Changed to DeepSeek R1
            messages: [
              {
                role: "system",
                content:
                  "You are an **Africa Travel Expert Consultant** that recommends tourist spots, activities, and budget-friendly options. Follow these rules:\n\n1. **Destinations**: Suggest top/hidden-gem landmarks, cultural sites, and natural wonders with brief descriptions (best time to visit, significance).\n2. **Budget**: Adapt to 'cheap', 'luxury', or specific budgets (e.g., hostels vs. resorts, free vs. premium activities).\n3. **Activities/Food**: Recommend hikes, tours, festivals, and must-try local dishes.\n4. **Tips**: Include safety, visas, weather, and nearby attractions.\n5. **Format**: Use bullet points/short paragraphs. Ask follow-ups if needed.\n\n**Example**:\n- **Destination**: Cape Town, SA\n- **Why Visit?** Table Mountain, vineyards, penguin beaches.\n- **Budget**:\n  - 💰 Low: Free hiking, township tours (~$10).\n  - 💎 Luxury: Safari lodges ($500+/night), private wine tastings.\n- **Activities**: Robben Island tour, seafood at V&A Waterfront.\n- **Best Time**: Nov–Feb (summer).",
              },
              {
                role: "user",
                content: userMessage, // Simplified (no array for text-only input)
              },
            ],
          }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      const assistantReply = data?.choices?.[0]?.message?.content;

      setChatHistory((history) => {
        const updated = history.filter((msg) => msg.text !== "Thinking...");
        return [
          ...updated,
          {
            role: "assistant",
            text: assistantReply || "No response from model.",
          },
        ];
      });
    } catch (error) {
      console.error("API Error:", error);
      setChatHistory((history) => {
        const updated = history.filter((msg) => msg.text !== "Thinking...");
        return [
          ...updated,
          { role: "assistant", text: "Failed to fetch response." },
        ];
      });
    }
  };

  return (
    <form className="chat-form flex flex-col" onSubmit={handleFormSubmit}>
      <fieldset className="flex justify-between">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask Anything..."
          className="message-input w-full border-0 outline-0"
          required
        />
        <button type="submit" className="send-button">
          <ChevronUpIcon
            color="white"
            size={25}
            className="p-1 bg-[#6d4fc2] rounded-full"
          />
        </button>
      </fieldset>

      {/* Tools */}
      <div className="mt-4 flex justify-between">
        <span className="flex flex-row gap-5">
          <SlidersHorizontal />
          <p>Tools</p>
          <p>+</p>
        </span>
        <span className="flex flex-row gap-4">
          <Mic />
          <AudioLines />
        </span>
      </div>
    </form>
  );
};

export default ChatForm;