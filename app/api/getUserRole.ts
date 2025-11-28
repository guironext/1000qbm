"use server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export async function getUserRole() {
  const user = await currentUser()
  if (!user) return null

  // Find the user in Prisma DB by Clerk ID
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true },
  })

  return dbUser?.role || null
}
