"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { selectedEventAtom, userDetailsAtom } from "@/lib/atoms";
import { getEvents } from "@/utils/events/lumaEventService";
import { Event } from "@/lib/atoms";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard2 from "@/components/EventCard2";

interface EventListProps {
    onEventSelect?: () => void;
}

export default function EventList({ onEventSelect }: EventListProps) {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
    const [userDetails] = useAtom(userDetailsAtom);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);
                const recentEvents = await getEvents();
                setEvents(recentEvents);
            } catch (err) {
                setError("Failed to load events. Please try again later.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, []);

    const handleEventSelect = (event: Event) => {
        setSelectedEvent(event);
        if (onEventSelect) {
            onEventSelect();
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-xl border bg-card">
                        <Skeleton className="h-4 w-3/4 mb-4" />
                        <Skeleton className="h-3 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-2/3 mb-4" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-6 rounded-xl border bg-destructive/10 text-destructive">
                {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {events.map((event) => (
                <EventCard2
                    key={event.api_id}
                    event={event}
                    type="feedback"
                    onClick={() => handleEventSelect(event)}
                />
            ))}
            {events.length === 0 && (
                <div className="text-center p-6 rounded-xl border bg-card">
                    <p className="text-muted-foreground">No active events found.</p>
                </div>
            )}
        </div>
    );
} 