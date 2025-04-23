import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./ChatbotIcon";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";
import "./ChatBotGeminiAI.css";


const ChatBotGeminiAI = () => {
    const [chatHistory, setChatHistory] = useState([]);
    const [showChatbot, setShowChatbot] = useState(false);
    const chatBodyRef = useRef();
    const genarateBotResponse = async (history) => {
        console.log(history);
        history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

        //Update history:
        const updateHistory = (text) => {
            setChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), { role: "model", text: text }]);
        }


        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: history })
        }
        try {
            const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error.message || "Error fetching response");
            }
            const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1').trim();
            updateHistory(apiResponseText);
            console.log(data);
        } catch (error) {
            console.error("Error fetching response:", error);
        }
    };

    useEffect(() => {
        // auto scroll to bottom
        chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
    }, [chatHistory]);

    return (
        <div className={`container ${showChatbot ? "show_chatbot" : ""}`}>
            <button onClick={() => setShowChatbot(prev => !prev)} id="chatbot_toggler">
                <span className="material-symbols-rounded">
                    mode_comment
                </span>
                <span className="material-symbols-rounded">
                    close
                </span>
            </button>

            <div className="chatbot_popup">
                {/* Header */}
                <div className="chat_header">
                    <div className="header_info">
                        <ChatbotIcon />
                        <h2 className="logo_text">Chat bot</h2>
                    </div>
                    <button onClick={() => setShowChatbot(prev => !prev)} className="material-symbols-rounded">
                        keyboard_arrow_down
                    </button>
                </div>

                {/* Body */}
                <div ref={chatBodyRef} className="chat_body">
                    <div className="message bot_message">
                        <ChatbotIcon />
                        <p className="message_text">
                            Hey there <br /> How can I help you today?
                        </p>
                    </div>
                    {/* Tu dong render chat:  */}
                    {chatHistory.map((chat, index) => (
                        <ChatMessage key={index} chat={chat} />
                    ))}
                </div>

                {/* footer */}
                <div className="footer">
                    <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} genarateBotResponse={genarateBotResponse} />

                </div>
            </div>
        </div>
    );
}

export default ChatBotGeminiAI
