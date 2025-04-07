import { Message } from "ai";
import ReactMarkdown from "react-markdown";

const Bubble = ({ 
    message, 
    isLoading, 
    onStopGenerating,
    onContinueGenerating 
}: { 
    message: Message; 
    isLoading?: boolean;
    onStopGenerating?: () => void;
    onContinueGenerating?: () => void;
}) => {
    // 메시지가 중간에 끊겼는지 확인하는 함수
    const isIncomplete = (content: string) => {
        // 문장이 완전하지 않은 경우를 체크
        const lastChar = content.trim().slice(-1);
        const incompleteEndings = [',', '...', '：', '>', '-'];
        return incompleteEndings.includes(lastChar) || 
               !['。', '.', '!', '?', '~', '」', '다', '요', '죠', '임', '함'].includes(lastChar);
    };

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
            {message.role === 'assistant' && (
                <div className="bubble-controls">
                    {isLoading && onStopGenerating && (
                        <button onClick={onStopGenerating} className="stop-button">
                            생성 중지
                        </button>
                    )}
                    {!isLoading && isIncomplete(message.content) && onContinueGenerating && (
                        <button onClick={onContinueGenerating} className="continue-button">
                            계속하기
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Bubble;