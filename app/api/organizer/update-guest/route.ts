import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guestId, name, email, wechatId } = await request.json();

    if (!guestId) {
      return NextResponse.json(
        { error: "Guest ID is required" },
        { status: 400 }
      );
    }

    // Update user information
    await sql`
      UPDATE users
      SET 
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email)
      WHERE id = ${guestId}
    `;

    // Update WeChat ID in rsvps table
    if (wechatId !== undefined) {
      await sql`
        UPDATE rsvps
        SET wechat_id = ${wechatId}
        WHERE user_id = ${guestId}
      `;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Update guest error:", error);
    return NextResponse.json(
      { error: "Failed to update guest" },
      { status: 500 }
    );
  }
}
