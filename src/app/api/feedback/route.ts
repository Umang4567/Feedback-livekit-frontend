import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isEventEligibleForFeedback } from "@/utils/events/eventService";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const feedbackData = await request.json();
    const { userDetails, transcript, eventId, eventName, overall_sentiment, rating, suggestions, genai_interest, key_points } = feedbackData;
    console.log(feedbackData, "Feedback data");
    if (!userDetails || !transcript || !eventId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // First, check if the event exists and is eligible for feedback
    // const { data: eventData, error: eventError } = await supabase
    //   .from("events")
    //   .select("date")
    //   .eq("id", eventId)
    //   .single();

    // if (eventError || !eventData) {
    //   return NextResponse.json(
    //     { error: "Event not found" },
    //     { status: 404 }
    //   );
    // }

    // // Verify the event is eligible for feedback (happened within the last 2 days)
    // if (!isEventEligibleForFeedback(eventData.date)) {
    //   return NextResponse.json(
    //     { error: "Event is no longer eligible for feedback" },
    //     { status: 400 }
    //   );
    // }

    // Store the feedback in the database using the existing feedback table
    const { data, error } = await supabase
      .from("event_feedback")
      .insert({
        name: userDetails.name,
        email: userDetails.email,
        messages: transcript,
        event_id: eventId,
        event_name: eventName,
        overall_sentiment,
        rating,
        suggestions,
        genai_interest,
        key_points
      })
      .select();

    if (error) {
      console.error("Error saving feedback:", error);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, feedbackId: data[0].id });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
