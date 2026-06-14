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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Search,
  X,
  Trophy,
  Star,
  Target,
  Heart,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getHeaderData } from "@/lib/actions/boardActions";
import { cn } from "@/lib/utils";

interface Palmares {
  id: string;
  score: number;
  jeuValide: boolean;
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

const DON_URL = "https://vente.paiementpro.net/dons-1000-qbm/5234";

const HeaderJeu = () => {
  const { user } = useUser();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentGame, setCurrentGame] = useState<CurrentGame | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserData(null);
        setCurrentGame(null);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getHeaderData();
        if (data) {
          setUserData(data.user as unknown as UserData);
          setCurrentGame(data.currentPalmares as unknown as CurrentGame);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const totalScore =
    userData?.palmares?.reduce(
      (sum: number, palmares: Palmares) => sum + palmares.score,
      0,
    ) || 0;
  const completedGames =
    userData?.palmares?.filter((p: Palmares) => p.jeuValide).length || 0;
  const currentScore = currentGame?.score || 0;

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Joueur";
  const email = user?.emailAddresses?.[0]?.emailAddress;

  const StatsPanel = () => (
    <div className="space-y-4 p-1">
      {currentGame && (
        <div className="space-y-2 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-900">
              Jeu en cours
            </span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="min-w-0 text-xs leading-relaxed text-gray-600">
              {currentGame.jeu?.stage?.title}
              {currentGame.jeu?.section?.title
                ? ` — ${currentGame.jeu.section.title}`
                : ""}
            </span>
            <Badge
              variant="secondary"
              className="shrink-0 bg-amber-100 text-amber-800"
            >
              {currentScore} pts
            </Badge>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-gray-900">Palmarès</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-amber-100 bg-white/80 p-3 text-center">
            <div className="text-xl font-bold tabular-nums text-amber-600">
              {isLoading ? "—" : totalScore}
            </div>
            <div className="text-xs text-gray-500">Score total</div>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white/80 p-3 text-center">
            <div className="text-xl font-bold tabular-nums text-emerald-600">
              {isLoading ? "—" : completedGames}
            </div>
            <div className="text-xs text-gray-500">Jeux terminés</div>
          </div>
        </div>

        {userData?.palmares && userData.palmares.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Récents
            </p>
            {userData.palmares.slice(0, 3).map((palmares: Palmares) => (
              <div
                key={palmares.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-gray-50/80 px-2.5 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Star className="h-3 w-3 shrink-0 text-amber-500" />
                  <span className="truncate text-xs text-gray-700">
                    {palmares.jeu?.stage?.title ?? "Stage"}
                  </span>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {palmares.score} pts
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <p className="rounded-lg bg-gray-50/80 px-3 py-2 text-center text-xs text-gray-500">
              Aucun palmarès pour le moment
            </p>
          )
        )}
      </div>
    </div>
  );

  return (
    <header className="relative w-full">
      <div className="flex items-center gap-2 rounded-2xl border border-amber-200/60 bg-white/75 px-2.5 py-2 shadow-sm ring-1 ring-black/5 backdrop-blur-md sm:gap-4 sm:px-4 sm:py-3">
        {/* Logo */}
        <div className="shrink-0 rounded-full bg-white p-1.5 shadow-md ring-1 ring-amber-100 sm:p-3">
          <Image
            src="/logo.png"
            alt="KPANDJI logo"
            width={48}
            height={48}
            priority
            className="h-9 w-9 dark:invert sm:h-12 sm:w-12"
          />
        </div>

        {/* Desktop search */}
        <div
          className={cn(
            "absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-amber-100 bg-white/90 shadow-sm transition-all duration-300 sm:flex",
            isSearchFocused ? "w-80 px-4 py-2.5 ring-2 ring-amber-300/50" : "w-56 px-3 py-2",
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-amber-600/70" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="rounded-full p-0.5 text-gray-400 transition hover:text-gray-600"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Spacer for centered search on desktop */}
        <div className="hidden flex-1 sm:block" />

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={() => window.open(DON_URL, "_blank")}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-2.5 py-2 text-xs font-semibold text-white shadow-md transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 sm:gap-2 sm:px-3.5 sm:py-2"
          >
            <Heart className="h-3.5 w-3.5 shrink-0 fill-current" />
            <span>Faire un don</span>
          </button>

          <SignedIn>
            {/* Quick score pill — tablet+ */}
            {!isLoading && totalScore > 0 && (
              <div className="hidden items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-1.5 text-xs font-semibold text-amber-800 md:flex">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="tabular-nums">{totalScore}</span>
              </div>
            )}

            {/* Stats dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full border border-amber-100 bg-white/80 p-2 text-amber-700 shadow-sm transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                  aria-label="Voir le palmarès"
                >
                  <Trophy className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-[calc(100vw-2rem)] max-w-80 border-amber-100 bg-white/95 p-3 shadow-xl backdrop-blur-sm"
              >
                <StatsPanel />
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User info — hidden on small screens */}
            <div className="hidden min-w-0 text-right lg:block">
              <div className="truncate text-sm font-semibold text-gray-800">
                {displayName}
              </div>
              {email && (
                <div className="truncate text-xs text-gray-500">{email}</div>
              )}
            </div>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-amber-100",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-amber-200 bg-white/80 text-amber-900 hover:bg-amber-50"
            >
              <SignInButton mode="modal" />
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

export default HeaderJeu;
