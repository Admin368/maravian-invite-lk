"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// import { toast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Loading } from "./ui/loading";
import { toast } from "react-toastify";

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price">("name");

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const sortItems = (items: MenuItem[]) => {
    return items.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return a.price - b.price;
      }
    });
  };

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const response = await toast.promise(fetch("/api/menu"), {
        pending: "Loading menu items...",
        success: "Menu items loaded successfully!",
        error: "Failed to load menu items",
      });
      const data = await response.json();
      // Filter available items and sort them
      const availableItems = data.filter((item: MenuItem) => item.isAvailable);
      const sortedItems = sortItems(availableItems);
      setMenuItems(sortedItems);
    } catch (error) {
      setError("Failed to fetch menu items");
      toast.error("Failed to fetch menu items");
    } finally {
      setIsLoading(false);
    }
  };

  // Re-sort items when sort method changes
  useEffect(() => {
    setMenuItems((prevItems) => sortItems([...prevItems]));
  }, [sortBy]);

  const addToOrder = (item: MenuItem) => {
    const existingItem = orderItems.find((i) => i.menuItemId === item.id);
    if (existingItem) {
      setOrderItems(
        orderItems.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
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
      const response = await toast.promise(
        fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: orderItems,
            totalAmount: calculateTotal(),
          }),
        }),
        {
          pending: "Placing order...",
          success: "Order placed successfully!",
          error: "Failed to place order",
        }
      );

      if (!response.ok) throw new Error("Failed to place order");

      setOrderItems([]);
      setIsCartOpen(false);
      toast.success("Your order has been received.");
    } catch (error) {
      toast.error("There was a problem placing your order. Please try again.");
    }
  };

  const decreaseQuantity = (item: MenuItem) => {
    const existingItem = orderItems.find((i) => i.menuItemId === item.id);
    if (existingItem) {
      if (existingItem.quantity > 1) {
        setOrderItems(
          orderItems.map((i) =>
            i.menuItemId === item.id ? { ...i, quantity: i.quantity - 1 } : i
          )
        );
      } else {
        removeFromOrder(item.id);
      }
    }
  };

  const getItemQuantity = (itemId: number) => {
    const item = orderItems.find((i) => i.menuItemId === itemId);
    return item ? item.quantity : 0;
  };
  if (error) {
    <div className="flex-1 h-full flex justify-center align-middle">
      <pre className="text-red">There was an error, please reload</pre>
    </div>;
  }

  if (isLoading) {
    return (
      <div className="flex-1 h-full flex justify-center align-middle">
        <Loading />
      </div>
    );
  }
  return (
    <div className="relative pb-24">
      <div className="mb-4 flex justify-end">
        <div className="flex items-center gap-2">
          <Label htmlFor="sort">Sort by:</Label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "price")}
            className="rounded-md border bg-background px-3 py-2 text-black"
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
          </select>
        </div>
      </div>
      <Dialog>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <Card key={item.id} className="p-4">
              {item.imageUrl && (
                <DialogTrigger asChild>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-md mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(item.imageUrl)}
                  />
                </DialogTrigger>
              )}
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="font-semibold mt-2">￥{item.price.toFixed(2)}</p>

              <div className="flex items-center justify-between mt-4 border-t pt-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => decreaseQuantity(item)}
                    disabled={getItemQuantity(item.id) === 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">
                    {getItemQuantity(item.id)}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => addToOrder(item)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <DialogContent className="max-w-none w-screen h-screen p-0 bg-black text-white">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* <Button 
              variant="ghost" 
              className="absolute top-4 right-4 text-white hover:bg-white/20" 
              onClick={() => setSelectedImage(null)}
            >
              ×
            </Button> */}
            <img
              src={selectedImage || ""}
              alt="Full size"
              className="max-h-screen max-w-screen object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Cart */}
      {orderItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4">
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <div className="container mx-auto flex items-center justify-between">
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-black"
                >
                  Cart •{" "}
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items
                </Button>
              </SheetTrigger>
              <div className="flex items-center gap-4">
                <p className="text-lg font-semibold">
                  Total: ￥{calculateTotal().toFixed(2)}
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="lg">Place Order</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Order</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to place this order? The total
                        amount is ￥{calculateTotal().toFixed(2)}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePlaceOrder}>
                        Confirm Order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <SheetContent side="bottom" className="h-[80vh]">
              <div className="space-y-4 mt-4">
                <h2 className="text-2xl font-bold">Cart</h2>
                {orderItems.map((item) => (
                  <Card key={item.menuItemId} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm">
                          ￥{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(item.menuItemId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(item.menuItemId, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeFromOrder(item.menuItemId)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Textarea
                        value={item.notes}
                        onChange={(e) =>
                          updateNotes(item.menuItemId, e.target.value)
                        }
                        placeholder="Any special requests?"
                        className="mt-2"
                      />
                    </div>
                  </Card>
                ))}
                <div className="border-t pt-4 mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold">
                      Total: ￥{calculateTotal().toFixed(2)}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        Place Order
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Order</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to place this order? The total
                          amount is ￥{calculateTotal().toFixed(2)}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePlaceOrder}>
                          Confirm Order
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}
