import { Event } from "@/lib/atoms";

/**
 * Fetches recent events that are eligible for feedback.
 * These are events that have already occurred and ended within the last 2 days.
 */
export async function fetchRecentEvents(): Promise<Event[]> {
  try {
    // console.log("Hit")
    const response = await fetch("/api/events", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure we always get the most recent data
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch events");
    }

    const data = await response.json();
    console.log(data, "My data")
    return data.events;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

/**
 * Fetches upcoming events that have not occurred yet.
 */
export async function fetchUpcomingEvents(): Promise<Event[]> {
  try {
    const response = await fetch("/api/events/upcoming", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure we always get the most recent data
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch upcoming events");
    }

    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }
}

/**
 * Determines if an event is eligible for feedback.
 * An event is eligible if:
 * 1. It has already occurred (end time is in the past)
 * 2. It ended within the last 2 days (48 hours)
 * 
 * @param eventDate The date when the event ended
 * @returns boolean indicating if the event is eligible for feedback
 */
export function isEventEligibleForFeedback(eventDate: string): boolean {
  if (!eventDate) return false;

  const eventDateTime = new Date(eventDate);
  const now = new Date();

  // Event must have already occurred
  if (eventDateTime > now) return false;

  // Calculate the difference in days
  const diffTime = now.getTime() - eventDateTime.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // Event is eligible for feedback if it happened within the last 2 days
  return diffDays >= 0 && diffDays <= 2;
} 