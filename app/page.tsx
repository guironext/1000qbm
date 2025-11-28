import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* Title */}
      <div className="text-center mb-4">
        {/* Desktop heading */}
        <h1 className="hidden sm:block text-2xl sm:text-4xl font-semibold text-gray-900 uppercase dark:text-gray-100">
          BIENVENUE sur 1000 Questions Bibliques pour Moi
        </h1>

        {/* Mobile heading */}
        <h1 className="sm:hidden text-lg font-bold text-gray-900 dark:text-gray-100">
          1000 Questions Bibliques pour Moi !
        </h1>
      </div>

      {/* Main Section */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 sm:gap-12">
        {/* Text Section */}
        <div className="w-full sm:w-1/2 text-center flex flex-col items-center">
          <h2 className="hidden sm:block text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            1000 Questions Bibliques pour Moi !
          </h2>
          <p className="text-sm sm:text-lg text-black text-justify dark:text-gray-300 mt-2 sm:mt-4 max-w-xs sm:max-w-full">
            Plongez au cœur de la Bible à travers un défi unique, conçu pour
            tester vos connaissances, éveiller votre curiosité et approfondir
            votre foi. Que vous soyez débutant ou connaisseur, chaque question
            est une occasion de (re)découvrir les histoires, les personnages, et
            les enseignements qui ont marqué l&apos;Histoire. Seul, en famille ou
            entre amis, relevez le défi et voyez jusqu&apos;où vos réponses vous
            mèneront.
          </p>
          <div className="flex justify-between gap-x-3 items-center mt-4 w-full">
            <p className="font-semibold text-sm sm:text-base">
              📖 Êtes-vous prêt à mettre votre savoir biblique à l&apos;épreuve ?
            </p>
            <div className="cursor-pointer flex items-center justify-center">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <Button asChild variant="outline">
                  <SignInButton mode="modal" />
                </Button>
              </SignedOut>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full sm:w-1/2 flex justify-center">
          <Image
            className="dark:invert rounded-2xl w-full max-w-xs sm:max-w-md"
            src="/accueil.jpg"
            alt="accueil"
            width={600}
            height={600}
            priority
          />
        </div>
      </div>
    </div>
  );
}
