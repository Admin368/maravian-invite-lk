"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

export function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/menu");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          price: parseFloat(newItem.price),
        }),
      });

      if (!response.ok) throw new Error("Failed to add item");

      await fetchMenuItems();
      setNewItem({ name: "", description: "", price: "", imageUrl: "" });
      toast({
        title: "Success",
        description: "Menu item added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async (item: MenuItem) => {
    try {
      const response = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (!response.ok) throw new Error("Failed to update item");

      await fetchMenuItems();
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Menu item updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 text-white">
      <Dialog>
        <h2 className="text-2xl font-bold">Menu Management</h2>
        
        {/* Add new item form */}
        <Card className="p-4">
          <form onSubmit={handleAddItem} className="space-y-4">
            <h3 className="text-lg font-semibold">Add New Menu Item</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={newItem.imageUrl}
                onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
              />
            </div>

            <Button type="submit">Add Item</Button>
          </form>
        </Card>

        {/* List of existing items */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              {editingItem?.id === item.id ? (
                <div className="space-y-4">
                  <Input
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  />
                  <Textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                  />
                  <Input
                    value={editingItem.imageUrl}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingItem.isAvailable}
                      onCheckedChange={(checked) => setEditingItem({ ...editingItem, isAvailable: checked })}
                    />
                    <Label>Available</Label>
                  </div>
                  <div className="space-x-2">
                    <Button onClick={() => handleUpdateItem(editingItem)}>Save</Button>
                    <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {item.imageUrl && (
                    <DialogTrigger asChild>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(item.imageUrl)}
                      />
                    </DialogTrigger>
                  )}
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="font-semibold">${Number(item.price).toFixed(2)}</p>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={(checked) => handleUpdateItem({ ...item, isAvailable: checked })}
                    />
                    <Label>Available</Label>
                  </div>
                  <Button onClick={() => setEditingItem(item)}>Edit</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
        <DialogContent className="max-w-screen-lg w-full h-full flex items-center justify-center p-0 bg-black/90">
          <img
            src={selectedImage || ''}
            alt="Full size"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}