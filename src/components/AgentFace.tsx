import { cn } from "@/lib/utils";

interface AgentFaceProps {
  isSpeaking?: boolean;
  className?: string;
}

const AgentFace = ({ isSpeaking = false, className }: AgentFaceProps) => {
  return (
    <div
      className={cn(
        "relative w-24 h-24 bg-[#4F6BFF] rounded-full border-4 border-[#4F6BFF]/20 shadow-lg mx-auto mb-8",
        "before:absolute before:inset-0 before:rounded-full before:bg-[#4F6BFF]/20 before:animate-pulse",
        className
      )}
    >
      {/* Face container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Eyes */}
        <div
          className={cn(
            "absolute top-[35%] left-[30%] w-2.5 h-2.5 bg-white rounded-full transition-all duration-300",
            isSpeaking && "animate-pulse"
          )}
        />
        <div
          className={cn(
            "absolute top-[35%] right-[30%] w-2.5 h-2.5 bg-white rounded-full transition-all duration-300",
            isSpeaking && "animate-pulse"
          )}
        />

        {/* Mouth */}
        <div
          className={cn(
            "absolute bottom-[35%] left-1/2 -translate-x-1/2 w-5 h-2.5 bg-white transition-all duration-300",
            isSpeaking
              ? "rounded-full animate-bounce"
              : "rounded-b-full"
          )}
        />
      </div>

      {/* Speaking animation */}
      {isSpeaking && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
          <div
            className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping"
            style={{ animationDelay: "150ms" }}
          />
        </div>
      )}
    </div>
  );
};

export default AgentFace;
