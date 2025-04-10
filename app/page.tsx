import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function Home() {
  const session = await getSession();

  if (session) {
    if (session.isOrganizer) {
      redirect("/organizer");
    } else {
      redirect("/invitation");
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 w-full max-w-md p-6 bg-white/80 dark:bg-black/80 rounded-lg shadow-xl border border-gold/20">
        <h1 className="text-3xl font-bold text-center text-gold mb-6">
          Layla & Kondwani Engagement Celebration
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
