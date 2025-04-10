import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getRsvpByUserId } from "@/lib/db"
import { InvitationDetails } from "@/components/invitation-details"
import { RsvpForm } from "@/components/rsvp-form"

export default async function InvitationPage() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  if (session.isOrganizer) {
    redirect("/organizer")
  }

  const rsvp = await getRsvpByUserId(session.id)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gold mb-8">Layla & Kondwani Celebration</h1>

          {rsvp?.status === "attending" ? (
            <InvitationDetails user={session} rsvp={rsvp} />
          ) : (
            <RsvpForm user={session} existingRsvp={rsvp} />
          )}
        </div>
      </div>
    </div>
  )
}
