import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRsvpByUserId } from "@/lib/db";
import { InvitationDetails } from "@/components/invitation-details";
import { RsvpForm } from "@/components/rsvp-form";

export default async function InvitationPage() {
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
        joined_wechat: rsvpData.joined_wechat || false,
      }
    : null;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 opacity-85">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gold mb-8">
            Layla & Kondwani Engagement Celebration
          </h1>

          {rsvp?.status === "attending" ? (
            <InvitationDetails user={session} rsvp={rsvp} />
          ) : (
            <RsvpForm user={session} existingRsvp={rsvp} />
          )}
        </div>
      </div>
    </div>
  );
}
