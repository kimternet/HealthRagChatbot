import PromptSuggestionButton from "./PromptSuggestionButton";

interface PromptSuggestionRowProps {
    onPromptClick: (prompt: string) => void;
}

const PromptSuggestionRow = ({ onPromptClick }: PromptSuggestionRowProps) => {
    const prompts = [
        "건강한 생활을 위한 방법을 알려주세요",
        "균형 잡힌 식단 구성 방법을 알려주세요",
        "나에게 맞는 운동 방법을 찾는 법을 알려주세요",
        "일상 속 스트레스 관리 방법을 알려주세요",
        "건강한 수면을 위한 조언과 방법이 필요해요"
    ];

    return (
        <div className="prompt-suggestions">
            {prompts.map((prompt, index) => (
                <button
                    key={index}
                    className="prompt-button"
                    onClick={() => onPromptClick(prompt)}
                >
                    {prompt}
                </button>
            ))}
        </div>
    );
};

export default PromptSuggestionRow;