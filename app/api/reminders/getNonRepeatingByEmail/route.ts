import { NextResponse } from "next/server";
import { supabaseService as supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) return NextResponse.json([], { status: 200 });

    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        reminder_items (*)
      `)
      .eq("user_email", email)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Non-repeating page should only show items that have received EMAIL.
    // Current schema/UI uses `reminder_items.is_sent` as the delivery indicator.
    type ReminderItemRow = {
      id: number;
      repeat_mode?: string | null;
      is_sent?: boolean | null;
      [key: string]: unknown;
    };

    type ReminderRow = {
      reminder_items?: ReminderItemRow[] | null;
      [key: string]: unknown;
    };

    const filtered = (data ?? [])
      .map((r: ReminderRow) => {
        const onceDeliveredItems = (r.reminder_items ?? []).filter(
          (it) => (it.repeat_mode ?? "once") === "once" && it.is_sent === true
        );

        return {
          ...r,
          reminder_items: onceDeliveredItems,
        };
      })
      .filter((r) => (r.reminder_items?.length ?? 0) > 0);

    return NextResponse.json(filtered, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch non-repeating reminders";
    return NextResponse.json(
      {
        error: message,
        details: err,
      },
      { status: 500 }
    );
  }
}

