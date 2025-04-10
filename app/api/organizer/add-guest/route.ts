import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createUser, getUserByEmail } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ error: "A guest with this email already exists" }, { status: 400 })
    }

    // Create new user
    const user = await createUser(email, name, false)

    return NextResponse.json({ success: true, user }, { status: 200 })
  } catch (error) {
    console.error("Add guest error:", error)
    return NextResponse.json({ error: "Failed to add guest" }, { status: 500 })
  }
}
