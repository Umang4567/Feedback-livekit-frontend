import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const participantId = url.searchParams.get("participantId");
        const roomName = url.searchParams.get("roomName");

        if (!participantId || !roomName) {
            return new NextResponse("Missing required parameters", { status: 400 });
        }

        // Extract information from the room name
        const [_, name, skillLevel, timestamp] = roomName.split("-");
        const userName = name.replace(/_/g, " ");

        // Return interview configuration
        return NextResponse.json({
            participantId,
            roomName,
            config: {
                userName,
                skillLevel,
                systemPrompt: `You are an AI feedback agent interviewing ${userName} about their experience. Be friendly and conversational. Ask follow-up questions based on their responses. Keep the conversation natural and engaging.`,
                questions: [
                    `I am BuildFast Bot and I am here to collect feedback for the event. This call will take 3-5 min. How are you today, ${userName}?`,
                    "What do you do?",
                    "How would you rate the event on a scale of one to ten?",
                    "What did you like most about the event?",
                    "What suggestions do you have to improve the event?",
                    "We have an 8-week Generative AI Launchpad program. Would you be interested in learning more about it?",
                    `Thanks for your feedback, ${userName}. Have a great day!`
                ],
                maxResponseTime: 120, // 2 minutes max per response
                silenceThreshold: 3, // 3 seconds of silence to consider response complete
            }
        });
    } catch (error) {
        console.error("Error in interview-info:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 