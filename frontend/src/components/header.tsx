"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WalletButton } from "@/components/wallet-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = "Maka" }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "History", href: "/history" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800 p-4">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {/* Profile Section */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-gradient-to-tr from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
            <AvatarFallback className="bg-transparent text-white text-lg font-bold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium">Hey,</p>
            <h1 className="text-white font-bold text-lg leading-none">{userName}</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                    pathname === item.href
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </div>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
