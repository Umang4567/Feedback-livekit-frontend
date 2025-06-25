import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const now = new Date();
    
    // Fetch only upcoming events (events that haven't occurred yet)
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gt("date", now.toISOString()) // Events that will happen in the future
      .order("date", { ascending: true }); // Most imminent events first

    if (error) {
      console.error("Error fetching upcoming events:", error);
      return NextResponse.json(
        { error: "Failed to fetch upcoming events" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ events: [] });
    }

    return NextResponse.json({ events: data });
  } catch (error) {
    console.error("Upcoming events API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 