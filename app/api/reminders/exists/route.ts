import { NextResponse } from "next/server";
import { supabaseService as supabase } from "@/lib/supabase";



export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ hasReminders: false }, { status: 200 });
    }

    const { data, error } = await supabase
      .from("reminders")
      .select("id")
      .eq("user_email", email)
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to check reminders" },
        { status: 500 }
      );
    }

    const hasReminders = Array.isArray(data) && data.length > 0;
    return NextResponse.json({ hasReminders }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to check reminders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

