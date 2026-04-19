"use client";

import Image from "next/image";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start space-y-8">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {session ? `Welcome back, ${session.user.name}` : "Welcome to Syokuhi Next"}
          </h1>

          <div className="w-full max-w-xs">
            {isPending ? (
              <p>Loading session...</p>
            ) : session ? (
              <div className="flex flex-col gap-4">
                <p className="text-zinc-600 dark:text-zinc-400">
                  You are signed in as {session.user.email}
                </p>
                <Button variant="destructive" onClick={() => authClient.signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <GoogleSignInButton />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row pt-8">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Deploy Now
          </a>
        </div>
      </main>
    </div>
  );
}
