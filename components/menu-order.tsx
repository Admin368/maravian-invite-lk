"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

interface OrderItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

export function MenuOrder() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/menu");
      const data = await response.json();
      setMenuItems(data.filter((item: MenuItem) => item.isAvailable));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
    }
  };

  const addToOrder = (item: MenuItem) => {
    const existingItem = orderItems.find((i) => i.menuItemId === item.id);
    if (existingItem) {
      setOrderItems(
        orderItems.map((i) =>
          i.menuItemId === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          notes: "",
        },
      ]);
    }
  };

  const removeFromOrder = (menuItemId: number) => {
    setOrderItems(orderItems.filter((item) => item.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity < 1) return;
    setOrderItems(
      orderItems.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const updateNotes = (menuItemId: number, notes: string) => {
    setOrderItems(
      orderItems.map((item) =>
        item.menuItemId === menuItemId ? { ...item, notes } : item
      )
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: calculateTotal(),
        }),
      });

      if (!response.ok) throw new Error("Failed to place order");

      setOrderItems([]);
      toast({
        title: "Success",
        description: "Order placed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 text-white">
      {/* Menu Items */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Menu</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {menuItems.map((item) => (
            <Card key={item.id} className="p-4">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="font-semibold mt-2">${item.price.toFixed(2)}</p>
              <Button
                onClick={() => addToOrder(item)}
                className="w-full mt-2"
              >
                Add to Order
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Order</h2>
        {orderItems.length === 0 ? (
          <p>No items in your order yet.</p>
        ) : (
          <>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <Card key={item.menuItemId} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromOrder(item.menuItemId)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label>Quantity:</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.menuItemId,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Special requests:</Label>
                      <Textarea
                        value={item.notes}
                        onChange={(e) =>
                          updateNotes(item.menuItemId, e.target.value)
                        }
                        placeholder="Any special requests?"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="border-t pt-4">
              <p className="text-lg font-semibold">
                Total: ${calculateTotal().toFixed(2)}
              </p>
              <Button
                onClick={handlePlaceOrder}
                className="w-full mt-4"
                size="lg"
              >
                Place Order
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}