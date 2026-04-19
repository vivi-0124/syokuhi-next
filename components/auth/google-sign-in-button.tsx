"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/", // ログイン後のリダイレクト先
      });
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.153-1.859 4.104-1.191 1.191-3.056 2.411-5.981 2.411-4.707 0-8.522-3.815-8.522-8.522s3.815-8.522 8.522-8.522c2.541 0 4.43.996 5.8 2.304l2.304-2.304C18.667 1.63 15.935 0 12.48 0 5.86 0 .42 5.438.42 12.06c0 6.622 5.438 12.06 12.06 12.06 3.58 0 6.273-1.173 8.356-3.344 2.148-2.148 2.83-5.152 2.83-7.552 0-.719-.066-1.4-.188-2.04H12.48z"
          fill="currentColor"
        />
      </svg>
      {loading ? "Signing in..." : "Googleでログイン"}
    </Button>
  );
}
