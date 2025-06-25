import { Event } from "@/lib/atoms";

export type EventData = {
    api_id: string;
    event: {
        api_id: string;
        name: string;
        start_at: string;
        cover_url: string;
        url: string;
    };
};

/**
 * Fetches a list of events from the Luma API and transforms them to match our Event type
 */
export async function getEvents(): Promise<Event[]> {
    const res = await fetch("/api/luma/events", {
        method: "GET",
        headers: {
            accept: "application/json",
        },
    });

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error("Failed to fetch data");
    }

    const data = (await res.json()) as { entries: EventData[] };
    console.log(data);

    // Transform Luma events to match our Event type
    return data.entries.map(entry => ({
        id: entry.api_id,
        api_id: entry.api_id,
        title: entry.event.name,
        excerpt: "", // Default empty as Luma doesn't provide this
        slug: entry.event.url.split("/").pop() || entry.api_id, // Extract slug from URL or use API ID
        event_link: entry.event.url,
        content: "", // Default empty as Luma doesn't provide this
        image_url: entry.event.cover_url,
        image_path: "", // Default empty as we use image_url instead
        created_at: new Date().toISOString(), // Default to now as Luma doesn't provide this
        date: entry.event.start_at,
        event: {
            name: entry.event.name,
            start_at: entry.event.start_at,
            url: entry.event.url,
            cover_url: entry.event.cover_url // Add this to match EventCard2's expectations
        }
    }));
}

