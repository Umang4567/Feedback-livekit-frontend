import { format, formatDistance, formatDistanceToNow } from "date-fns";
import { FallbackImage } from "./ui/fallback-image";
import type { Event } from "@/lib/atoms";

interface EventCardProps {
  event: Event;
  type: "feedback" | "upcoming";
  onClick?: () => void;
}

const EventCard = ({ event, type, onClick }: EventCardProps) => {
  const eventDate = new Date(event.date);

  // For feedback events, calculate time remaining for feedback window
  const getFeedbackTimeRemaining = () => {
    const now = new Date();
    const diffTime = 48 - ((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60));
    return Math.max(0, Math.floor(diffTime));
  };

  return (
    <div
      className={`
    glassmorphism rounded-lg p-5 border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg
    bg-[var(--card)] text-[var(--card-foreground)] border-border
    hover:bg-[var(--card-accent)]
    ${type === "feedback" ? "hover:border-accent/80" : "hover:border-primary/60"}
    ${onClick ? "cursor-pointer" : ""}
  `}
      onClick={onClick}
    >
      <div className="flex items-center gap-5">
        <div className="flex-shrink-0 relative overflow-hidden rounded-lg shadow-sm">
          <FallbackImage
            src={event.image_url || "/images/event-placeholder.jpg"}
            alt={event.title}
            width={90}
            height={90}
            className="object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70 dark:from-black/70 dark:to-transparent"></div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium truncate mb-1">
            {event.title}
          </h3>

          {type === "feedback" ? (
            <>
              <p className="text-sm text-foreground/70">
                {format(eventDate, "PPP")} - {formatDistanceToNow(eventDate)} ago
              </p>
              <p className="text-xs text-accent mt-2 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-accent mr-2 animate-pulse"></span>
                Feedback window: {getFeedbackTimeRemaining()} hours remaining
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-foreground/70">
                {format(eventDate, "PPP")}
              </p>
              <p className="text-xs text-primary mt-2 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Coming up in {formatDistance(eventDate, new Date(), { addSuffix: false })}
              </p>
              {event.event_link && (
                <a
                  href={event.event_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs px-4 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  Register
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;