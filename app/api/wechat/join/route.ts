import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { updateWeChatStatus } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()

    // Verify the user is updating their own status or is an organizer
    if (userId !== session.id && !session.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update WeChat status
    await updateWeChatStatus(userId, true)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("WeChat join error:", error)
    return NextResponse.json({ error: "Failed to update WeChat status" }, { status: 500 })
  }
}
