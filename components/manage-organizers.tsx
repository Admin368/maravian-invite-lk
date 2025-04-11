"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import { Trash2, Edit2, Check, X, Mail } from "lucide-react";
import { Loading } from "./ui/loading";

type Organizer = {
  id: number;
  user_id: string;
  name: string;
  email: string;
};

export function ManageOrganizers() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newOrganizer, setNewOrganizer] = useState({ email: "", name: "" });
  const [editingOrganizer, setEditingOrganizer] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchOrganizers();
  }, []);

  async function fetchOrganizers() {
    try {
      const response = await fetch("/api/organizer/manage");
      if (!response.ok) {
        throw new Error("Failed to fetch organizers");
      }
      const data = await response.json();
      setOrganizers(data.organizers);
    } catch (error) {
      console.error("Error fetching organizers:", error);
      toast.error("Failed to load organizers");
    }
  }

  async function handleAddOrganizer(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/organizer/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrganizer),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add organizer");
      }

      toast.success("Organizer added successfully");
      setNewOrganizer({ email: "", name: "" });
      fetchOrganizers();
    } catch (error) {
      console.error("Error adding organizer:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add organizer"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveOrganizer(organizerId: number) {
    if (!confirm("Are you sure you want to remove this organizer?")) return;

    try {
      const response = await fetch("/api/organizer/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove organizer");
      }

      toast.success("Organizer removed successfully");
      fetchOrganizers();
    } catch (error) {
      console.error("Error removing organizer:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to remove organizer"
      );
    }
  }

  function startEditing(organizer: Organizer) {
    setEditingOrganizer({ id: organizer.id, name: organizer.name });
    setEditName(organizer.name);
  }

  function cancelEditing() {
    setEditingOrganizer(null);
    setEditName("");
  }

  async function handleUpdateOrganizer() {
    if (!editingOrganizer) return;

    try {
      const response = await fetch("/api/organizer/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerId: editingOrganizer.id,
          name: editName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update organizer");
      }

      toast.success("Organizer updated successfully");
      setEditingOrganizer(null);
      setEditName("");
      fetchOrganizers();
    } catch (error) {
      console.error("Error updating organizer:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update organizer"
      );
    }
  }

  async function handleSendEmail(organizer: Organizer) {
    try {
      const response = await fetch("/api/organizer/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: organizer.email,
          name: organizer.name,
          resend: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send email");
      }

      toast.success(`Email sent to ${organizer.email}`);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send email"
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Organizers</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddOrganizer} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Email"
              type="email"
              value={newOrganizer.email}
              onChange={(e) =>
                setNewOrganizer({ ...newOrganizer, email: e.target.value })
              }
              required
            />
            <Input
              placeholder="Name"
              value={newOrganizer.name}
              onChange={(e) =>
                setNewOrganizer({ ...newOrganizer, name: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loading size="lg" />
                Adding...
              </>
            ) : (
              "Add Organizer"
            )}
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No organizers found
                </TableCell>
              </TableRow>
            ) : (
              organizers.map((organizer) => (
                <TableRow key={organizer.id}>
                  <TableCell>
                    {editingOrganizer?.id === organizer.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      organizer.name
                    )}
                  </TableCell>
                  <TableCell>{organizer.email}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingOrganizer?.id === organizer.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleUpdateOrganizer}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(organizer)}
                          >
                            <Edit2 className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSendEmail(organizer)}
                          >
                            <Mail className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOrganizer(organizer.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
