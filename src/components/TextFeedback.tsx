"use client";

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { useChat } from "ai/react";
import {
  userDetailsAtom,
  feedbackDataAtom,
  type FeedbackData,
  selectedEventAtom,
} from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TextFeedbackProps {
  questions: string[];
  onComplete: () => void;
}

// Utility function to detect launchpad link requests
function isGenAILaunchpadRequest(text: string) {
  const patterns = [
    /8\s*week.*generative ai launchpad/i,
    /gen(erative)? ai.*launchpad/i,
    /genai.*launchpad/i,
    /ai launchpad/i,
    /genai course/i,
    /link.*launchpad/i,
    /launchpad.*link/i,
    /genai.*course/i,
    /course.*genai/i,
    /buildfastwithai\.com\/genai-course/i,
  ];
  return patterns.some((re) => re.test(text));
}

export const TextFeedback = ({ questions, onComplete }: TextFeedbackProps) => {
  const [userDetails] = useAtom(userDetailsAtom);
  const [selectedEvent] = useAtom(selectedEventAtom);
  const [, setFeedbackData] = useAtom(feedbackDataAtom);
  const [scrollKey, setScrollKey] = useState(0);
  const [inputFocusKey, setInputFocusKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);

  const getEventName = () => {
    if (!selectedEvent) return "";
    return selectedEvent.event?.name || selectedEvent.title;
  };

  const checkForCompletion = async (
    latestMessage: string,
    allMessages: any[]
  ) => {
    // Check for the exact completion trigger phrase (case-insensitive)
    const completionPhrases = [
      "Thank you for sharing your valuable feedback with us today!",
      "thank you for sharing your valuable feedback with us today",
      "Thank you for sharing your feedback with us today",
    ];

    const messageText = latestMessage.toLowerCase();
    const hasCompletionPhrase = completionPhrases.some((phrase) =>
      messageText.includes(phrase.toLowerCase())
    );

    // More strict completion detection - ensure we have covered all topics
    const userMessages = allMessages.filter((m) => m.role === "user");
    const conversationText = allMessages
      .map((m) => m.content)
      .join(" ")
      .toLowerCase();

    // Check if all key topics have been covered
    const hasProfessionTopic =
      conversationText.includes("work") ||
      conversationText.includes("job") ||
      conversationText.includes("profession");
    const hasRatingTopic = /rating|rate|score|\d+/.test(conversationText);
    const hasLikedTopic =
      conversationText.includes("like") ||
      conversationText.includes("appreciate") ||
      conversationText.includes("enjoy");
    const hasSuggestionsTopic =
      conversationText.includes("suggestion") ||
      conversationText.includes("improve");
    const hasGenAITopic =
      conversationText.includes("gen ai") ||
      conversationText.includes("launchpad") ||
      conversationText.includes("program");

    const allTopicsCovered =
      hasProfessionTopic &&
      hasRatingTopic &&
      hasLikedTopic &&
      hasSuggestionsTopic &&
      hasGenAITopic;
    const hasEnoughExchanges = userMessages.length >= 5;

    // Only trigger completion if we have the specific completion phrase AND all topics are covered
    if (hasCompletionPhrase && allTopicsCovered) {
      console.log("Completion detected:", {
        hasCompletionPhrase,
        allTopicsCovered,
        hasEnoughExchanges,
        topics: {
          hasProfessionTopic,
          hasRatingTopic,
          hasLikedTopic,
          hasSuggestionsTopic,
          hasGenAITopic,
        },
      });
      console.log("Final conversation for saving:", allMessages);

      setConversationComplete(true);
      setIsSaving(true);

      try {
        // Save feedback via the dedicated endpoint
        const response = await fetch("/api/save-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            userDetails,
            eventId: selectedEvent?.api_id,
            eventName: getEventName(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Feedback saved:", data);

          // Update the feedback data atom for the UI
          const feedbackData: FeedbackData = {
            userDetails: userDetails!,
            transcript: allMessages
              .filter((m) => m.role !== "data")
              .map((m) => ({ role: m.role, content: m.content })),
            timestamp: new Date().toISOString(),
            eventId: selectedEvent!.api_id,
            eventName: getEventName(),
            overall_sentiment: data.analysis?.overall_sentiment,
            rating: data.analysis?.rating,
            suggestions: data.analysis?.suggestions,
            genai_interest: data.analysis?.genai_interest,
            key_points: data.analysis?.key_points,
          };
          setFeedbackData(feedbackData);

          // Complete after a short delay
          setTimeout(() => {
            onComplete();
          }, 2000);
        } else {
          console.error("Failed to save feedback");
          setIsSaving(false);
        }
      } catch (error) {
        console.error("Error saving feedback:", error);
        setIsSaving(false);
      }
    }
  };

  const { messages, input, handleInputChange, handleSubmit, status, error } =
    useChat({
      api: "/api/chat-feedback",
      body: {
        userName: userDetails?.name || "User",
        eventName: getEventName(),
      },
      initialMessages: [
        {
          id: "greeting",
          role: "assistant",
          content: `Hi ${userDetails?.name
            }! I'm here to collect your feedback about ${getEventName()}. This will only take 3-5 minutes. Let's start - what do you do for work?`,
        },
      ],
      onError: (error) => {
        console.error("Chat error:", error);
      },
    });

  // Check for completion whenever messages change
  useEffect(() => {
    if (messages.length === 0 || conversationComplete || isSaving) return;

    const lastMessage = messages[messages.length - 1];

    // Only check completion for assistant messages
    if (lastMessage?.role === "assistant") {
      // Convert messages to simple format for API
      const conversationForSaving = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      checkForCompletion(lastMessage.content, conversationForSaving);
    }
  }, [messages, conversationComplete, isSaving]);

  useEffect(() => {
    const container = document.getElementById("chat-scroll-container");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
    if (status === "ready") {
      setInputFocusKey((k) => k + 1);
    }
  }, [scrollKey, messages, status]);

  useEffect(() => {
    const input = document.getElementById(
      "chat-input"
    ) as HTMLInputElement | null;
    if (input) input.focus();
  }, [inputFocusKey]);

  // Trigger scroll when messages change
  useEffect(() => {
    setScrollKey((k) => k + 1);
  }, [messages]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming" || conversationComplete) return;

    handleSubmit(e);
    setInputFocusKey((k) => k + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 relative">
      {/* Chat Area */}
      <div
        id="chat-scroll-container"
        className="rounded-xl h-[350px] md:h-[400px] overflow-y-auto p-4 border border-border/50 bg-background/80 backdrop-blur-xl shadow-xl scroll-smooth relative"
      >
        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={cn(
                "flex items-start gap-2",
                msg.role === "assistant" ? "justify-start" : "justify-end"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg mb-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-xl shadow-lg transition-all duration-300",
                  msg.role === "assistant"
                    ? "bg-card/80 backdrop-blur-sm rounded-tl-none border border-border/50"
                    : "bg-primary/15 backdrop-blur-sm rounded-tr-none border border-primary/20"
                )}
              >
                <p className="text-base">
                  {msg.role === "assistant" && isGenAILaunchpadRequest(msg.content) ? (
                    <>
                      {msg.content}
                      <br />
                      <a
                        href="https://buildfastwithai.com/genai-course"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline ml-1"
                      >
                        buildfastwithai.com/genai-course
                      </a>
                    </>
                  ) : (
                    msg.content
                  )}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mb-1 shadow-lg backdrop-blur-sm">
                  <span className="text-xs font-medium text-accent">
                    {userDetails?.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>
          ))}
          {status === "submitted" && (
            <div className="flex items-center justify-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg mb-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-card/80 backdrop-blur-sm rounded-tl-none border border-border/50 shadow-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={onSubmit} className="flex gap-2 relative">
        <Input
          id="chat-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            conversationComplete
              ? "Feedback completed!"
              : "Type your response..."
          }
          disabled={status === "streaming" || conversationComplete}
          className="flex-1 bg-background/80 backdrop-blur-xl border-border/50 shadow-lg focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border"
          key={inputFocusKey}
          autoFocus={true}
        />
        <Button
          type="submit"
          disabled={
            !input.trim() || status === "streaming" || conversationComplete
          }
          size="icon"
          className="shadow-lg bg-primary/90 hover:bg-primary transition-colors duration-300"
        >
          {status === "streaming" || isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      {error && (
        <div className="text-center text-sm text-destructive">
          Sorry, there was an error. Please try again.
        </div>
      )}

      {(isSaving || conversationComplete) && (
        <div className="text-center text-sm text-muted-foreground animate-pulse">
          {isSaving
            ? "Saving your feedback..."
            : "Thank you for your feedback!"}
        </div>
      )}
    </div>
  );
};
