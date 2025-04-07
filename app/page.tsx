"use client"

import Image from "next/image";
import healthlogo from "../app/assets/healthlogo.png";
import { useChat } from "ai/react";
import { Message } from "ai";
import PromptSuggestionRow from "./components/PromptSuggestionRow";
import LoadingBubble from "./components/LoadingBubble";
import Bubble from "./components/Bubble";

const Home = () => {
    const { append, isLoading, messages, input, handleInputChange, handleSubmit, stop } = useChat();

    const noMessages = !messages || messages.length === 0;

    const handlePrompt = (promptText: string) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user"
        };
        append(msg);
    };

    const handleContinue = async (messageContent: string) => {
        const continueMsg: Message = {
            id: crypto.randomUUID(),
            content: "이전 답변을 이어서 계속 설명해주세요.",
            role: "user"
        };
        
        const context: Message = {
            id: crypto.randomUUID(),
            content: messageContent,
            role: "assistant"
        };

        append(continueMsg, { options: { body: { messages: [context] } } });
    };

    return (
        <main>
            <Image src={healthlogo} width={250} alt="healthlogo" />
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (
                    <>
                        <p className="starter-text">
                            ❣️건강은 우리 모두의 것입니다.😊❣️<br />
                            ❣️건강에 관련된 질문을 물어보세요‼️❣️
                        </p>
                        <br />
                        <PromptSuggestionRow onPromptClick={handlePrompt} />
                    </>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <Bubble 
                                key={`message-${index}`} 
                                message={message}
                                isLoading={isLoading && index === messages.length - 1}
                                onStopGenerating={stop}
                                onContinueGenerating={() => handleContinue(message.content)}
                            />
                        ))}
                        {isLoading && <LoadingBubble />}
                    </>
                )}
            </section>
            <form onSubmit={handleSubmit}>
                <input
                    className="question-box"
                    onChange={handleInputChange}
                    value={input}
                    placeholder="무엇이든 물어보세요!"
                />
                <input type="submit" value={isLoading ? "중지" : "제출"} onClick={isLoading ? stop : undefined} />
            </form>
        </main>
    );
};

export default Home;