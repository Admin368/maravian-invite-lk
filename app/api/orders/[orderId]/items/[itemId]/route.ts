import { type NextRequest, NextResponse } from "next/server";
import { getSession, type Session } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems, menuItems } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string; itemId: string } }
) {
  const session = await getSession() as Session;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orderId = parseInt(params.orderId);
    const itemId = parseInt(params.itemId);
    const body = await request.json();

    // Verify the order belongs to the user
    const order = await db.select()
      .from(orders)
      .where(and(
        eq(orders.id, orderId),
        eq(orders.userId, session.id)
      ))
      .limit(1);

    if (!order.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order[0].status !== "pending") {
      return NextResponse.json(
        { error: "Can only modify pending orders" },
        { status: 400 }
      );
    }

    // Update the order item
    const updatedItem = await db.update(orderItems)
      .set({
        quantity: body.quantity
      })
      .where(and(
        eq(orderItems.id, itemId),
        eq(orderItems.orderId, orderId)
      ))
      .returning();

    if (!updatedItem.length) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    // Recalculate order total
    const items = await db.select({
      quantity: orderItems.quantity,
      price: menuItems.price
    })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(eq(orderItems.orderId, orderId));

    const total = items.reduce((sum, item) => 
      sum + (item.quantity * Number(item.price)), 0
    ).toFixed(2);

    await db.update(orders)
      .set({
        totalAmount: total.toString(),
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId));

    return NextResponse.json(updatedItem[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order item" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string; itemId: string } }
) {
  const session = await getSession() as Session;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orderId = parseInt(params.orderId);
    const itemId = parseInt(params.itemId);

    // Verify the order belongs to the user
    const order = await db.select()
      .from(orders)
      .where(and(
        eq(orders.id, orderId),
        eq(orders.userId, session.id)
      ))
      .limit(1);

    if (!order.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order[0].status !== "pending") {
      return NextResponse.json(
        { error: "Can only modify pending orders" },
        { status: 400 }
      );
    }

    // Delete the order item
    await db.delete(orderItems)
      .where(and(
        eq(orderItems.id, itemId),
        eq(orderItems.orderId, orderId)
      ));

    // Get remaining items with their prices
    const remainingItems = await db.select({
      quantity: orderItems.quantity,
      price: menuItems.price
    })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(eq(orderItems.orderId, orderId));

    if (remainingItems.length === 0) {
      // If no items left, delete the order
      await db.delete(orders)
        .where(eq(orders.id, orderId));
      
      return NextResponse.json({ message: "Order deleted" });
    }

    // Update order total
    const newTotal = remainingItems.reduce((sum, item) => 
      sum + (item.quantity * Number(item.price)), 0
    ).toFixed(2);

    await db.update(orders)
      .set({
        totalAmount: newTotal.toString(),
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId));

    return NextResponse.json({ message: "Order item deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete order item" }, { status: 500 });
  }
}