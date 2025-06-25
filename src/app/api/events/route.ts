import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const now = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(now.getDate() - 2);

    // Fetch only events that:
    // 1. Have already occurred (end time is in the past)
    // 2. Occurred within the last 2 days (48 hours)
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .lt("date", now.toISOString()) // Events that have already ended
      // .gte("date", twoDaysAgo.toISOString()/) // Events that ended within the last 2 days
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ events: [] });
    }

    return NextResponse.json({ events: data });
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 