import React from "react";
import UserAvatar from "../assets/ukeje -Isaac.jpg";

const ChatMessage = ({ chat }) => {
  const isBot = chat.role === "assistant";

  return (
    <div className={`message flex items-end gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot ? (
        <>
          <p className="message-text bg-[#ffcdcf] rounded-2xl rounded-bl-none p-2 max-w-sm">
            {chat.text}
          </p>
        </>
      ) : (
        <>
          <p className="message-text min-w-15 text-black border-1 border-[#310001] rounded-2xl rounded-br-none py-2 max-w-sm">
            {chat.text}
          </p>
          <img
            src={UserAvatar}
            alt="User Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        </>
      )}
    </div>
  );
};

export default ChatMessage;
