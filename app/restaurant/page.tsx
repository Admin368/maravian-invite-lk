"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RestaurantDashboard } from "@/components/restaurant-dashboard";

export default function RestaurantPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already authorized
    const auth = localStorage.getItem("restaurant_auth");
    if (auth === "true") {
      setIsAuthorized(true);
    }
  }, []);

  const handleLogin = () => {
    if (password === "1234") {
      localStorage.setItem("restaurant_auth", "true");
      setIsAuthorized(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="container mx-auto py-6 min-h-screen flex items-center justify-center">
        <Card className="p-6 w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-center">Restaurant Access</h1>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button className="w-full" onClick={handleLogin}>
            Enter Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem("restaurant_auth");
            setIsAuthorized(false);
          }}
        >
          Logout
        </Button>
      </div>
      <RestaurantDashboard />
    </div>
  );
}