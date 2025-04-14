import { type NextRequest, NextResponse } from "next/server";
import { getSession, type Session } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems, rsvps } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/orders - Get orders for current user or all orders for organizer
export async function GET() {
  const session = await getSession() as Session;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (session.isOrganizer) {
      const allOrders = await db.select().from(orders).innerJoin(orderItems, eq(orders.id, orderItems.orderId));
      return NextResponse.json(allOrders);
    }

    const userOrders = await db.select()
      .from(orders)
      .where(eq(orders.userId, session.id));
    
    return NextResponse.json(userOrders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  const session = await getSession() as Session;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Verify user has RSVP'd
    const userRsvp = await db.select()
      .from(rsvps)
      .where(eq(rsvps.userId, session.id));
    
    if (!userRsvp.length) {
      return NextResponse.json({ error: "Must RSVP before placing order" }, { status: 400 });
    }

    // Create order
    const [order] = await db.insert(orders)
      .values({
        userId: session.id,
        rsvpId: userRsvp[0].id,
        totalAmount: body.totalAmount,
        status: 'pending'
      })
      .returning();

    // Create order items
    const orderItemsToInsert = body.items.map((item: any) => ({
      orderId: order.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      notes: item.notes
    }));

    await db.insert(orderItems)
      .values(orderItemsToInsert);

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

// PUT /api/orders - Update order status (organizer only)
export async function PUT(request: NextRequest) {
  const session = await getSession() as Session;
  if (!session?.isOrganizer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updatedOrder = await db.update(orders)
      .set({
        status: body.status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, body.id))
      .returning();

    if (!updatedOrder.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}