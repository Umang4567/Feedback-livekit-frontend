import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { selectedEventAtom } from "@/lib/atoms";
import { fetchRecentEvents, fetchUpcomingEvents, isEventEligibleForFeedback } from "@/utils/events/eventService";
import type { Event } from "@/lib/atoms";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "./EventCard";

interface EventSelectionProps {
  onEventSelected: () => void;
}

type EventTab = "feedback" | "upcoming";

const EventSelection = ({ onEventSelected }: EventSelectionProps) => {
  const [loading, setLoading] = useState(true);
  const [feedbackEvents, setFeedbackEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<EventTab>("feedback");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        
        // Fetch both types of events in parallel
        const [recentEventsResponse, upcomingEventsResponse] = await Promise.all([
          fetchRecentEvents(),
          fetchUpcomingEvents()
        ]);
        
        // Filter recent events to only include those eligible for feedback
        const eligibleEvents = recentEventsResponse.filter(event => 
          isEventEligibleForFeedback(event.date)
        );
        
        setFeedbackEvents(eligibleEvents);
        setUpcomingEvents(upcomingEventsResponse);
        
        // Set error message if no feedback-eligible events found
        if (eligibleEvents.length === 0 && activeTab === "feedback") {
          setError("No recent events found that are eligible for feedback. Events are only eligible for feedback within 48 hours after they end.");
        } else if (upcomingEventsResponse.length === 0 && activeTab === "upcoming") {
          setError("No upcoming events found.");
        } else {
          setError("");
        }
      } catch (err) {
        setError("Failed to load events. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [activeTab]);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    onEventSelected();
  };

  const changeTab = (tab: EventTab) => {
    setActiveTab(tab);
    setError("");
    
    // Set error message based on the selected tab and available events
    if (tab === "feedback" && feedbackEvents.length === 0) {
      setError("No recent events found that are eligible for feedback. Events are only eligible for feedback within 48 hours after they end.");
    } else if (tab === "upcoming" && upcomingEvents.length === 0) {
      setError("No upcoming events found.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-md w-full mx-auto glassmorphism rounded-xl shadow-xl overflow-hidden">
        <div className="gradient-bg p-6 relative">
          <div className="absolute top-5 left-5 w-20 h-20 rounded-full bg-accent/20 blur-xl"></div>
          <div className="absolute bottom-2 right-5 w-16 h-16 rounded-full bg-primary/20 blur-xl"></div>
          
          <Skeleton className="h-16 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>

        <div className="flex border-b border-border">
          <Skeleton className="h-10 flex-1 mx-1" />
          <Skeleton className="h-10 flex-1 mx-1" />
        </div>

        <div className="p-6 space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto relative z-10">
      <div className="glassmorphism rounded-xl shadow-xl overflow-hidden">
        <div className="gradient-bg p-6 relative">
          {/* Decorative elements */}
          <div className="absolute top-5 left-5 w-20 h-20 rounded-full bg-accent/20 blur-xl"></div>
          <div className="absolute bottom-2 right-5 w-16 h-16 rounded-full bg-primary/20 blur-xl"></div>
          
          <h2 className="text-2xl font-bold text-center relative">
            {activeTab === "feedback" ? 
              "Share Your " : "Discover Our "}
            <span className="text-accent">
              {activeTab === "feedback" ? "Feedback" : "Events"}
            </span>
          </h2>
          <p className="text-center mt-2 opacity-90 relative">
            {activeTab === "feedback" 
              ? "Events are available for feedback for 48 hours after they end" 
              : "View upcoming events and register your interest"}
          </p>
        </div>

        <div className="flex border-b border-border">
          <button
            className={`flex-1 py-3 font-medium text-sm relative overflow-hidden group ${
              activeTab === "feedback"
                ? "text-accent"
                : "text-foreground/70 hover:text-foreground/90"
            }`}
            onClick={() => changeTab("feedback")}
          >
            <span>Give Feedback</span>
            {activeTab === "feedback" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent"></span>
            )}
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm relative overflow-hidden group ${
              activeTab === "upcoming"
                ? "text-accent"
                : "text-foreground/70 hover:text-foreground/90"
            }`}
            onClick={() => changeTab("upcoming")}
          >
            <span>Upcoming Events</span>
            {activeTab === "upcoming" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent"></span>
            )}
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error ? (
            <div className="text-center p-4">
              <p className="text-destructive">{error}</p>
              {activeTab === "feedback" && (
                <p className="mt-2 text-sm text-foreground/70">
                  Check the "Upcoming Events" tab to see what's coming next.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {activeTab === "feedback" && feedbackEvents.map((event) => (
                <EventCard 
                  key={event.id}
                  event={event}
                  type="feedback"
                  onClick={() => handleSelectEvent(event)}
                />
              ))}

              {activeTab === "upcoming" && upcomingEvents.map((event) => (
                <EventCard 
                  key={event.id}
                  event={event}
                  type="upcoming"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventSelection; 