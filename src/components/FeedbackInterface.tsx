import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    BarVisualizer,
    DisconnectButton,
    RoomAudioRenderer,
    RoomContext,
    VoiceAssistantControlBar,
    useVoiceAssistant,
    useRoomContext,
} from '@livekit/components-react';
import { Room, RoomEvent } from 'livekit-client';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { NoAgentNotification } from './NoAgentNotification';
import TranscriptionView from './TranscriptionView';
import { Message } from '../../hooks/useCombinedTranscriptions';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { userDetailsAtom, selectedEventAtom, feedbackDataAtom, type FeedbackData } from '@/lib/atoms';
import { saveFeedback } from '@/utils/supabase/feedbackService';

interface FeedbackInterfaceProps {
    courseName: string;
    userName: string;
    onEndCall: () => void;
}

export default function FeedbackInterface({ courseName, userName, onEndCall }: FeedbackInterfaceProps) {
    const { state: agentState, audioTrack } = useVoiceAssistant();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const room = useRoomContext();
    const [userDetails] = useAtom(userDetailsAtom);
    const [selectedEvent] = useAtom(selectedEventAtom);
    const [, setFeedbackData] = useAtom(feedbackDataAtom);
    const [isSaving, setIsSaving] = useState(false);

    const handleMessagesUpdate = (updatedMessages: Message[]) => {
        setMessages(updatedMessages);
    };

    const handleEndCallClick = async () => {
        if (!userDetails || !selectedEvent || !messages.length) {
            onEndCall();
            return;
        }

        setIsSaving(true);
        try {
            // Analyze the feedback
            const analysisResponse = await fetch("/api/analyze-feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages }),
            });

            const analysis = await analysisResponse.json();

            const newFeedbackData: FeedbackData = {
                userDetails,
                transcript: messages,
                timestamp: new Date().toISOString(),
                eventId: selectedEvent.api_id,
                eventName: courseName,
                overall_sentiment: analysis.overall_sentiment,
                rating: analysis.rating,
                suggestions: analysis.suggestions,
                genai_interest: analysis.genai_interest,
                key_points: analysis.key_points,
            };

            // Save feedback to Supabase
            await saveFeedback(newFeedbackData);
            setFeedbackData(newFeedbackData);
        } catch (error) {
            console.error("Failed to save feedback:", error);
        } finally {
            setIsSaving(false);
            onEndCall();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative rounded-2xl overflow-hidden bg-[#1A1B26]/80 w-full"
            >
                <div className="p-6">
                    <ScrollArea className="h-[400px] rounded-lg bg-background backdrop-blur-sm p-4 w-full border-white-90/2 border glass">
                        <div className="space-y-4">
                            <TranscriptionView
                                onMessagesUpdate={handleMessagesUpdate}
                                className="space-y-4"
                            />
                        </div>
                    </ScrollArea>

                    <div className="mt-6 flex flex-col items-center gap-4 w-full">
                        {/* <VoiceAssistantControlBar /> */}
                        <Button
                            onClick={handleEndCallClick}
                            className="bg-[#F87171] hover:bg-[#EF4444] text-white rounded-full px-8 py-6 transition-colors"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving feedback...' : 'End Call'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
} 