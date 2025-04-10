import { NextResponse } from "next/server";
import {
  db,
  getUserByEmail,
  getOrganizers,
  addOrganizer,
  removeOrganizer,
  updateOrganizer,
} from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendOrganizerStatusEmail } from "@/lib/email";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizers = await getOrganizers();
    return NextResponse.json({ organizers });
  } catch (error) {
    console.error("Error fetching organizers:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name } = await request.json();

    // First check if user exists
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return NextResponse.json(
        { error: "User does not exist. They need to sign up first." },
        { status: 400 }
      );
    }

    // Add as organizer
    await addOrganizer(existingUser.id);

    // Send email notification
    await sendOrganizerStatusEmail(email, name, true);

    return NextResponse.json({ message: "Organizer added successfully" });
  } catch (error) {
    console.error("Error adding organizer:", error);
    return NextResponse.json(
      { error: "Failed to add organizer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizerId } = await request.json();

    // Get organizer details before removing
    const organizer = await sql`
      SELECT id, email, name FROM users WHERE id = ${organizerId}
    `;

    if (!organizer || organizer.length === 0) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 404 }
      );
    }

    await removeOrganizer(organizerId);

    // Send email notification
    await sendOrganizerStatusEmail(
      organizer[0].email,
      organizer[0].name,
      false
    );

    return NextResponse.json({ message: "Organizer removed successfully" });
  } catch (error) {
    console.error("Error removing organizer:", error);
    return NextResponse.json(
      { error: "Failed to remove organizer" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session?.isOrganizer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizerId, name } = await request.json();

    if (!organizerId || !name) {
      return NextResponse.json(
        { error: "Organizer ID and name are required" },
        { status: 400 }
      );
    }

    await updateOrganizer(organizerId, name);

    return NextResponse.json({ message: "Organizer updated successfully" });
  } catch (error) {
    console.error("Error updating organizer:", error);
    return NextResponse.json(
      { error: "Failed to update organizer" },
      { status: 500 }
    );
  }
}
