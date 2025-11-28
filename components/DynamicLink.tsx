"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { getUserRole } from "@/app/api/getUserRole"

interface DynamicLinkProps {
  children: React.ReactNode
  className?: string
  fallbackHref?: string
}

export default function DynamicLink({ 
  children, 
  className, 
  fallbackHref = "/" 
}: DynamicLinkProps) {
  const { user, isLoaded } = useUser()
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      getUserRole().then((userRole) => {
        setRole(userRole)
        setIsLoading(false)
      })
    } else if (isLoaded && !user) {
      setIsLoading(false)
    }
  }, [isLoaded, user])

  const getRoleBasedHref = () => {
    if (!role) return fallbackHref
    
    switch (role) {
      case "ADMIN":
        return "/fr/admin"
      case "JOUEUR":
        return "/fr/joueur"
      case "MANAGER":
        return "/fr/manager"
      default:
        return fallbackHref
    }
  }

  if (isLoading) {
    return <div className={className}>{children}</div>
  }

  return (
    <Link href={getRoleBasedHref()} className={className}>
      {children}
    </Link>
  )
}
