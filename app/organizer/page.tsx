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

  const guestsData = await getAllGuests();
  // const statsData = await getGuestStats();

  // Transform guests data to match expected type
  const guests = guestsData.map((guest) => ({
    id: guest.id,
    email: guest.email,
    name: guest.name,
    wechat_id: guest.wechat_id,
    status: guest.status || "pending",
    plus_one: guest.plus_one || false,
    plus_one_name: guest.plus_one_name || null,
    joined_wechat: guest.joined_wechat || false,
    updated_at: guest.updated_at || new Date().toISOString(),
    email_sent: guest.email_sent || false,
  }));

  // Transform stats data to match expected type
  // const stats = {
  //   total_guests: statsData.total_guests || 0,
  //   attending: statsData.attending || 0,
  //   not_attending: statsData.not_attending || 0,
  //   pending: statsData.pending || 0,
  //   plus_ones: statsData.plus_ones || 0,
  // };

  return (
    <div className="min-h-screen bg-gray-50 bg-opacity">
      <div className=" px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Organizer Dashboard
        </h1>

        <OrganizerDashboard
          guests={guests}
          // stats={stats}
        />
      </div>
    </div>
  );
}
