import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllGuests, getGuestStats } from "@/lib/db";
import { OrganizerDashboard } from "@/components/organizer-dashboard";

export default async function OrganizerPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  if (!session.isOrganizer) {
    redirect("/invitation");
  }

  const guests = await getAllGuests();
  const stats = await getGuestStats();

  return (
    <div className="min-h-screen bg-gray-50 bg-opacity">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Organizer Dashboard
        </h1>

        <OrganizerDashboard guests={guests} stats={stats} />
      </div>
    </div>
  );
}
