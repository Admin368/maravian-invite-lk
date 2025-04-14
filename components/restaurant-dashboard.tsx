"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface OrderItem {
  id: number;
  menuItemId: number;
  quantity: number;
  notes: string;
}

interface Order {
  id: number;
  userId: number;
  rsvpId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export function RestaurantDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSummary, setOrderSummary] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrders(data);
      calculateOrderSummary(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    }
  };

  const calculateOrderSummary = (orders: Order[]) => {
    const summary: Record<string, number> = {};
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const key = `${item.menuItemId}`;
        summary[key] = (summary[key] || 0) + item.quantity;
      });
    });
    setOrderSummary(summary);
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      await fetchOrders();
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 text-white">
      <h2 className="text-2xl font-bold">Restaurant Dashboard</h2>

      {/* Order Summary */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2">
          {Object.entries(orderSummary).map(([menuItemId, quantity]) => (
            <div key={menuItemId} className="flex justify-between">
              <span>Menu Item #{menuItemId}</span>
              <span className="font-semibold">Quantity: {quantity}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Order List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">All Orders</h3>
        {orders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-sm text-gray-600">
                  RSVP #{order.rsvpId} - User #{order.userId}
                </p>
                <p>Total: ${order.totalAmount.toFixed(2)}</p>
                <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                className="border p-1 rounded"
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              <ul className="space-y-2">
                {order.orderItems.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      Menu Item #{item.menuItemId} x{item.quantity}
                    </span>
                    {item.notes && (
                      <span className="text-sm text-gray-600">
                        Note: {item.notes}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}