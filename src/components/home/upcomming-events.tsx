import { useEffect, useState } from "react";
import { fetchUpcomingEvents } from "@/utils/events/eventService";
import type { Event } from "@/lib/atoms";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/EventCard";
import { motion, AnimatePresence } from "framer-motion";

function UpcomingEvents() {
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);

        // Fetch upcoming events
        const upcomingEventsResponse = await fetchUpcomingEvents();
        setUpcomingEvents(upcomingEventsResponse);

        // Set error message if no upcoming events found
        if (upcomingEventsResponse.length === 0) {
          setError("No upcoming events found.");
        } else {
          setError("");
        }
      } catch (err) {
        setError("Failed to load events. Please try again later.");
        console.error(err);
      } finally {
        setTimeout(() => setLoading(false), 800); // Add slight delay for a smoother transition
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto overflow-hidden">
        <div className="p-8 relative bg-gradient-to-b from-background/40 to-background/60 backdrop-blur-sm">
          <div className="absolute top-5 left-5 w-28 h-28 rounded-full bg-accent/10 blur-[60px] opacity-60"></div>
          <div className="absolute bottom-5 right-5 w-28 h-28 rounded-full bg-primary/10 blur-[60px] opacity-60"></div>

          <div className="flex flex-col items-center space-y-6">
            <Skeleton className="h-10 w-2/3 mx-auto bg-muted/20 rounded-lg" />
            <Skeleton className="h-5 w-1/2 mx-auto bg-muted/10 rounded-md" />

            <div className="w-full space-y-4 mt-8">
              <Skeleton className="h-24 w-full rounded-xl bg-muted/10" />
              <Skeleton className="h-24 w-full rounded-xl bg-muted/10" />
              <Skeleton className="h-24 w-full rounded-xl bg-muted/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden">
      <div className="p-8 relative">
        <div className="absolute top-5 left-5 w-28 h-28 rounded-full bg-accent/15 blur-[60px] opacity-70"></div>
        <div className="absolute bottom-5 right-5 w-28 h-28 rounded-full bg-primary/15 blur-[60px] opacity-70"></div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          className="relative mb-8"
        >
          <h2 className="text-2xl font-bold md:text-left text-center mb-2">
            Discover Our <span className="text-accent">Events</span>
          </h2>
          <p className="text-center md:text-left opacity-80 text-sm md:text-base">
            View upcoming events and register your interest
          </p>
        </motion.div>

        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.1 }}
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
                Check back later for new events or contact us for more
                information.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  <EventCard event={event} type="upcoming" />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default UpcomingEvents;
