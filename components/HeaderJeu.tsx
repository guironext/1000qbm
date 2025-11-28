"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Search, X, Trophy, Star, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { getUserData, getCurrentGameProgress } from "@/lib/actions/getUserData";

// Add these type definitions
interface Palmares {
  id: string;
  score: number;
  isFinished: boolean;
  jeu?: {
    stage?: { title: string } | null;
    section?: { title: string } | null;
  } | null;
}

interface UserData {
  palmares: Palmares[];
}

interface CurrentGame {
  score: number;
  jeu?: {
    stage?: { title: string } | null;
    section?: { title: string } | null;
  } | null;
}

const HeaderJeu = () => {
  const { user } = useUser();
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentGame, setCurrentGame] = useState<CurrentGame | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const [userInfo, currentGameInfo] = await Promise.all([
            getUserData(),
            getCurrentGameProgress(),
          ]);
          setUserData(userInfo as UserData | null);
          setCurrentGame(currentGameInfo as CurrentGame | null);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const totalScore =
    userData?.palmares?.reduce(
      (sum: number, palmares: Palmares) => sum + palmares.score,
      0
    ) || 0;
  const completedGames =
    userData?.palmares?.filter((p: Palmares) => p.isFinished).length || 0;
  const currentScore = currentGame?.score || 0;

  return (
    <div className="flex items-center justify-between w-full relative px-4 py-2">
      {/* Logo */}
      <div className="bg-white rounded-full p-2 sm:p-4 shadow-lg z-10">
        <Image
          className="dark:invert"
          src="/logo.png"
          alt="KPANDJI logo"
          width={60}
          height={60}
          priority
        />
      </div>

      {/* Search (desktop centered, mobile overlay) */}
      <div
        className={`
          ${
            isFocused
              ? "fixed top-0 left-0 w-full px-4 py-3 bg-white z-50 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-auto sm:w-96"
              : "absolute left-1/2 -translate-x-1/2 w-40 sm:w-64"
          }
          hidden sm:flex items-center gap-2 bg-gray-100 rounded-full shadow-sm transition-all duration-300
        `}
      >
        <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="bg-transparent outline-none w-full text-sm text-gray-700"
          onFocus={() => setIsFocused(true)}
        />
        {isFocused && (
          <button
            onClick={() => {
              setIsFocused(false);
              setSearchValue("");
            }}
            className="sm:hidden"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Right Side (User Info & Stats) */}
      <div className="flex items-center gap-3 z-10">
        <button className="group relative inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium text-xs shadow-lg hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="hidden lg:inline">Faire un don maintenant</span>
          <span className="lg:hidden">Don</span>
        </button>

        <SignedIn>
          <div className="flex items-center gap-4">
            {/* User Stats Toggle */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-md"
            >
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">{totalScore}</span>
            </button>

            {/* User Info */}
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-700">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-500">
                {user?.emailAddresses?.[0]?.emailAddress}
              </div>
            </div>

            <UserButton />
          </div>

          {/* Stats Dropdown */}
          {showStats && (
            <Card className="absolute top-16 right-4 w-80 z-50 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                {/* Current Game Progress */}
                {currentGame && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold">
                        Jeu en cours
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        {currentGame.jeu?.stage?.title} -{" "}
                        {currentGame.jeu?.section?.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800"
                      >
                        {currentScore} pts
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Overall Stats */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold">Palmarès</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-amber-600">
                        {totalScore}
                      </div>
                      <div className="text-xs text-gray-600">Score Total</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {completedGames}
                      </div>
                      <div className="text-xs text-gray-600">Jeux Terminés</div>
                    </div>
                  </div>

                  {/* Recent Achievements */}
                  {userData?.palmares
                    ?.slice(0, 3)
                    .map((palmares: Palmares, index: number) => (
                      <div
                        key={palmares.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-gray-700">
                            {palmares.jeu?.stage?.title}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {palmares.score} pts
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </SignedIn>

        <SignedOut>
          <Button asChild variant="outline">
            <SignInButton mode="modal" />
          </Button>
        </SignedOut>
      </div>
    </div>
  );
};

export default HeaderJeu;
