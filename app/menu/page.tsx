import { MenuManagement } from "@/components/menu-management";
import { MenuOrder } from "@/components/menu-order";
import { UserOrders } from "@/components/user-orders";
import { getSession, type Session } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function MenuPage() {
  const session = (await getSession()) as Session;

  if (!session) {
    redirect("/?redirect=/menu");
  }

  return (
    <div className="container mx-auto py-6 text-white min-h-screen">
      <Link href="/invitation" className="w-full">
        <Button variant="default" className="w-full my-2 bg-gold">
          Return to Invitation
        </Button>
      </Link>
      <div className="space-y-8">
        {session.isOrganizer ? (
          <>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Menu</h1>
              <Button asChild>
                <Link href="/menu/orders">View All Orders</Link>
              </Button>
            </div>
            <Tabs defaultValue="manage" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manage">Manage Menu</TabsTrigger>
                <TabsTrigger value="order">Place Order</TabsTrigger>
              </TabsList>
              <TabsContent value="manage">
                <MenuManagement />
              </TabsContent>
              <TabsContent value="order">
                <MenuOrder />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="orders">Your Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="menu">
              <MenuOrder />
            </TabsContent>
            <TabsContent value="orders">
              <UserOrders />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
