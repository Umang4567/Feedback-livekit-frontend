"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { addHours, format } from "date-fns";
import { Clock } from "lucide-react";
import { FallbackImage } from "./ui/fallback-image";

interface Event {
  api_id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  date: string;
  location?: string;
  event?: {
    name: string;
    start_at: string;
    end_at?: string;
    cover_url?: string;
    url?: string;
  };
}

interface EventCardProps {
  event: Event;
  type: "feedback" | "upcoming";
  onClick?: () => void;
}

const EventCard2 = ({ event, type, onClick }: EventCardProps) => {
  const eventMeta = event.event;
  const eventDate = new Date(eventMeta?.start_at ?? event.date);
  const endDate = eventMeta?.end_at
    ? new Date(eventMeta.end_at)
    : addHours(eventDate, 2);

  const getFeedbackTimeRemaining = () => {
    const now = new Date();
    const diffTime =
      48 - (now.getTime() - endDate.getTime()) / (1000 * 60 * 60);
    return Math.max(0, Math.floor(diffTime));
  };

  const feedbackHoursLeft = getFeedbackTimeRemaining();
  const isActive = feedbackHoursLeft > 0;

  if (isActive) {
    return (
      <Card
        className="overflow-hidden border border-border bg-background dark:bg-muted/70 backdrop-blur-md rounded-2xl py-0"
        onClick={onClick}
      >
        <div className="flex flex-col">
          <div className="p-5 flex">
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  {format(eventDate, "EEEE, MMMM d")} -{" "}
                  {format(endDate, "d, yyyy")}
                </p>

                <h3 className="text-xl font-bold text-foreground mb-3">
                  {eventMeta?.name || event.title}
                </h3>
              </div>

              <div className="flex items-end w-full">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground max-w-md transition-colors">
                      Feedback window:{" "}
                      {isActive
                        ? `${feedbackHoursLeft} hours remaining`
                        : "Closed"}
                    </span>
                  </div>
                </div>

                {type === "feedback" && (
                  <Button
                    onClick={onClick}
                    disabled={!isActive}
                    className={cn(
                      "px-4 h-10",
                      isActive ? "bg-primary" : " cursor-not-allowed bg-primary"
                    )}
                  >
                    {isActive ? "Give Feedback" : "Closed"}
                  </Button>
                )}
              </div>
            </div>

            {/* Right image */}
            <div className="ml-4 relative w-full max-w-[16rem] aspect-video flex-shrink-0 rounded-md overflow-hidden">
              <FallbackImage
                src={
                  eventMeta?.cover_url ||
                  event.image_url ||
                  "/images/event-placeholder.jpg"
                }
                alt={eventMeta?.name || event.title}
                width={144}
                height={112}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }
};

export default EventCard2;
