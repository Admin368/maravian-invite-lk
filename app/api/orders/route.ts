import { type NextRequest, NextResponse } from "next/server";
import { getSession, type Session } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems, menuItems, rsvps } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// GET /api/orders - Get orders for current user or all orders for organizer
export async function GET() {
  const session = await getSession() as Session;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (session.isOrganizer) {
      // For organizers, get all orders with their items
      const allOrders = await db.select({
        orderId: orders.id,
        userId: orders.userId,
        rsvpId: orders.rsvpId,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
        orderItem: {
          id: orderItems.id,
          quantity: orderItems.quantity,
          notes: orderItems.notes,
          menuItemId: menuItems.id,
          name: menuItems.name,
          price: menuItems.price,
          imageUrl: menuItems.imageUrl,
        }
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id));

      // Group items by order
      const formattedOrders = Object.values(
        allOrders.reduce((acc: any, row) => {
          if (!acc[row.orderId]) {
            acc[row.orderId] = {
              id: row.orderId,
              userId: row.userId,
              rsvpId: row.rsvpId,
              totalAmount: Number(row.totalAmount),
              status: row.status,
              createdAt: row.createdAt,
              orderItems: [],
            };
          }
          if (row.orderItem?.id) {
            acc[row.orderId].orderItems.push({
              id: row.orderItem.id,
              menuItemId: row.orderItem.menuItemId,
              name: row.orderItem.name,
              price: Number(row.orderItem.price),
              quantity: row.orderItem.quantity,
              notes: row.orderItem.notes,
              imageUrl: row.orderItem.imageUrl,
            });
          }
          return acc;
        }, {})
      );

      return NextResponse.json(formattedOrders);
    }

    // For regular users, get their orders with items
    const userOrders = await db.select({
      orderId: orders.id,
      userId: orders.userId,
      rsvpId: orders.rsvpId,
      totalAmount: orders.totalAmount,
      status: orders.status,
      createdAt: orders.createdAt,
      orderItem: {
        id: orderItems.id,
        quantity: orderItems.quantity,
        notes: orderItems.notes,
        menuItemId: menuItems.id,
        name: menuItems.name,
        price: menuItems.price,
        imageUrl: menuItems.imageUrl,
      }
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(eq(orders.userId, session.id));

    // Group items by order
    const formattedOrders = Object.values(
      userOrders.reduce((acc: any, row) => {
        if (!acc[row.orderId]) {
          acc[row.orderId] = {
            id: row.orderId,
            userId: row.userId,
            rsvpId: row.rsvpId,
            totalAmount: Number(row.totalAmount),
            status: row.status,
            createdAt: row.createdAt,
            orderItems: [],
          };
        }
        if (row.orderItem?.id) {
          acc[row.orderId].orderItems.push({
            id: row.orderItem.id,
            menuItemId: row.orderItem.menuItemId,
            name: row.orderItem.name,
            price: Number(row.orderItem.price),
            quantity: row.orderItem.quantity,
            notes: row.orderItem.notes,
            imageUrl: row.orderItem.imageUrl,
          });
        }
        return acc;
      }, {})
    );

    return NextResponse.json(formattedOrders);
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

    return NextResponse.json({
      ...order,
      totalAmount: Number(order.totalAmount)
    });
  } catch (error) {
    console.error(error);
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

    return NextResponse.json({
      ...updatedOrder[0],
      totalAmount: Number(updatedOrder[0].totalAmount)
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}