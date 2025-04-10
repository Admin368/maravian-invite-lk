import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user: session }, { status: 200 })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 })
  }
}
