"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Loader2, Copy, LinkIcon, Check } from "lucide-react";
import copy from "copy-to-clipboard";

type GenerateInviteLinkProps = {
  guestId: number;
  guestName: string;
  guestEmail: string;
};

export function GenerateInviteLink({
  guestId,
  guestName,
  guestEmail,
}: GenerateInviteLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  async function generateLink() {
    setIsLoading(true);
    setCopied(false);

    try {
      const response = await fetch("/api/organizer/generate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, guestEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate invitation link");
      }

      const data = await response.json();
      setInviteLink(data.inviteLink);
    } catch (error) {
      console.error("Generate link error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate invitation link"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function copyToClipboard({ _inviteLink }: { _inviteLink: string }) {
    try {
      // Try the modern Clipboard API first
      // if (navigator.clipboard && window.isSecureContext) {
      //   alert("Copying to clipboard");
      //   await navigator.clipboard.writeText(_inviteLink);
      // } else {
      //   // Fallback for older browsers or non-secure contexts
      //   const textArea = document.createElement("textarea");
      //   textArea.value = inviteLink;
      //   textArea.style.position = "fixed";
      //   textArea.style.left = "-999999px";
      //   textArea.style.top = "-999999px";
      //   document.body.appendChild(textArea);
      //   textArea.focus();
      //   textArea.select();

      //   const successful = document.execCommand("copy");
      //   if (!successful) {
      //     throw new Error("Failed to copy text");
      //   }

      //   document.body.removeChild(textArea);
      // }
      if (!_inviteLink) {
        throw new Error("No invite link provided");
      }
      copy(_inviteLink);
      setCopied(true);
      toast.success("Invitation link copied to clipboard");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy to clipboard");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <LinkIcon className="h-4 w-4 mr-1" />
          Get Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitation Link for {guestName}</DialogTitle>
          <DialogDescription>
            Generate a direct invitation link that you can share manually with
            the guest.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!inviteLink && (
            <Button
              onClick={generateLink}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Generate Invitation Link
                </>
              )}
            </Button>
          )}

          {inviteLink && (
            <div className="flex items-center space-x-2">
              <Input
                id="invitelink"
                value={inviteLink}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={() => copyToClipboard({ _inviteLink: inviteLink })}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
