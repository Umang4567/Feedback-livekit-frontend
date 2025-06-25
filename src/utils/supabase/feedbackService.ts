import { FeedbackData } from "@/lib/atoms";
import { createClient } from "@/utils/supabase/client";

export async function saveFeedback(feedbackData: FeedbackData) {
  try {
    console.log("Saving feedback:", feedbackData);

    const supabase = createClient();

    // Store the feedback in the database
    const { data, error } = await supabase
      .from("event_feedback")
      .insert({
        name: feedbackData.userDetails.name,
        email: feedbackData.userDetails.email,
        messages: feedbackData.transcript,
        event_id: feedbackData.eventId,
        event_name: feedbackData.eventName,
        overall_sentiment: feedbackData.overall_sentiment,
        rating: feedbackData.rating,
        suggestions: feedbackData.suggestions,
        genai_interest: feedbackData.genai_interest,
        key_points: feedbackData.key_points,
      })
      .select();

    if (error) {
      console.error("Error saving feedback to Supabase:", error);
      throw new Error("Failed to save feedback to database");
    }

    console.log("Feedback saved successfully:", data[0]);
    return { success: true, feedbackId: data[0].id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    throw error;
  }
}
