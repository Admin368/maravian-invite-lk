import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getAllGuests } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const guests = await getAllGuests()

    return NextResponse.json({ success: true, guests }, { status: 200 })
  } catch (error) {
    console.error("Get guests error:", error)
    return NextResponse.json({ error: "Failed to get guests" }, { status: 500 })
  }
}
