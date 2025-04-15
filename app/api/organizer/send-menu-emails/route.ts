import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { rsvps, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { sendMagicLink, sendMenuLink } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all attending guests with their user information
    const attendingGuests = await db
      .select({
        id: rsvps.id,
        email: users.email,
        name: users.name,
      })
      .from(rsvps)
      .innerJoin(users, eq(rsvps.userId, users.id))
      .where(eq(rsvps.status, "attending"));

    // Send emails to all attending guests
    for (const guest of attendingGuests) {
      try {
        // Send magic link with menu redirect
        await sendMenuLink(
          guest.email,
          guest.id.toString(),
          false,
          guest.name,
          "/menu"
        );
      } catch (error) {
        console.error(`Failed to send menu email to ${guest.email}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true,
      count: attendingGuests.length 
    });
  } catch (error) {
    console.error("Send menu emails error:", error);
    return NextResponse.json(
      { error: "Failed to send menu emails" },
      { status: 500 }
    );
  }
}
