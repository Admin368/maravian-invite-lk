import { type NextRequest, NextResponse } from "next/server"
import { getInvitationByToken, markInvitationAsUsed } from "@/lib/db"
import { createSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Get invitation by token
    const invitation = await getInvitationByToken(token)

    if (!invitation) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Mark invitation as used
    await markInvitationAsUsed(invitation.id)

    // Create session
    await createSession(invitation.email)

    // Redirect based on user type
    const redirectUrl = invitation.is_organizer ? "/organizer" : "/invitation"

    return NextResponse.json({ success: true, redirectUrl }, { status: 200 })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
  }
}
