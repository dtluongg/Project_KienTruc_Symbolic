import ChatbotIcon from "./ChatbotIcon";

const ChatMessage = ({chat}) => {
  return (
    <div className={`message ${chat.role==="model"?'bot':'user'}_message`}>
      {chat.role === "model" && <ChatbotIcon />}
      <p className="message_text">
        {chat.text}
      </p>
    </div>
  );
};

export default ChatMessage;
