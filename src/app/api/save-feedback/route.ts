import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const feedbackAnalysisSchema = z.object({
  overall_sentiment: z.enum(["positive", "negative", "neutral"]),
  rating: z.number().min(1).max(10).nullable(),
  suggestions: z.array(z.string()),
  genai_interest: z.boolean(),
  key_points: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const { messages, userDetails, eventId, eventName } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!userDetails || !eventId || !eventName) {
      return NextResponse.json(
        { error: "User details, event ID, and event name are required" },
        { status: 400 }
      );
    }

    try {
      // Generate feedback analysis
      const { object: feedbackAnalysis } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: feedbackAnalysisSchema,
        messages: [
          {
            role: "system",
            content: `Analyze this feedback conversation and extract key information. 
            Look for:
            - Overall sentiment (positive/negative/neutral)
            - Numerical rating (1-10) if mentioned
            - Suggestions for improvement
            - Interest in Gen AI program (look for yes/no/maybe responses)
            - Key positive or negative points mentioned about the event`,
          },
          {
            role: "user",
            content: JSON.stringify(messages),
          },
        ],
        temperature: 0.3,
      });

      // Save directly to Supabase
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("event_feedback")
        .insert({
          name: userDetails.name,
          email: userDetails.email,
          messages: messages
            .filter((m: any) => m.role !== "data")
            .map((m: any) => ({
              role: m.role as "user" | "assistant" | "system",
              content: m.content,
            })),
          event_id: eventId,
          event_name: eventName,
          overall_sentiment: feedbackAnalysis.overall_sentiment,
          rating: feedbackAnalysis.rating,
          suggestions: feedbackAnalysis.suggestions,
          genai_interest: feedbackAnalysis.genai_interest,
          key_points: feedbackAnalysis.key_points,
        })
        .select();

      if (error) {
        console.error("Error saving feedback to Supabase:", error);
        return NextResponse.json(
          { error: "Failed to save feedback to database" },
          { status: 500 }
        );
      }

      console.log("Feedback saved successfully:", data[0]);

      return NextResponse.json({
        success: true,
        analysis: feedbackAnalysis,
        feedbackId: data[0].id,
        message: "Feedback saved successfully",
      });
    } catch (error) {
      console.error("Error analyzing or saving feedback:", error);
      return NextResponse.json(
        { error: "Failed to analyze or save feedback" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in save feedback API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
