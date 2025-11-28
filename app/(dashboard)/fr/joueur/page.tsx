"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";


export default function Home() {
  const router = useRouter();
  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center">
        {/* Image Section */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <Image
            className="rounded-2xl shadow-2xl w-full max-w-md lg:max-w-2xl"
            src="/accueil.jpg"
            alt="Jeu Biblique 1000 Questions"
            width={800}
            height={500}
            priority
          />
        </div>

        {/* Hero Section */}
        <section className="w-full lg:w-1/2 text-center lg:text-left space-y-6 lg:space-y-8">
          <div className="space-y-4">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              <div>
                1000 Questions
                </div>
                
              <div className="block text-amber-600 dark:text-amber-400">
                Bibliques pour Moi
              </div>

              <div className="flex  gap-2 justify-center items-center w-full text-4xl font-light bg-blue-200 px-3 py-2 rounded-full my-2.5">
              <p>Jouer,</p>
              <p>Apprendre</p> et 
              <p>Mémoriser</p>
              
            </div>

            </div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              Plongez au cœur de la Bible à travers un défi unique, conçu pour tester vos connaissances, 
              éveiller votre curiosité et approfondir votre foi.
            </p>
           
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
            <SignedIn>
              
                <Button 
                onClick={() => router.push("/fr/joueur/board")}
                size="lg" 
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                  <Play className="mr-2 h-5 w-5" />
                  Commencer à Jouer
                </Button>
              
            </SignedIn>
            <SignedOut>
              <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                <SignInButton mode="modal">
                  <Play className="mr-2 h-5 w-5" />
                  Commencer Gratuitement
                </SignInButton>
              </Button>
            </SignedOut>
          </div>
        </section>
      </div>
    </div>
  );
}