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
  user: {
    name: string
  }
}

interface OrderSummaryItem {
  name: string;
  quantity: number;
  totalAmount: number;
}

export function RestaurantDashboard({restaurant_key}:{restaurant_key: string}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?restaurant_key=${restaurant_key}`);
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
        body: JSON.stringify({ id: orderId, status, restaurant_key }),
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
      <p className="text-white text-center bg-gray-500 p-2">此订单摘要是实时的，当客人宣布他们将在到达时接受的订单时，信息将在刷新后更新。并不是所有的客人都声明了他们要点什么</p>
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Dish Summary 订单摘要</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dish Name 菜肴名称</TableHead>
              <TableHead className="text-right">Quantity 数量</TableHead>
              <TableHead className="text-right">Total Amount 总成本</TableHead>
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
              <TableCell>Estimated Revenue</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">￥{totalRevenue.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Orders List */}
      <p className="text-white bg-gray-500 text-center p-2">{`您可以用标记订单，如果您已经确认订单`}</p>
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">All Orders</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Items 菜肴名称</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status 状态</TableHead>
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
                  {order.user.name}
                  {/* <ul className="list-disc list-inside">
                    {order.orderItems.map((item) => (
                      item.notes && (
                        <li key={item.id} className="text-sm text-gray-600">
                          {item.notes}
                        </li>
                      )
                    ))}
                  </ul> */}
                </TableCell>
                <TableCell className="text-right">￥{order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="pending">Pending 正在挂起</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Accepted 已接受</option>
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