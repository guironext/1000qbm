"use client"

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs"
import Image from "next/image"
import { Button } from "./ui/button"
import { Search, X } from "lucide-react"
import { useState } from "react"

const Header = () => {
  const { user } = useUser()
  const [isFocused, setIsFocused] = useState(false)
  const [searchValue, setSearchValue] = useState("")

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
          ${isFocused ? "fixed top-0 left-0 w-full px-4 py-3 bg-white z-50 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-auto sm:w-96" 
                      : "absolute left-1/2 -translate-x-1/2 w-40 sm:w-72"}
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
              setIsFocused(false)
              setSearchValue("")
            }}
            className="sm:hidden"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button>
          Faire un don maintenant
        </button>
      </div>

      {/* Right Side (User) */}
      <div className="flex items-center gap-3 z-10">
        <div className="text-lg font-semibold text-gray-700 flex ">
          Bienvenue
        </div>
        <SignedIn>
          <div className="text-lg font-semibold text-gray-700 flex  gap-x-1">
            <p>{user?.firstName || user?.username || "User"}</p>
            <p>{user?.lastName || user?.username || "User"}</p>
          </div>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <Button asChild variant="outline">
            <SignInButton mode="modal" />
          </Button>
        </SignedOut>
      </div>
    </div>
  )
}

export default Header
