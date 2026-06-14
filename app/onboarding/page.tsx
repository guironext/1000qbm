import OnboardingForm from "@/components/Onboarding";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  const user = await currentUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true, langue: true, country: true, phone: true },
  });

  if (existingUser) {
    if (!user.publicMetadata?.onboardingCompleted) {
      await (
        await clerkClient()
      ).users.updateUserMetadata(user.id, {
        publicMetadata: {
          onboardingCompleted: true,
          role: existingUser.role,
          langue: existingUser.langue ?? "FR",
          country: existingUser.country ?? undefined,
          phone: existingUser.phone ?? undefined,
        },
      });
    }

    const lang = (existingUser.langue ?? "FR").toLowerCase();
    if (existingUser.role === "ADMIN") redirect(`/${lang}/admin`);
    if (existingUser.role === "MANAGER") redirect(`/${lang}/manager`);
    redirect(`/${lang}/joueur`);
  }

  return (
    <>
      <div className="text-center -mt-6 mb-3">
        <h2 className="hidden sm:block text-2xl sm:text-4xl font-semibold text-gray-900 uppercase dark:text-gray-100">
          BIENVENUE sur 1000 Questions Bibliques pour Moi
        </h2>
        <h1 className="sm:hidden text-lg font-bold text-gray-900 dark:text-gray-100">
          1000 Questions Bibliques pour Moi !
        </h1>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center">
        <div className="flex items-center-safe space-x-10">
          <Image
            src="/logo.png"
            alt="KPANDJI logo"
            width={240}
            height={160}
            priority
            className="max-w-[60%] md:max-w-full"
          />

          <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold text-center text-orange-800">
              Completez votre profile
            </h1>
            <OnboardingForm
              userEmail={user.emailAddresses[0].emailAddress}
              firstName={user.firstName || ""}
              lastName={user.lastName || ""}
            />
          </div>
        </div>
      </div>
    </>
  );
}
