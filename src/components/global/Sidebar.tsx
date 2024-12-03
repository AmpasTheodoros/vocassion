'use client';
import Link from "next/link";
import { Kdam_Thmor_Pro, Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  BarChart,
  MessageCircle,
  Users,
  Target,
  Trophy,
  Map,
  UserRound,
} from "lucide-react";

const kdamThmorPro = Kdam_Thmor_Pro ({
  weight: "400",
  subsets: ["latin"]
});

const routes = [
  {
    label: "Dashboard",
    icon: BarChart,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Map",
    icon: Map,
    href: "/ikigai",
    color: "text-violet-500",
  },
  {
    label: "Objectives",
    icon: Target,
    href: "/goals",
    color: "text-pink-700",
  },
  {
    label: "Trials",
    icon: Trophy,
    href: "/challenges",
    color: "text-orange-700",
  },
  {
    label: "Guild Hub",
    icon: Users,
    href: "/community",
    color: "text-emerald-500",
  },
  {
    label: "Chat",
    icon: MessageCircle,
    href: "/chat",
    color: "text-green-700",
  },
  {
    label: "Character",
    icon: UserRound,
    href: "/profile",
    color: "text-blue-700",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  return ( 
      <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
          <div className="px-3 py-2 flex-1">
              <Link href="/dashboard" className="flex items-center pl- mb-14">
                  <div className="relative w-20 h-20 mr-4">
                      {/* <Image fill alt='Logo' src="/logo.png"/> */}
                  </div>
                  <h1 className={cn("text-2xl font-bold", kdamThmorPro.className)}>
                  Vocassion
                  </h1>
              </Link>
              <div className="space-y-1">
                  {routes.map((route) => (
                      <Link
                          href={route.href}
                          key={route.href}
                          className={cn("text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition", pathname === route.href ? "text-white bg-white/10" : "text-zinc-400")}
                      >
                          <div className="flex item-center flex-1">
                              <route.icon className={cn("h-5 w-5 mr-3", route.color)}/>
                              {route.label}
                          </div>
                      </Link>
                  ))}
              </div>
          </div>
      </div>
  );
}

export default Sidebar;