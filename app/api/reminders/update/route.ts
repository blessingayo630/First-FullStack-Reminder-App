      /* eslint-disable @typescript-eslint/no-explicit-any */
 
// import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';

// // PUT - Update an existing reminder
// export async function PUT(request: Request) {
//   try {
//     const { id, title, description, dueDate, remindBefore, remindUnit, userEmail, fcmToken, isEnabled } = await request.json();

//     // Backward-compatible: if isEnabled isn't provided, keep DB value as-is.
//     // (kept for future use; normalizedIsEnabled intentionally unused today)
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const _normalizedIsEnabled = typeof isEnabled === 'boolean' ? isEnabled : undefined;




//     if (!id) {
//       return NextResponse.json({ error: 'ID is required' }, { status: 400 });
//     }

//     if (!title || !dueDate || !remindBefore || !remindUnit) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     // Treat the input as a Date object.
//     const dueDateObj = new Date(dueDate);
    
//     // Check if the date is valid
//     if (isNaN(dueDateObj.getTime())) {
//       return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
//     }
    
//     // Calculate reminder time based on the due date
//     const reminderTime = new Date(dueDateObj);
//     switch (remindUnit) {
//       case 'minutes': 
//         reminderTime.setMinutes(reminderTime.getMinutes() - remindBefore); 
//         break;
//       case 'hours':
//         reminderTime.setHours(reminderTime.getHours() - remindBefore);
//         break;
//       case 'days': 
//         reminderTime.setDate(reminderTime.getDate() - remindBefore); 
//         break;
//       case 'weeks': 
//         reminderTime.setDate(reminderTime.getDate() - (remindBefore * 7)); 
//         break;
//       case 'months': 
//         reminderTime.setMonth(reminderTime.getMonth() - remindBefore); 
//         break;
//     }

//     const updateData = {
//       title,
//       description: description || '',
//       due_date: dueDateObj.toISOString(), // Store as UTC
//       remind_before: remindBefore,
//       remind_unit: remindUnit,
//       reminder_time: reminderTime.toISOString(), // Store as UTC
//       user_email: userEmail || 'temp@example.com',
//       fcm_token: fcmToken || null,
//       // If user only toggles the enabled switch, don't force-set to false
//       is_enabled: typeof isEnabled === 'boolean' ? isEnabled : undefined,
//       is_sent: false, // Reset status to Pending when edited
//     };

//     // Remove undefined fields so Supabase doesn't overwrite with null
//     Object.keys(updateData).forEach((k) => {
//       // @ts-expect-error runtime cleanup
//       if (updateData[k] === undefined) delete updateData[k];
//     });


//     const { data, error } = await supabase
//       .from('reminders')
//       .update(updateData)
//       .eq('id', id)
//       .select()
//       .single();

//     if (error) {
//       console.error('Supabase error:', error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json(data, { status: 200 });
//   } catch (error) {
//     console.error('Server error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// import { NextResponse } from "next/server";
// import { supabaseService as supabase } from "@/lib/supabase";

// export async function PUT(req: Request) {
//   try {
//     const body = await req.json();

//     const {
//       id,
//       title,
//       userEmail,
//       phoneNumber,
//       isEnabled,
//       descriptions, // optional array of sub-reminders (best)
//       description, // legacy || (parent-level string)
//       dueDate,
//       remindBefore,
//       remindUnit,
//       repeatMode,
//       customWeekdays,
//       fcmToken,
//     } = body;


//     // 1. Update parent
//     const { error: parentError } = await supabase
//       .from("reminders")
//       .update({
//         title,
//         user_email: userEmail,
//         phone_number: phoneNumber,
//         is_enabled: isEnabled,
//       })
//       .eq("id", id);

//     if (parentError) throw parentError;

//     // 2. Update only the intended sub-reminder(s)
//     // Preferred payload shape from the UI: `descriptions` is an array aligned with existing reminder_items order.
//     // Legacy payload shape used `description` + a single dueDate/remindBefore/remindUnit, which overwrote ALL items.
//     const itemsPayload = Array.isArray(descriptions) ? descriptions : null;

//     if (itemsPayload && itemsPayload.length > 0) {

//       // Fetch current reminder_items for this reminder to map index -> row id.
//       const { data: existingItems, error: existingItemsError } = await supabase
//         .from("reminder_items")
//         .select("id")
//         .eq("reminder_id", id)
//         .order("id", { ascending: true });

//       if (existingItemsError) throw existingItemsError;

//       const existingIds = (existingItems ?? []).map((r) => r.id);

//       const buildItemFields = (d: any): Record<string, any> => {
//         const resolvedRepeatMode = d?.repeatMode ?? d?.repeat_mode ?? (repeatMode ?? "once");

//         return {
//           reminder_id: id,
//           description: d?.text ?? d?.description ?? null,
//           due_date: d?.dueDate ?? d?.due_date ?? dueDate,
//           remind_before: d?.remindBefore ?? d?.remind_before ?? remindBefore,
//           remind_unit: d?.remindUnit ?? d?.remind_unit ?? remindUnit,
//           repeat_mode: resolvedRepeatMode,
//           custom_weekdays:
//             resolvedRepeatMode === "custom"
//               ? d?.customWeekdays ?? d?.custom_weekdays ?? customWeekdays ?? null
//               : null,
//         };
//       };

