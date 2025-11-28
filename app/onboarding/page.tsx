import OnboardingForm from '@/components/Onboarding';
import { currentUser } from '@clerk/nextjs/server';
import Image from 'next/image';
import React from 'react'

const page = async () => {

  const user = await currentUser();

    if (!user) {
        return <div>Loading...</div>
    }
    
  
  return (
      <>
      <div className="text-center -mt-6 mb-3">
        {/* Desktop heading */}
        <h2 className="hidden sm:block text-2xl sm:text-4xl font-semibold text-gray-900 uppercase dark:text-gray-100">
          BIENVENUE sur 1000 Questions Bibliques pour Moi
        </h2>

        {/* Mobile heading */}
        <h1 className="sm:hidden text-lg font-bold text-gray-900 dark:text-gray-100">
          1000 Questions Bibliques pour Moi !
        </h1>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center">
        {/* Big logo */}
        <div className="flex items-center-safe space-x-10">
          <Image
            src="/logo.png"
            alt="KPANDJI logo"
            width={240}
            height={160}
            priority
            className="max-w-[60%] md:max-w-full"
          />

          {/* Form */}
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
  )
}

export default page
