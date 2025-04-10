"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type WeChat = {
  userId: number
  joinedWeChat: boolean
}

export function WeChatGroupModal({ userId, joinedWeChat, onJoined }: WeChat & { onJoined: () => void }) {
  const [isOpen, setIsOpen] = useState(!joinedWeChat)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const qrCodeUrl = process.env.NEXT_PUBLIC_WECHAT_QR_CODE || "/placeholder.svg?height=300&width=300"

  async function handleJoinGroup() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/wechat/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Something went wrong")
      }

      toast({
        title: "Thank you!",
        description: "We've recorded that you've joined the WeChat group.",
      })

      setIsOpen(false)
      onJoined()
    } catch (error) {
      console.error("Join WeChat group error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update your status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Button to reopen the modal if closed */}
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} variant="outline" className="mt-4">
          View WeChat Group QR Code
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Our WeChat Group</DialogTitle>
            <DialogDescription>
              Please scan this QR code to join our WeChat group for important updates and coordination.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <div className="relative w-64 h-64 border rounded-md overflow-hidden">
              <Image src={qrCodeUrl || "/placeholder.svg"} alt="WeChat Group QR Code" fill className="object-contain" />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="sm:w-auto w-full order-2 sm:order-1"
            >
              I'll Join Later
            </Button>
            <Button
              type="button"
              onClick={handleJoinGroup}
              disabled={isLoading}
              className="sm:w-auto w-full order-1 sm:order-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "I've Joined the Group"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
