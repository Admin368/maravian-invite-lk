import { RestaurantDashboard } from "@/components/restaurant-dashboard";
import { getSession, type Session } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OrdersPage() {
  const session = await getSession() as Session;
  
  if (!session?.isOrganizer) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Order Management</h1>
          <Button asChild>
            <Link href="/menu">Back to Menu Management</Link>
          </Button>
        </div>
        <RestaurantDashboard />
      </div>
    </div>
  );
}