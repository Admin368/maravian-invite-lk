import { type NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createInvitation } from "@/lib/db";
import { sendMagicLink } from "@/lib/email";

// Check if we're in a preview environment
const isPreviewEnvironment =
  process.env.NODE_ENV !== "production" || !process.env.SMTP_HOST;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await getUserByEmail(email);

    // If user doesn't exist, we'll handle this in the frontend
    // We don't want to reveal if an email exists in our system for security reasons
    if (!user) {
      // In preview mode, we'll be more helpful
      if (isPreviewEnvironment) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Email not found on invitation list. Please try a different email or add this user first.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message:
            "If your email is in our system, you will receive a magic link",
        },
        { status: 200 }
      );
    }

    // Create invitation with token
    const invitation = await createInvitation(user.id);

    // Send magic link email
    const result = await sendMagicLink(
      email,
      invitation.token,
      user.is_organizer,
      user.name
    );

    // In preview mode, return the magic link URL directly
    if (isPreviewEnvironment && "magicLinkUrl" in result) {
      return NextResponse.json(
        {
          success: true,
          message: "Magic link generated for preview",
          magicLinkUrl: result.magicLinkUrl,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Magic link sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to process login request" },
      { status: 500 }
    );
  }
}
