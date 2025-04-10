import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getAllGuests, createInvitation, sendMagicLink } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const guests = await getAllGuests()
    const pendingGuests = guests.filter((guest) => !guest.status || guest.status === "pending")

    for (const guest of pendingGuests) {
      // Create invitation with token
      const invitation = await createInvitation(guest.id)

      // Send magic link email
      await sendMagicLink(guest.email, invitation.token, false)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Send pending invites error:", error)
    return NextResponse.json({ error: "Failed to send invites" }, { status: 500 })
  }
}
