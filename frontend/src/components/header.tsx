"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = "User" }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "History", href: "/history" },
  ];

  return (
    <header className="flex justify-between items-center mb-12 pb-6 border-b border-[#333]">
      <div className="flex items-center gap-5">
        <Avatar className="h-14 w-14 bg-gradient-to-br from-[#ff6b35] to-[#ff8555]">
          <AvatarFallback className="bg-transparent text-white text-xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-[#a0a0a0] uppercase tracking-wider">Hey,</p>
          <h1 className="text-2xl font-bold">{userName}</h1>
        </div>
      </div>

      <nav className="flex gap-3 items-center">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="outline"
              className={cn(
                "px-8 py-2 rounded-lg transition-all duration-300",
                "border-[#333] text-[#a0a0a0] hover:border-[#ff6b35] hover:text-white",
                pathname === item.href && "bg-[#ff6b35] border-[#ff6b35] text-[#0a0a0a] hover:bg-[#ff8555] hover:text-[#0a0a0a]"
              )}
            >
              {item.label}
            </Button>
          </Link>
        ))}
        <WalletButton />
      </nav>
    </header>
  );
}
