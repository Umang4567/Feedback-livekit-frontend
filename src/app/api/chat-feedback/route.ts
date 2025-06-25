import { NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject, streamText } from "ai";
import { z } from "zod";

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

// Exact completion trigger phrase (no emojis for HTTP header compatibility)
const COMPLETION_TRIGGER =
  "Thank you for sharing your valuable feedback with us today!";

export async function POST(request: NextRequest) {
  try {
    const { messages, userName, eventName } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages array is required", { status: 400 });
    }

    // Determine conversation stage based on message count
    const conversationStage = getConversationStage(messages);

    // Stream conversational response
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: `You are BuildFast Bot, a friendly and professional feedback collection assistant. You're conducting a conversational feedback session about "${eventName}" with ${userName}.

Your conversation flow should naturally cover these topics in order:
1. What the user does for work/profession
2. Their overall rating of the event (1-10 scale)
3. What they liked most about the event
4. Any suggestions for improvement
5. Interest in a 8 week Generative AI Launchpad 
6. Make sure to use 8 - week Generative AI Launchpad in the conversation
7 . Make sure to use the word event after the event name

Guidelines:
- Be conversational and natural, not robotic
- Accept any response from the user without judgment or validation
- Show empathy and respond contextually to their answers
- If they give negative feedback or low ratings, respond with understanding
- Keep responses concise but engaging
- Use their name occasionally to personalize the conversation
- Let the conversation flow naturally between topics
- Guide them to the next topic when appropriate, but don't force it
- Acknowledge their responses before moving to the next topic
- WAIT for the user to respond to each question before moving on
- Do NOT conclude the conversation until you have received answers to ALL 5 topics


If the user asks these questions then answer them with these replies and only tell these details if the user asks about it 
Q: What is Build Fast with AI? 
A: Build Fast with AI is an organization founded by IIT Delhi alumni that focuses on AI education and implementation. It emerged from the observation that the world needs both AI tools and expertise that delivers real results.
Q: What are the key achievements of Build Fast with AI? 
A: The organization has:
Built a community of 15,000+ AI enthusiasts
Transformed 500+ professionals through their courses
Launched 200+ AI applications through their alumni
Executed 100+ consulting programs for business transformation
Established partnerships with major companies like BCG, McKinsey, Shell, and Freshworks
Partnered with Google for cutting-edge AI workshops
Q: Who is the founder of Build Fast with AI? 
A: The founder and lead mentor is Satvik Paramkusham.
Educational Background: Holds both a Bachelor's and Master's degree from IIT Delhi
Professional Experience: Over 5 years in data science and machine learning
Expertise: Recognized as a leading consultant in Generative AI
Teaching Impact: Has personally coached over 15,000 individuals in leveraging Generative AI
Teaching Philosophy: Strongly believes in 'Learning by Doing', emphasizing practical application in all training programs
Startup Experience: Has helped numerous startups successfully implement AI features
Satvik's combination of academic excellence, industry experience, and teaching prowess forms the backbone of Build Fast with AI's educational approach.
Course Details
Q: What is the flagship course offered? 
A: The flagship offering is a 8-week Generative AI Bootcamp, designed to take participants from novice to proficient in Generative AI technologies.The 8 modules of the course are designed in a way to give an overall understanding of main concepts of Gen AI
Course website link: buildfastwithai.com/genai-course


Also If the user asks something irrelevant then ask them to contact the team at build fast with ai

CRITICAL: Only use the completion phrase AFTER the user has responded to the Gen AI Launchpad program question. When you have received their answer to the Gen AI question, THEN end your response with this EXACT phrase: "${COMPLETION_TRIGGER}"

Current conversation stage: ${conversationStage}
Respond naturally and conversationally to their latest message.`,
        },
        ...messages.map((msg: Message) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      maxTokens: 300,
      onFinish: async (message) => {
        console.log("Message:", message);

        // Check for the exact completion trigger
        if (message.text.includes(COMPLETION_TRIGGER)) {
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
                  content: JSON.stringify([
                    ...messages,
                    { role: "assistant", content: message.text },
                  ]),
                },
              ],
              temperature: 0.3,
            });

            console.log(
              "Conversation concluded with analysis:",
              feedbackAnalysis
            );
          } catch (error) {
            console.error("Error analyzing feedback:", error);
          }
        }
      },
    });

    // Check if this response should trigger completion check
    const userMessages = messages.filter((msg) => msg.role === "user");
    const shouldCheckCompletion = userMessages.length >= 5; // Start checking after 5 user messages

    if (shouldCheckCompletion) {
      const response = result.toDataStreamResponse();
      response.headers.set("X-Check-Completion", "true");
      return response;
    }

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat feedback API:", error);
    return new Response("Failed to process chat feedback", { status: 500 });
  }
}

function getConversationStage(messages: Message[]): string {
  const userMessages = messages.filter((msg) => msg.role === "user");

  if (userMessages.length <= 1) return "profession_inquiry";
  if (userMessages.length <= 2) return "rating_request";
  if (userMessages.length <= 3) return "positive_feedback";
  if (userMessages.length <= 4) return "improvement_suggestions";
  if (userMessages.length <= 5) return "genai_interest_inquiry";
  if (userMessages.length <= 6) return "ready_to_conclude";
  return "conversation_complete";
}
