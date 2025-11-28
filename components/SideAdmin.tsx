"use client";

import {
  ArrowBigDownDash,
  ContainerIcon,
  Home,
  StoreIcon,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: <Home className="w-5 h-5" />, label: "Dashboard", href: "/admin" },
  { icon: <ContainerIcon className="w-5 h-5" />, label: "Stages", href: "/admin/stages" },
  { icon: <ArrowBigDownDash className="w-5 h-5" />, label: "Sections", href: "/admin/sections" },
  { icon: <StoreIcon className="w-5 h-5" />, label: "Jeux", href: "/admin/jeux" },
  { icon: <StoreIcon className="w-5 h-5" />, label: "Joueurs", href: "/admin/joueurs" },
  { icon: <StoreIcon className="w-5 h-5" />, label: "Palmares", href: "/admin/palmares" },

];


const SideAdmin = ({ isOpen }: { isOpen: boolean }) => {

  const pathname = usePathname();

  // Responsive check — sidebar open only on medium screens and above
  const responsiveWidth = isOpen ? "w-50" : "w-50";

  return (
    <aside
      className={clsx(
        "h-full border-r-2 bg-transparent transition-all duration-500 ease-in-out overflow-y-auto ",
        responsiveWidth
      )}
    >
      <div className="flex flex-col p-4 space-y-4 h-full bg-transparent rounded-2xl">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                "flex items-center text-gray-900 duration-300 ease-in-out transform px-3 py-1 rounded-lg group",
                isOpen ? "justify-start gap-3" : "justify-center",
                isActive
                  ? "bg-amber-600 text-white font-bold shadow-md"
                  : "hover:bg-amber-500 hover:text-white"
              )}
              style={{
                transitionDelay: `${index * 80}ms`,
              }}
            >
              <div className="transition-transform group-hover:scale-110">{item.icon}</div>
              <span
                className={clsx(
                  "text-sm hidden md:flex font-medium transition-opacity duration-300",
                  isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  )
}

export default SideAdmin