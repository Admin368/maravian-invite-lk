import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createInvitation,
  sendMagicLink,
  updateEmailSentStatus,
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guestId, email, name } = await request.json();

    if (!guestId || !email) {
      return NextResponse.json(
        { error: "Guest ID and email are required" },
        { status: 400 }
      );
    }

    // Create invitation with token
    const invitation = await createInvitation(guestId);

    // Send magic link email
    await sendMagicLink(email, invitation.token, false, name);

    // Update email sent status
    await updateEmailSentStatus(guestId, true);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Send invite error:", error);
    return NextResponse.json(
      { error: "Failed to send invite" },
      { status: 500 }
    );
  }
}
