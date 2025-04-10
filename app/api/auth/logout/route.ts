import { type NextRequest, NextResponse } from "next/server"
import { clearSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await clearSession()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
