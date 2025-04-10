"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, ClockIcon, TrainIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { WeChatGroupModal } from "@/components/wechat-group-modal";

// Update the InvitationDetailsProps type to include joined_wechat
type InvitationDetailsProps = {
  user: {
    id: number;
    name: string;
    email: string;
  };
  rsvp: {
    status: string;
    plus_one: boolean;
    plus_one_name: string | null;
    joined_wechat?: boolean;
  };
};

export function InvitationDetails({ user, rsvp }: InvitationDetailsProps) {
  const [joinedWeChat, setJoinedWeChat] = useState(rsvp.joined_wechat || false);

  return (
    <div className="space-y-8">
      <Card className="border-gold/20 opacity-85">
        <CardHeader className="text-center bg-gold/10 border-b border-gold/20">
          <CardTitle className="text-3xl font-serif">
            You're Cordially Invited
          </CardTitle>
          <CardDescription className="text-xl">
            to a Surprise Engagement Celebration
          </CardDescription>
          <div className="mt-4">
            <h3 className="text-lg">Honoring</h3>
            <h2 className="text-2xl font-bold text-gold">Layla & Kondwani</h2>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Date</h4>
                  <p>Wednesday, April 16th, 2025</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ClockIcon className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Time</h4>
                  <p>5:00 PM</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p>武珞路武商梦时代 A 区 2 楼 A211B 号</p>
                  <p>(Wushang Dream Plaza, A Section, 2nd Floor, 211B)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrainIcon className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Subway Stop</h4>
                  <p>Line 2 Baotong Temple</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-center">
            <p>
              With hearts full of joy and thanksgiving, we are excited to
              celebrate the love story of Layla and Emmanuel as they take this
              beautiful step toward forever.
            </p>
            <p className="font-medium">
              This will be a surprise for Layla, so we kindly ask all guests to
              arrive on time and keep the celebration a joyful secret until the
              special moment is revealed.
            </p>
            <p>
              Let us gather together in love, laughter, and blessings as we
              witness the beginning of a God-ordained union.
            </p>
            <p className="italic">
              "Therefore what God has joined together, let no one separate."
              Mark 10:9
            </p>
            <p>We would be honored by your presence.</p>
          </div>

          <div className="mt-8 p-4 bg-gold/10 rounded-lg text-center">
            <h3 className="font-medium mb-2">Color Theme</h3>
            <div className="flex justify-center gap-4 mb-2">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200"></div>
              <div className="w-8 h-8 rounded-full bg-black"></div>
              <div className="w-8 h-8 rounded-full bg-amber-500"></div>
            </div>
            <p className="text-sm">
              (Kindly dress in theme to honor the couple)
            </p>
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="text-center">
              <h3 className="font-medium mb-2">Your RSVP Status</h3>
              <p className="text-green-600 font-medium">
                You are attending
                {rsvp.plus_one && rsvp.plus_one_name
                  ? ` with ${rsvp.plus_one_name}`
                  : ""}
              </p>
              <div className="mt-4">
                <Link href="/invitation/update">
                  <Button>Update RSVP</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Add WeChat group section */}
        <div className="mt-8 border-t pt-6 pb-4">
          <div className="text-center">
            <h3 className="font-medium mb-2">WeChat Group</h3>
            <p>Join our WeChat group for important updates and coordination.</p>
            <div className="mt-4">
              <WeChatGroupModal
                userId={user.id}
                joinedWeChat={joinedWeChat}
                onJoined={() => setJoinedWeChat(true)}
              />
            </div>
            {joinedWeChat && (
              <p className="text-green-600 text-sm mt-2">
                ✓ You've joined the WeChat group
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
