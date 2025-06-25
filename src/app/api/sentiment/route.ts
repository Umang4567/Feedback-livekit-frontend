import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

const isNegativeResponse = (message: string): boolean => {
    const negativePatterns = [
        /\b(no|not|don'?t|didn'?t|won'?t|can'?t)\b/i,
        /\b(bad|poor|terrible|awful|horrible|worst)\b/i,
        /\b([0-5]|zero|one|two|three|four|five)\b/i, // Ratings 0-5
        /\b(dislike|hate|disappointed|disappointing|unhappy|unsatisfied)\b/i,
        /nothing/i,
    ];

    return negativePatterns.some(pattern => pattern.test(message));
};

export async function POST(request: NextRequest) {
    try {
        const { message, questionIndex } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // For rating questions (questionIndex 2), check if it's a low rating (0-5)
        if (questionIndex === 2) {
            const ratingMatch = message.match(/\d+/);
            if (ratingMatch) {
                const rating = parseInt(ratingMatch[0]);
                if (rating <= 5) {
                    return NextResponse.json({
                        response: "I'm sorry to hear that. Your feedback helps us understand where we need to improve.",
                        isNegative: true
                    });
                }
            }
        }

        // For other questions, check for negative patterns
        if (isNegativeResponse(message)) {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are an empathetic AI assistant responding to negative feedback. 
                        Provide a short, caring response that:
                        1. Shows genuine concern and understanding
                        2. Acknowledges their dissatisfaction
                        3. Thanks them for their honest feedback
                        Keep responses concise (1-2 sentences) and genuinely sorrowful in tone.`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            });

            return NextResponse.json({
                response: completion.choices[0].message.content,
                isNegative: true
            });
        }

        // For positive/neutral responses, no need for additional response
        return NextResponse.json({
            response: "",
            isNegative: false
        });

    } catch (error) {
        console.error("Error in sentiment analysis:", error);
        return NextResponse.json(
            { error: "Failed to analyze sentiment" },
            { status: 500 }
        );
    }
} 