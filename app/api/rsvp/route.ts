import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createOrUpdateRsvp, getOrganizers, createNotification, notifyOrganizers } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, status, plusOne, plusOneName } = await request.json()

    // Verify the user is updating their own RSVP or is an organizer
    if (userId !== session.id && !session.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Create or update RSVP
    const rsvp = await createOrUpdateRsvp(userId, status, plusOne, plusOneName)

    // Create notification for organizers
    const message = `${session.name} has ${status === "attending" ? "accepted" : "declined"} the invitation${plusOne ? ` and is bringing ${plusOneName}` : ""}.`

    // Notify organizers via email
    await notifyOrganizers(
      message,
      `RSVP Update: ${session.name} is ${status === "attending" ? "attending" : "not attending"}`,
    )

    // Create notification in database for organizers
    const organizers = await getOrganizers()
    for (const organizer of organizers) {
      await createNotification(organizer.id, message)
    }

    return NextResponse.json({ success: true, rsvp }, { status: 200 })
  } catch (error) {
    console.error("RSVP error:", error)
    return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 })
  }
}
