"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function UserFooter() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <footer className="p-2 bg-background/20 backdrop-blur-sm border-t border-border/40">
      <div className="container mx-auto flex justify-between items-center text-sm text-gold">
        <span>Welcome {user.name}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="h-8 px-2 text-gold hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </div>
    </footer>
  );
}
