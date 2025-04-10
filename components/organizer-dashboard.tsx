"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Mail, Users, CheckCircle, XCircle, Clock } from "lucide-react"
import { AddGuestForm } from "@/components/add-guest-form"
import { GenerateInviteLink } from "@/components/generate-invite-link"

// Update the Guest type to include joined_wechat
type Guest = {
  id: number
  email: string
  name: string
  status: string | null
  plus_one: boolean
  plus_one_name: string | null
  updated_at: string
  joined_wechat?: boolean
}

type Stats = {
  total_guests: number
  attending: number
  not_attending: number
  pending: number
  plus_ones: number
}

type OrganizerDashboardProps = {
  guests: Guest[]
  stats: Stats
}

export function OrganizerDashboard({ guests, stats }: OrganizerDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [guestList, setGuestList] = useState<Guest[]>(guests)
  const { toast } = useToast()

  const filteredGuests = guestList.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingGuests = filteredGuests.filter((guest) => !guest.status || guest.status === "pending")
  const attendingGuests = filteredGuests.filter((guest) => guest.status === "attending")
  const notAttendingGuests = filteredGuests.filter((guest) => guest.status === "not_attending")

  async function sendInvite(guestId: number, email: string) {
    setIsLoading((prev) => ({ ...prev, [guestId]: true }))

    try {
      const response = await fetch("/api/organizer/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send invite")
      }

      toast({
        title: "Invite Sent",
        description: `Invitation sent to ${email}`,
      })
    } catch (error) {
      console.error("Send invite error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invite",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [guestId]: false }))
    }
  }

  async function sendAllInvites() {
    setIsLoading((prev) => ({ ...prev, all: true }))

    try {
      const response = await fetch("/api/organizer/send-all-invites", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send invites")
      }

      toast({
        title: "Invites Sent",
        description: "All invitations have been sent",
      })
    } catch (error) {
      console.error("Send all invites error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invites",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, all: false }))
    }
  }

  async function sendPendingInvites() {
    setIsLoading((prev) => ({ ...prev, pending: true }))

    try {
      const response = await fetch("/api/organizer/send-pending-invites", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send invites")
      }

      toast({
        title: "Invites Sent",
        description: "Invitations sent to all pending guests",
      })
    } catch (error) {
      console.error("Send pending invites error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invites",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, pending: false }))
    }
  }

  function getStatusIcon(status: string | null) {
    if (status === "attending") {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (status === "not_attending") {
      return <XCircle className="h-5 w-5 text-red-500" />
    } else {
      return <Clock className="h-5 w-5 text-amber-500" />
    }
  }

  function getStatusBadge(status: string | null) {
    if (status === "attending") {
      return <Badge className="bg-green-500">Attending</Badge>
    } else if (status === "not_attending") {
      return <Badge variant="destructive">Not Attending</Badge>
    } else {
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500">
          Pending
        </Badge>
      )
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Handle guest added event
  const handleGuestAdded = async () => {
    try {
      const response = await fetch("/api/organizer/guests")
      if (response.ok) {
        const data = await response.json()
        setGuestList(data.guests)
      }
    } catch (error) {
      console.error("Failed to refresh guest list:", error)
    }
  }

  // Update the renderGuestTable function to include WeChat status and generate link button
  function renderGuestTable(guestList: Guest[]) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Plus One</TableHead>
            <TableHead>WeChat</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guestList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No guests found
              </TableCell>
            </TableRow>
          ) : (
            guestList.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell className="font-medium">{guest.name}</TableCell>
                <TableCell>{guest.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(guest.status)}
                    {getStatusBadge(guest.status)}
                  </div>
                </TableCell>
                <TableCell>
                  {guest.plus_one ? (
                    <div>
                      <Badge className="bg-gold">Yes</Badge>
                      {guest.plus_one_name && <div className="text-sm text-gray-500 mt-1">{guest.plus_one_name}</div>}
                    </div>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {guest.joined_wechat ? (
                    <Badge className="bg-green-500">Joined</Badge>
                  ) : (
                    <Badge variant="outline">Not Joined</Badge>
                  )}
                </TableCell>
                <TableCell>{guest.updated_at ? formatDate(guest.updated_at) : "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendInvite(guest.id, guest.email)}
                      disabled={isLoading[guest.id.toString()]}
                    >
                      {isLoading[guest.id.toString()] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-1" />
                      )}
                      Email
                    </Button>
                    <GenerateInviteLink guestId={guest.id} guestName={guest.name} guestEmail={guest.email} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredGuests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attending</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendingGuests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Attending</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notAttendingGuests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingGuests.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <AddGuestForm onGuestAdded={handleGuestAdded} />
            <Button onClick={sendAllInvites} disabled={isLoading.all} className="bg-black hover:bg-black/90">
              {isLoading.all ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Send All Invites
            </Button>
            <Button onClick={sendPendingInvites} disabled={isLoading.pending} variant="outline">
              {isLoading.pending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send to Pending
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Guests ({filteredGuests.length})</TabsTrigger>
            <TabsTrigger value="attending">Attending ({attendingGuests.length})</TabsTrigger>
            <TabsTrigger value="not-attending">Not Attending ({notAttendingGuests.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingGuests.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="border rounded-md mt-4">
            {renderGuestTable(filteredGuests)}
          </TabsContent>
          <TabsContent value="attending" className="border rounded-md mt-4">
            {renderGuestTable(attendingGuests)}
          </TabsContent>
          <TabsContent value="not-attending" className="border rounded-md mt-4">
            {renderGuestTable(notAttendingGuests)}
          </TabsContent>
          <TabsContent value="pending" className="border rounded-md mt-4">
            {renderGuestTable(pendingGuests)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
