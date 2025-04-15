"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderItem {
  id: number;
  menuItemId: number;
  name: string;
  quantity: number;
  notes: string;
  price: number;
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

interface OrderSummaryItem {
  name: string;
  quantity: number;
  totalAmount: number;
}

export function RestaurantDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

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
    const summary: Record<string, OrderSummaryItem> = {};
    let total = 0;

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!summary[item.name]) {
          summary[item.name] = {
            name: item.name,
            quantity: 0,
            totalAmount: 0,
          };
        }
        summary[item.name].quantity += item.quantity;
        summary[item.name].totalAmount += item.quantity * item.price;
      });
      total += order.totalAmount;
    });

    setOrderSummary(Object.values(summary).sort((a, b) => b.quantity - a.quantity));
    setTotalRevenue(total);
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
    <div className="space-y-8">
      {/* Dish Summary */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Dish Summary</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dish Name</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderSummary.map((item) => (
              <TableRow key={item.name}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">￥{item.totalAmount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold">
              <TableCell>Total Revenue</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">￥{totalRevenue.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Orders List */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">All Orders</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {order.orderItems.map((item) => (
                      <li key={item.id}>
                        {item.name} x{item.quantity}
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {order.orderItems.map((item) => (
                      item.notes && (
                        <li key={item.id} className="text-sm text-gray-600">
                          {item.notes}
                        </li>
                      )
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="text-right">￥{order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}