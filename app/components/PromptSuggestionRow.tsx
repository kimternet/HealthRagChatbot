import PromptSuggestionButton from "./PromptSuggestionButton";

interface PromptSuggestionRowProps {
    onPromptClick: (prompt: string) => void;
}

const PromptSuggestionRow = ({ onPromptClick }: PromptSuggestionRowProps) => {
    const prompts = [
        "최신 건강 뉴스를 알려주세요",
        "건강한 식단 추천해주세요",
        "효과적인 운동 방법 알려주세요",
        "스트레스 해소 방법 추천해주세요",
        "숙면을 위한 팁 알려주세요"
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