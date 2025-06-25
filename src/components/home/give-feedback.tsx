"use client";
import Agent from "@/components/agent";
import { Skeleton } from "@/components/ui/skeleton";
import UserDetailsForm from "@/components/UserDetailsForm";
import type { Event } from "@/lib/atoms";
import { selectedEventAtom, userDetailsAtom } from "@/lib/atoms";
import { getEvents } from "@/utils/events/lumaEventService";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import EventCard2 from "../EventCard2";
import { ChevronLeft } from "lucide-react";
import { vapi } from "@/lib/vapi.sdk";
import { Button } from "../ui/button";
import { TextFeedback } from "@/components/TextFeedback";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

function GiveFeedback() {
  const [loading, setLoading] = useState(true);
  const [feedbackEvents, setFeedbackEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
  const [userDetails] = useAtom(userDetailsAtom);
  const [error, setError] = useState("");
  const [showAgent, setShowAgent] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<"voice" | "text">("voice");
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  console.log(selectedEventAtom, "My selected event");
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);

        // Fetch events eligible for feedback
        const recentEventsResponse = await getEvents();
        console.log(recentEventsResponse, "My recent events");

        setFeedbackEvents(recentEventsResponse);
      } catch (err) {
        setError("Failed to load events. Please try again later.");
        console.error(err);
      } finally {
        setTimeout(() => setLoading(false), 800); // Add slight delay for a smoother transition
      }
    };

    loadEvents();
  }, []);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    // Check if user details exist
    if (userDetails && userDetails.name && userDetails.email) {
      // If user details exist, show agent directly
      setShowAgent(true);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // If user details don't exist, show user form
      setShowUserForm(true);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleUserFormSubmit = () => {
    setShowUserForm(false);
    setShowAgent(true);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToEvents = () => {
    setShowAgent(false);
    setShowUserForm(false);
    setSelectedEvent(null);
    setFeedbackMode("voice");
    // Reset any ongoing calls
    try {
      const vapiModule = require("@/lib/vapi.sdk");
      if (vapiModule && vapiModule.vapi) {
        vapiModule.vapi.stop();
      }
    } catch (e) {
      console.error("Error stopping call:", e);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto overflow-hidden">
        <div className="p-8 relative bg-gradient-to-b from-background/40 to-background/60 backdrop-blur-sm">
          <div className="absolute top-5 left-5 w-28 h-28 rounded-full bg-accent/10 blur-[60px] opacity-60"></div>
          <div className="absolute bottom-5 right-5 w-28 h-28 rounded-full bg-primary/10 blur-[60px] opacity-60"></div>

          <div className="flex flex-col items-center space-y-6">
            <Skeleton className="h-10 w-2/3 mx-auto bg-white/5 rounded-lg" />
            <Skeleton className="h-5 w-1/2 mx-auto bg-white/5 rounded-md" />

            <div className="w-full space-y-4 mt-8">
              <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
              <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
              <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showUserForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.1 }}
        className="w-full max-w-4xl mx-auto overflow-hidden"
      >
        <div className="relative">
          <div className="relative backdrop-blur-sm p-8">
            <button
              onClick={handleBackToEvents}
              className="flex items-center text-sm text-foreground/70 hover:text-foreground transition-colors duration-300 mb-6 group"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-card/50 backdrop-blur-sm mr-2 group-hover:bg-primary/10 transition-colors duration-300">
                <ChevronLeft className="w-4 h-4" />
              </span>
              Back to events
            </button>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-center mb-2">
                Your <span className="text-accent-foreground">Details</span>
              </h2>
              <p className="text-center opacity-80 text-sm md:text-base mb-8">
                Please provide your details to continue
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <UserDetailsForm onSubmit={handleUserFormSubmit} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (showAgent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.1 }}
        className="w-full max-w-4xl mx-auto overflow-hidden"
      >
        <div className="relative p-4">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-accent/5 rounded-2xl"></div>
          <div className="relative backdrop-blur-sm flex justify-between items-center w-full">
            <div className="absolute top-5 left-5 w-28 h-28 rounded-full bg-accent/15 blur-[60px] opacity-70"></div>
            <div className="absolute bottom-5 right-5 w-28 h-28 rounded-full bg-primary/15 blur-[60px] opacity-70"></div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleBackToEvents}
              className="flex items-center text-sm transition-colors duration-300 mb-4 group"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to events
            </Button>
            {feedbackMode === "voice" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Switching to text mode
                  setFeedbackMode("text");
                  // Stop VAPI call without saving data
                  vapi.stop();
                  setCallStatus(CallStatus.INACTIVE);
                }}
                className="h-10 px-4 bg-muted text-sm font-medium transition-all duration-300"
              >
                Can't speak? Try Text mode
              </Button>
            )}
          </div>

          <div className="px-6">
            {feedbackMode === "voice" ? (
              <Agent
                type="feedback"
                questions={[
                  "I am BuildFast Bot and I am here to collect feedback for the {event} and this call will take 3-5 min.",
                  "What do you do {name}?",
                  "How would you rate the {event} on a scale of one to ten, {name}?",
                  "What did you like most about the {event}?",
                  "What suggestions do you have to improve the {event}?",
                  "We have a 8 week Generative AI Launchpad; would you be interested, {name}?",
                  "Thanks for your feedback on the {event}, {name}. Have a great day!",
                ]}
                onCallComplete={() => handleBackToEvents()}
              />
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
                onComplete={() => handleBackToEvents()}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden">
      <div className="p-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          className="mb-4"
        >
          <p className="text-foreground/70 text-sm bg-muted/50 px-4 p-2 rounded-lg w-fit">
            Note: Events are available for feedback for 48 hours after they end
          </p>
        </motion.div>

        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-center p-8 bg-card/30 backdrop-blur-sm rounded-xl border border-border/10"
            >
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-destructive/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-destructive"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-destructive font-medium mb-2">{error}</p>
              <p className="text-sm text-foreground/70">
                Check the "Upcoming Events" tab to see what's coming next.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {feedbackEvents.map((event, index) => (
                <motion.div
                  key={event.api_id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  <EventCard2
                    key={event.api_id || index}
                    event={event}
                    type="feedback"
                    onClick={() => handleSelectEvent(event)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default GiveFeedback;
