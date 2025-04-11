"use client";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

export default function Page() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-white">
      <Loading size="lg" />
      <div className="text-2xl font-bold">
        Error fetching data, reload the page
      </div>
      <Button
        className="bg-gold text-white"
        onClick={() => window.location.reload()}
      >
        Reload Page
      </Button>
    </div>
  );
}
