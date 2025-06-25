import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// Define the schema for the feedback analysis
const feedbackAnalysisSchema = z.object({
  overall_sentiment: z.enum(["positive", "negative"]),
  rating: z.number().min(1).max(10).nullable(),
  suggestions: z.array(z.string()),
  genai_interest: z.boolean(),
  key_points: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: feedbackAnalysisSchema,
      prompt: `Analyze the feedback conversation and provide a structured summary based on the following messages: ${JSON.stringify(
        messages
      )}
            
            Please extract:
            1. overall_sentiment: "positive" or "negative" based on the entire conversation
            2. rating: Extract the numerical rating (1-10). If not found, return null
            3. suggestions: Array of key suggestions made by the user
            4. genai_interest: boolean indicating if user showed interest in Gen AI bootcamp
            5. key_points: Array of main positive/negative points mentioned`,
      temperature: 0.3,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Error in feedback analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze feedback" },
      { status: 500 }
    );
  }
}
