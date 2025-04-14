import { MenuManagement } from "@/components/menu-management";
import { MenuOrder } from "@/components/menu-order";
import { RestaurantDashboard } from "@/components/restaurant-dashboard";
import { getSession, type Session } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MenuPage() {
  const session = await getSession() as Session;
  
  if (!session) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-6">
      {session.isOrganizer ? (
        <div className="space-y-8">
          <MenuManagement />
          <RestaurantDashboard />
        </div>
      ) : (
        <MenuOrder />
      )}
    </div>
  );
}