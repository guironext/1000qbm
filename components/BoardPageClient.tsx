"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { commenceGame } from "@/lib/actions/boardActions";

interface Stage {
  id: string;
  title: string;
  image: string;
  niveau: string;
  descriptions: { id: string; texte: string }[];
}

interface BoardPageProps {
  stage: Stage;
}

const BoardPageClient = ({ stage }: BoardPageProps) => {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* Image (left) + Description (right) */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 flex-1">
          {/* Left - Image */}
          <div className="w-full lg:w-1/2">
            <div className="relative w-full aspect-[4/3] lg:aspect-square rounded-lg overflow-hidden shadow-lg">
              <Image
                src={stage.image}
                alt={stage.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right - Description */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {stage.title}
            </h2>
            <div className="space-y-4">
              {stage.descriptions.map((d) => (
                <p
                  key={d.id}
                  className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
                >
                  {d.texte}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom - Button */}
        <div className="flex justify-center pt-8 pb-4">
          <form action={commenceGame}>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg text-xl transition-colors shadow-lg hover:shadow-xl"
            >
              Commençons
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BoardPageClient;
