import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createInvitation } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guestId } = await request.json()

    if (!guestId) {
      return NextResponse.json({ error: "Guest ID is required" }, { status: 400 })
    }

    // Create invitation with token
    const invitation = await createInvitation(guestId)

    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const inviteLink = `${baseUrl}/invitation/verify?token=${invitation.token}`

    return NextResponse.json({ success: true, inviteLink }, { status: 200 })
  } catch (error) {
    console.error("Generate link error:", error)
    return NextResponse.json({ error: "Failed to generate invitation link" }, { status: 500 })
  }
}
