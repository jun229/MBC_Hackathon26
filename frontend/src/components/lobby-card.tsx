"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LobbyWithPlayers } from "@/lib/types";
import Link from "next/link";

interface LobbyCardProps {
  lobby: LobbyWithPlayers;
}

export function LobbyCard({ lobby }: LobbyCardProps) {
  const progressCircles = Array.from({ length: lobby.totalMembers }, (_, i) => (
    <div
      key={i}
      className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
        i < lobby.verifiedCount
          ? "bg-[#ff6b35] border-[#ff6b35]"
          : "border-[#333]"
      }`}
    />
  ));

  const hoursRemaining = Math.max(0, Math.floor((lobby.deadline.getTime() - Date.now()) / (1000 * 60 * 60)));

  return (
    <Link href={`/lobby/${lobby.id}`}>
      <Card className="bg-[#252525] p-8 rounded-2xl border-[#333] transition-all duration-300 relative overflow-hidden group cursor-pointer hover:border-[#333]">
        {/* Top accent bar on hover */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff6b35] to-[#ff8555] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold leading-tight">
              {lobby.verifiedCount}/{lobby.totalMembers} will
              <br />
              {lobby.taskDescription.toLowerCase()}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-full border-2 border-[#333] flex items-center justify-center text-xl">
            {lobby.icon}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {progressCircles}
        </div>

        <div className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-xl">
          <div className="text-sm text-[#a0a0a0]">
            <span className="font-mono-display text-white">${lobby.totalPot}</span> pot
          </div>
          <div className="text-sm text-[#a0a0a0]">
            <span className="font-mono-display text-white">{hoursRemaining}h</span> left
          </div>
        </div>

        {lobby.status === 'active' && (
          <Badge variant="secondary" className="mt-4 bg-[#1a1a1a] text-[#a0a0a0] uppercase text-xs tracking-wider">
            Active
          </Badge>
        )}
      </Card>
    </Link>
  );
}
