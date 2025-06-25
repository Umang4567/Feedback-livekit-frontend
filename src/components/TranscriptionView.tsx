import { useEffect } from 'react';
import useCombinedTranscriptions, { Message } from '../../hooks/useCombinedTranscriptions';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface TranscriptionViewProps {
    onMessagesUpdate: (messages: Message[]) => void;
    className?: string;
}

export default function TranscriptionView({ onMessagesUpdate, className }: TranscriptionViewProps) {
    const { groupedMessages } = useCombinedTranscriptions();

    useEffect(() => {
        onMessagesUpdate(groupedMessages);
    }, [groupedMessages, onMessagesUpdate]);

    return (
        <div className={cn("space-y-4", className)}>
            {groupedMessages.map((message: Message, index: number) => (
                <div
                    key={index}
                    className={cn(
                        "flex items-start gap-3",
                        message.role === 'assistant' ? 'justify-start' : 'justify-end'
                    )}
                >
                    {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-[#4F6BFF] flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <div
                        className={cn(
                            "max-w-[80%] p-3 rounded-xl",
                            message.role === 'assistant'
                                ? 'bg-[#2A2B36] text-white rounded-tl-none'
                                : 'bg-[#4F6BFF] text-white rounded-tr-none'
                        )}
                    >
                        <p className="text-sm">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-[#4F6BFF]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-[#4F6BFF]">U</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
} 