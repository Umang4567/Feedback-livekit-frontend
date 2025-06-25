import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch("https://api.lu.ma/public/v1/calendar/list-events", {
            method: "GET",
            headers: {
                accept: "application/json",
                "x-luma-api-key": process.env.LUMA_API_KEY as string,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch events from Luma API");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
} 