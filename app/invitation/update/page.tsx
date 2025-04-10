import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRsvpByUserId } from "@/lib/db";
import { RsvpForm } from "@/components/rsvp-form";

export default async function UpdateRsvpPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  if (session.isOrganizer) {
    redirect("/organizer");
  }

  const rsvpData = await getRsvpByUserId(session.id);

  // Transform the data to match expected type
  const rsvp = rsvpData
    ? {
        status: rsvpData.status || "pending",
        plus_one: rsvpData.plus_one || false,
        plus_one_name: rsvpData.plus_one_name || null,
      }
    : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gold mb-8">
            Update Your RSVP
          </h1>

          <RsvpForm
            user={session}
            existingRsvp={rsvp}
            redirectOnSuccess={true}
          />
        </div>
      </div>
    </div>
  );
}
