import { Message } from "ai";
import ReactMarkdown from "react-markdown";

const Bubble = ({ message, isLoading, onStopGenerating }: { 
    message: Message; 
    isLoading?: boolean;
    onStopGenerating?: () => void;
}) => {
    return (
        <div className={`bubble ${message.role}`}>
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="paragraph">{children}</p>,
                    ul: ({ children }) => <ul className="list">{children}</ul>,
                    ol: ({ children }) => <ol className="list">{children}</ol>,
                    li: ({ children }) => <li className="list-item">{children}</li>,
                    strong: ({ children }) => <strong className="bold">{children}</strong>,
                }}
            >
                {message.content}
            </ReactMarkdown>
            {message.role === 'assistant' && isLoading && onStopGenerating && (
                <button onClick={onStopGenerating} className="stop-button">
                    생성 중지
                </button>
            )}
        </div>
    );
};

export default Bubble;