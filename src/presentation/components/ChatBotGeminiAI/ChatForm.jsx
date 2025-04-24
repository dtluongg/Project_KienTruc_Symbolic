import React, { useRef } from "react";

const ChatForm = ({chatHistory, setChatHistory, genarateBotResponse}) => {
  const inputRef = useRef();
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    console.log(userMessage);
    inputRef.current.value = "";

    // Update chat history with the user's message
    setChatHistory((history)=> [...history, {role: "user", text: userMessage}]);

    setTimeout(()=> {
      // them thong bao dang nghi
      setChatHistory((history)=> [...history, {role: "model", text: "Thinking..."}]);
      //hien thi cau tra loi cua bot
      genarateBotResponse([...chatHistory, {role: "user", text: userMessage}]);

    }, 600);
    
  };

  return (
    <form action="#" className="chat_form" onSubmit={handleFormSubmit}>
      <input
      ref={inputRef}
        type="text"
        placeholder="Message...."
        className="message_input"
        required
      />
      <button className="material-symbols-rounded">arrow_upward</button>
    </form>
  );
};

export default ChatForm;
