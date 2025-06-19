import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon } from "lucide-react";
import ChatForm from "./Components/ChatForm.jsx";
import ChatMessage from "./Components/ChatMessage.jsx";

const App = () => {
  // Load chat history from localStorage or initialize empty array
  const [chatHistory, setChatHistory] = useState(() => {
    const savedChats = localStorage.getItem("chatHistory");
    return savedChats ? JSON.parse(savedChats) : [];
  });

  const [currentDate, setCurrentDate] = useState("");
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  // Format date as "Sunday 15th June 2025"
  const formatDate = () => {
    const date = new Date();
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Update date on mount
  useEffect(() => {
    setCurrentDate(formatDate());
  }, []);

  // Save to localStorage whenever chatHistory changes
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  return (
    <div className="container">
      <div className="chatbot-popup h-[100vh] md:h-fit">
        <div className="chat-header shadow-sm">
          <div className="flex flex-row items-center ">
            <ChevronLeftIcon />
            <h2 className="logo-text text-black text-xl font-bold">Chat Ai</h2>
          </div>
        </div>

        <span>
          <h2 className="text-center mt-5">{currentDate}</h2>
        </span>

        <div className="chat-body h-96 p-7 flex flex-col gap-4 overflow-y-auto">
          <div className="message bot-message flex flex-col gap-4">
            <p className="message-text w-fit bg-[#ffcdcf] rounded-2xl rounded-bl-none p-2 max-w-sm">
              Hey there!
            </p>
            <p className="message-text w-fit bg-[#ffcdcf] rounded-2xl rounded-bl-none p-2 max-w-sm">
              I'm Navigator
            </p>
            <p className="message-text w-fit bg-[#ffcdcf] rounded-2xl rounded-bl-none p-2 max-w-sm">
              What should I call you?
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}

          {/* This empty div is the scroll target */}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          <ChatForm setChatHistory={setChatHistory} />
        </div>
      </div>
    </div>
  );
};

export default App;
