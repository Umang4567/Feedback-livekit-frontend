"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { Mic, MicOff, Bot, Loader2, ChevronLeft } from "lucide-react";
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, RoomOptions, Track } from 'livekit-client';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
} from '@livekit/components-react';
import { vapi } from "@/lib/vapi.sdk";

import { cn } from "@/lib/utils";
import {
  userDetailsAtom,
  feedbackDataAtom,
  type FeedbackData,
  selectedEventAtom,
} from "@/lib/atoms";
import UserDetailsForm from "./UserDetailsForm";
import EventSelection from "./EventSelection";
import { saveFeedback } from "@/utils/supabase/feedbackService";
import { FallbackImage } from "./ui/fallback-image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextFeedback } from "./TextFeedback";
import AgentFace from "./AgentFace";
import FeedbackInterface from "./FeedbackInterface";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
  id?: string;
  status?: "complete" | "streaming";
}

interface AgentProps {
  type?: "feedback" | "generate";
  questions: string[];
  onCallComplete?: () => void;
  onBackToEvents?: () => void;
}

interface InterviewConfig {
  userName: string;
  skillLevel: string;
  systemPrompt: string;
  questions: string[];
  maxResponseTime: number;
  silenceThreshold: number;
}

const Agent = ({
  type = "feedback",
  questions,
  onCallComplete,
  onBackToEvents,
}: AgentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [userDetails, setUserDetails] = useAtom(userDetailsAtom);
  const [feedbackData, setFeedbackData] = useAtom(feedbackDataAtom);
  const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<"voice" | "text">("voice");
  const [isMicActive, setIsMicActive] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [serverUrl, setServerUrl] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const router = useRouter();

  // Helper function to get event name
  const getEventName = () => {
    if (!selectedEvent) return "";
    return selectedEvent.event?.name || selectedEvent.title;
  };

  // Connect to LiveKit room
  const connectToRoom = async () => {
    try {
      setIsConnecting(true);

      // Get connection details from our API
      const response = await fetch(`/api/connection-details?name=${encodeURIComponent(userDetails?.name || 'Guest')}&skillLevel=mid&courseName=${encodeURIComponent(getEventName())}`);
      const { serverUrl: url, roomName, participantToken } = await response.json();

      setServerUrl(url);
      setToken(participantToken);

      // Fetch interview info
      const infoResponse = await fetch(`/api/interview-info?participantId=${encodeURIComponent(userDetails?.name || 'Guest')}&roomName=${encodeURIComponent(roomName)}`);
      if (!infoResponse.ok) {
        throw new Error('Failed to fetch interview info');
      }
      const { config } = await infoResponse.json();
      setInterviewConfig(config);
      setCallStatus(CallStatus.CONNECTING);
    } catch (error) {
      console.error('Failed to connect to room:', error);
      setCallStatus(CallStatus.INACTIVE);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle room connection events
  const handleRoomConnected = () => {
    setCallStatus(CallStatus.ACTIVE);
  };

  const handleParticipantConnected = (participant: RemoteParticipant) => {
    console.log('Agent connected:', participant);
    setCallStatus(CallStatus.ACTIVE);
  };

  const handleParticipantDisconnected = () => {
    console.log('Agent disconnected');
    handleDisconnect();
  };

  // Start the call automatically when the component mounts or when switching to voice mode
  useEffect(() => {
    if (
      userDetails &&
      selectedEvent &&
      feedbackMode === "voice" &&
      callStatus === CallStatus.INACTIVE
    ) {
      handleCall();
    }
  }, [userDetails, selectedEvent, feedbackMode, callStatus]);

  // Function to combine consecutive messages
  const appendMessageOrAdd = (newMessage: SavedMessage) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];

      // If there's no last message or the roles are different, add as new message
      if (!lastMessage || lastMessage.role !== newMessage.role) {
        return [...prevMessages, newMessage];
      }

      // If the roles match, combine the messages
      const updatedMessages = [...prevMessages];
      updatedMessages[updatedMessages.length - 1] = {
        ...lastMessage,
        content: `${lastMessage.content} ${newMessage.content}`,
        id: Date.now().toString(), // Update ID to trigger re-render
      };
      return updatedMessages;
    });
  };

  useEffect(() => {
    if (messages.length > 0 && feedbackMode === 'voice') {
      // Improved auto-scroll logic
      requestAnimationFrame(() => {
        const transcriptContainer = document.getElementById(
          "transcript-container"
        );
        const messageContainer =
          transcriptContainer?.querySelector('[role="log"]');

        if (messageContainer) {
          const isScrolledToBottom =
            messageContainer.scrollHeight - messageContainer.clientHeight <=
            messageContainer.scrollTop + 100;

          if (isScrolledToBottom) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
          }
        }
      });
    }
  }, [messages, feedbackMode]);

  // Load user details from localStorage on mount
  useEffect(() => {
    const savedUserDetails = localStorage.getItem('userDetails');
    if (savedUserDetails) {
      setUserDetails(JSON.parse(savedUserDetails));
    }
  }, []);

  // Save user details to localStorage whenever they change
  useEffect(() => {
    if (userDetails) {
      localStorage.setItem('userDetails', JSON.stringify(userDetails));
    }
  }, [userDetails]);

  const handleCall = async () => {
    if (callStatus !== CallStatus.INACTIVE) return;

    try {
      await connectToRoom();
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = async () => {
    if (room) {
      room.disconnect();
      setRoom(null);
    }
    setCallStatus(CallStatus.FINISHED);

    if (userDetails && selectedEvent && messages.length > 0) {
      setSavingFeedback(true);
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
          eventName: getEventName(),
          overall_sentiment: analysis.overall_sentiment,
          rating: analysis.rating,
          suggestions: analysis.suggestions,
          genai_interest: analysis.genai_interest,
          key_points: analysis.key_points,
        };
        setFeedbackData(newFeedbackData);

        // Save feedback to Supabase
        await saveFeedback(newFeedbackData);
        setShowThankYouDialog(true);
      } catch (error) {
        console.error("Failed to save feedback:", error);
      } finally {
        setSavingFeedback(false);
      }
    }
    if (onCallComplete) {
      onCallComplete();
    }
  };

  const handleCloseThankYouDialog = () => {
    setShowThankYouDialog(false);
    if (onCallComplete) {
      onCallComplete();
    }
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
    setFeedbackMode("voice"); // Reset to voice mode
    if (onBackToEvents) {
      onBackToEvents();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  // Render UI components
  return (
    <div className="relative w-full flex justify-center">
      <div className="flex flex-col items-center w-full max-w-4xl bg-[#1A1B26] backdrop-blur rounded-xl p-6">
        {/* Header with back button and text mode toggle */}
        <div className="w-full flex justify-between items-center mb-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleBackToEvents}
            className="text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to events
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (feedbackMode === "voice") {
                setFeedbackMode("text");
                if (room) {
                  room.disconnect();
                  setRoom(null);
                }
                vapi.stop();
                setCallStatus(CallStatus.INACTIVE);
              } else {
                setFeedbackMode("voice");
                handleCall();
              }
            }}
            className="text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {feedbackMode === "voice" ? "Can't speak? Try Text mode" : "Switch to Voice mode"}
          </Button>
        </div>

        {/* Centered Agent Face */}
        <div className="w-full flex flex-col items-center justify-center mb-8">
          <AgentFace isSpeaking={isSpeaking} />
          <div className="text-center mt-4">
            <p className="text-white/60 text-sm mb-1">Providing feedback for:</p>
            <h2 className="text-white text-lg font-medium">{getEventName()}</h2>
          </div>
        </div>

        {/* Feedback Interface - Voice or Text */}
        {feedbackMode === "voice" ? (
          serverUrl && token ? (
            <div className="w-full">
              <LiveKitRoom
                serverUrl={serverUrl}
                token={token}
                connect={true}
                onConnected={handleRoomConnected}
                audio={true}
                video={false}
              >
                <RoomAudioRenderer />
                <FeedbackInterface
                  courseName={getEventName()}
                  userName={userDetails?.name || 'Guest'}
                  onEndCall={handleDisconnect}
                />
              </LiveKitRoom>
            </div>
          ) : null
        ) : (
          <TextFeedback
            questions={[
              "Hey! I'm BuildFast Bot. Curious to know what you thought of {event}. Got 3–5 mins?",
              "What do you do {name}?",
              "How would you rate the {event} on a scale of one to ten, {name}?",
              "What did you like most about the {event}?",
              "What suggestions do you have to improve the {event}?",
              "We have a 8 week Generative AI Launchpad; would you be interested, {name}?",
              "Thanks for your feedback on the {event}, {name}. Have a great day!",
            ]}
            onComplete={handleDisconnect}
          />
        )}
      </div>

      {/* Thank you dialog */}
      <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thank You!</DialogTitle>
            <DialogDescription>
              Your feedback has been recorded. We appreciate your time and insights!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseThankYouDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Agent;
