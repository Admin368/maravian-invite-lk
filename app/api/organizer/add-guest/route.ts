import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createUser,
  getUserByEmail,
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

    const { name, email, noEmail, wechatId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let userEmail = email;
    let shouldSendEmail = true;

    if (noEmail) {
      // Generate a temporary email with timestamp
      const timestamp = Date.now();
      userEmail = `${timestamp}@noemail.com`;
      shouldSendEmail = false;
    } else if (!email) {
      return NextResponse.json(
        { error: "Email is required when 'No Email' is not selected" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(userEmail);

    if (existingUser) {
      return NextResponse.json(
        { error: "A guest with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user with WeChat ID
    const user = await createUser(userEmail, name, false, wechatId);

    // Create invitation and send email if needed
    const invitation = await createInvitation(user.id);

    if (shouldSendEmail) {
      await sendMagicLink(userEmail, invitation.token, false, name);
      await updateEmailSentStatus(user.id, true);
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Add guest error:", error);
    return NextResponse.json({ error: "Failed to add guest" }, { status: 500 });
  }
}
