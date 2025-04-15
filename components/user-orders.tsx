"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderItem {
  id: number;
  menuItemId: number;
  quantity: number;
  notes: string;
  name: string;
  price: number;
  imageUrl?: string;
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

export function UserOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderItem = async (orderId: number, orderItem: OrderItem) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/items/${orderItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderItem),
      });

      if (!response.ok) throw new Error("Failed to update order item");

      await fetchOrders();
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const removeOrderItem = async (orderId: number, orderItemId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/items/${orderItemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove order item");

      await fetchOrders();
      toast({
        title: "Success",
        description: "Item removed from order",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const calculateOrdersSummary = () => {
    const summary = {
      totalSpent: 0,
      pendingTotal: 0,
      acceptedTotal: 0,
      totalOrders: orders.length,
      pendingOrders: 0,
      acceptedOrders: 0
    };

    orders.forEach(order => {
      const total = Number(order.totalAmount);
      summary.totalSpent += total;
      
      if (order.status === 'pending') {
        summary.pendingTotal += total;
        summary.pendingOrders++;
      } else if (['preparing', 'ready', 'delivered'].includes(order.status)) {
        summary.acceptedTotal += total;
        summary.acceptedOrders++;
      }
    });

    return summary;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Your Orders</h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const summary = calculateOrdersSummary();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Orders</h2>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="border-b pb-2 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        Placed on: {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'ready' ? 'bg-green-100 text-green-800' :
                          order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </p>
                    </div>
                    <p className="font-semibold">Total: ${Number(order.totalAmount).toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 border-b pb-4 last:border-b-0">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              ${Number(item.price).toFixed(2)} x {item.quantity} = 
                              ${(Number(item.price) * item.quantity).toFixed(2)}
                            </p>
                            {item.notes && (
                              <p className="text-sm text-gray-500 mt-1">Note: {item.notes}</p>
                            )}
                          </div>
                          
                          {order.status === "pending" && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity</Label>
                                <Input
                                  id={`quantity-${item.id}`}
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newQuantity = parseInt(e.target.value);
                                    if (newQuantity >= 1) {
                                      updateOrderItem(order.id, { ...item, quantity: newQuantity });
                                    }
                                  }}
                                  className="w-20"
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeOrderItem(order.id, item.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          )}

                          {order.status !== "pending" && (
                            <div className="flex items-center gap-2">
                              <Label>Quantity: {item.quantity}</Label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Orders Summary</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-700">Orders</h4>
                <ul className="mt-2 space-y-1">
                  <li className="text-sm">Total Orders: {summary.totalOrders}</li>
                  <li className="text-sm">Pending Orders: {summary.pendingOrders}</li>
                  <li className="text-sm">Accepted Orders: {summary.acceptedOrders}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Costs</h4>
                <ul className="mt-2 space-y-1">
                  <li className="text-sm">Total Spent: ${summary.totalSpent.toFixed(2)}</li>
                  <li className="text-sm">Pending Total: ${summary.pendingTotal.toFixed(2)}</li>
                  <li className="text-sm">Accepted Total: ${summary.acceptedTotal.toFixed(2)}</li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}