//       // 1) Update existing rows by their row id.
//       for (let i = 0; i < existingIds.length && i < itemsPayload.length; i++) {
//         const rowId = existingIds[i];
//         const d = itemsPayload[i] as any;

//         const updateFields = buildItemFields(d);
//         delete updateFields.reminder_id; // updating reminder_id isn't needed

//         const { error: oneError } = await supabase
//           .from("reminder_items")
//           .update(updateFields)
//           .eq("id", rowId);

//         if (oneError) throw oneError;
//       }

//       // 2) Insert new rows if UI sent more items than currently exist.
//       if (itemsPayload.length > existingIds.length) {
//         const toInsert = itemsPayload.slice(existingIds.length).map((d) => buildItemFields(d));

//         if (toInsert.length > 0) {
//           const { error: insertError } = await supabase.from("reminder_items").insert(toInsert);
//           if (insertError) throw insertError;
//         }
//       }
//     } else { 
//       // Legacy fallback: update ALL items using the single fields, but only if UI is still sending the old shape.
//       const { error: itemError } = await supabase
//         .from("reminder_items")
//         .update({
//           description,
//           due_date: dueDate,
//           remind_before: remindBefore,
//           remind_unit: remindUnit,
//           repeat_mode: repeatMode ?? "once",
//           custom_weekdays: repeatMode === "custom" ? customWeekdays ?? null : null,
//         })
//         .eq("reminder_id", id);

//       if (itemError) throw itemError;
//     }


//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err.message || "Failed to update reminder" },
//       { status: 500 }
//     );
//   }
// }     


import { NextResponse } from "next/server";
import { supabaseService as supabase } from "@/lib/supabase";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      title,
      userEmail,
      phoneNumber,
      is_enabled, // ✅ FIXED (use DB naming consistently)
      isEnabled,  // fallback support
      descriptions,
      description,
      dueDate,
      remindBefore,
      remindUnit,
      repeatMode,
      customWeekdays,
    } = body;

    const finalIsEnabled =
      typeof is_enabled === "boolean" ? is_enabled : isEnabled;

    // =========================
    // 1. UPDATE PARENT REMINDER
    // =========================
    const { error: parentError } = await supabase
      .from("reminders")
      .update({
        title,
        user_email: userEmail,
        phone_number: phoneNumber,
        is_enabled: finalIsEnabled,
      })
      .eq("id", id);

    if (parentError) {
      console.error("Parent update error:", parentError);
      return NextResponse.json(
        { error: parentError.message },
        { status: 500 }
      );
    }

    // =========================
    // 2. UPDATE SUB REMINDERS
    // =========================
    const itemsPayload = Array.isArray(descriptions) ? descriptions : null;

    if (itemsPayload && itemsPayload.length > 0) {
      const { data: existingItems, error: fetchError } = await supabase
        .from("reminder_items")
        .select("id")
        .eq("reminder_id", id)
        .order("id", { ascending: true });

      if (fetchError) {
        console.error("Fetch items error:", fetchError);
        return NextResponse.json(
          { error: fetchError.message },
          { status: 500 }
        );
      }

      const existingIds = (existingItems ?? []).map((r) => r.id);

      const buildItem = (d: any) => {
        const resolvedRepeatMode =
          d?.repeatMode ?? d?.repeat_mode ?? repeatMode ?? "once";

        return {
          reminder_id: id,
          description: d?.text ?? d?.description ?? null,
          due_date: d?.dueDate ?? d?.due_date ?? dueDate,
          remind_before: d?.remindBefore ?? d?.remind_before ?? remindBefore,
          remind_unit: d?.remindUnit ?? d?.remind_unit ?? remindUnit,
          repeat_mode: resolvedRepeatMode,
          custom_weekdays:
            resolvedRepeatMode === "custom"
              ? d?.customWeekdays ?? d?.custom_weekdays ?? customWeekdays ?? null
              : null,
        };
      };

      // -------------------------
      // UPDATE EXISTING ITEMS
      // -------------------------
      for (let i = 0; i < existingIds.length && i < itemsPayload.length; i++) {
        const rowId = existingIds[i];
        const data = buildItem(itemsPayload[i]);

        const { error: updateError } = await supabase
          .from("reminder_items")
          .update(data)
          .eq("id", rowId);

        if (updateError) {
          // ❗ IMPORTANT: do NOT crash entire request
          console.error("Item update error:", updateError);
        }
      }

      // -------------------------
      // INSERT NEW ITEMS
      // -------------------------
      if (itemsPayload.length > existingIds.length) {
        const newItems = itemsPayload
          .slice(existingIds.length)
          .map(buildItem);

        const { error: insertError } = await supabase
          .from("reminder_items")
          .insert(newItems);

        if (insertError) {
          console.error("Insert items error:", insertError);
        }
      }
    }

    // =========================
    // 3. LEGACY FALLBACK
    // =========================
    else {
      const { error: itemError } = await supabase
        .from("reminder_items")
        .update({
          description,
          due_date: dueDate,
          remind_before: remindBefore,
          remind_unit: remindUnit,
          repeat_mode: repeatMode ?? "once",
          custom_weekdays:
            repeatMode === "custom" ? customWeekdays ?? null : null,
        })
        .eq("reminder_id", id);

      if (itemError) {
        console.error("Legacy update error:", itemError);
        return NextResponse.json(
          { error: itemError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update reminder fatal error:", err);

    return NextResponse.json(
      { error: err.message || "Failed to update reminder" },
      { status: 500 }
    );
  }
}