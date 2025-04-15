import { type NextRequest, NextResponse } from "next/server";
import { getInvitationByToken, markInvitationAsUsed } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const redirect = searchParams.get("redirect");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Get invitation by token
    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Verify this is an organizer invitation
    if (!invitation.is_organizer) {
      return NextResponse.json(
        { error: "Invalid organizer token" },
        { status: 403 }
      );
    }

    // Mark invitation as used
    await markInvitationAsUsed(invitation.id);

    // Create session
    await createSession(invitation.email);

    return NextResponse.json(
      { success: true, redirectUrl: redirect ?? "/organizer" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Organizer verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify organizer token" },
      { status: 500 }
    );
  }
}
