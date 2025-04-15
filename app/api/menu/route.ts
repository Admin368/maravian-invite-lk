import { type NextRequest, NextResponse } from "next/server";
import { getSession, type Session } from "@/lib/auth";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/menu - Get all menu items
export async function GET() {
  try {
    const items = await db.select().from(menuItems);
    // Convert price strings to numbers
    const formattedItems = items.map(item => ({
      ...item,
      price: Number(item.price)
    }));
    return NextResponse.json(formattedItems);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

// POST /api/menu - Create a new menu item (organizer only)
export async function POST(request: NextRequest) {
  const session = await getSession() as Session;
  if (!session?.isOrganizer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newItem = await db.insert(menuItems).values({
      name: body.name,
      description: body.description,
      price: body.price,
      imageUrl: body.imageUrl,
      isAvailable: true,
    }).returning();

    return NextResponse.json({
      ...newItem[0],
      price: Number(newItem[0].price)
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}

// PUT /api/menu - Update a menu item (organizer only)
export async function PUT(request: NextRequest) {
  const session = await getSession() as Session;
  if (!session?.isOrganizer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updatedItem = await db.update(menuItems)
      .set({
        name: body.name,
        description: body.description,
        price: body.price,
        imageUrl: body.imageUrl,
        isAvailable: body.isAvailable,
        updatedAt: new Date()
      })
      .where(eq(menuItems.id, body.id))
      .returning();

    if (!updatedItem.length) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...updatedItem[0],
      price: Number(updatedItem[0].price)
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}