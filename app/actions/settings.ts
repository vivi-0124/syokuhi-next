"use server";

import { db } from "@/db";
import { user } from "@/db/schemas/auth-schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateBudget(newBudget: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  await db
    .update(user)
    .set({ budget: newBudget, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}
