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
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isNoEmail = guestEmail.endsWith("@no_email.com");

  async function generateLink() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/organizer/generate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setInviteLink(data.inviteLink);
    } catch (error) {
      console.error("Generate link error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate link"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (inviteLink) {
      copy(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            {isNoEmail
              ? "Generate a direct invitation link that you can share manually with the guest."
              : "Generate a direct invitation link that you can share manually with the guest."}
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
              <Button size="icon" onClick={copyToClipboard}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
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
