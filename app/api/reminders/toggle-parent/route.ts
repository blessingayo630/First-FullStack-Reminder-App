import { NextResponse } from "next/server";
import { supabaseService as supabase } from "@/lib/supabase";

export async function PUT(req: Request) {
  try {
    const body: unknown = await req.json();
    const { id, isEnabled } = body as { id?: number; isEnabled?: boolean };

    if (!id) {
      return NextResponse.json({ error: "Missing reminder id" }, { status: 400 });
    }
    if (typeof isEnabled !== "boolean") {
      return NextResponse.json({ error: "Missing isEnabled" }, { status: 400 });
    }

    // Update parent
    const { error: parentError } = await supabase
      .from("reminders")
      .update({ is_enabled: isEnabled })
      .eq("id", id);

    if (parentError) throw parentError;

    // Update ALL sub-reminders to match the parent toggle
    const { error: itemsError } = await supabase
      .from("reminder_items")
      .update({ is_enabled: isEnabled })
      .eq("reminder_id", id);

    if (itemsError) throw itemsError;

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message || "Failed to toggle parent reminder" },
      { status: 500 }
    );
  }
}



