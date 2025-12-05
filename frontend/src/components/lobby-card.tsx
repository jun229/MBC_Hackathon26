"use client";

import { LobbyWithPlayers } from "@/lib/types";
import { ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import Link from "next/link";

interface LobbyCardProps {
  lobby: LobbyWithPlayers;
}

function VotingBar({ yes, no }: { yes: number; no: number }) {
  const total = yes + no || 1;
  const yesPercent = (yes / total) * 100;

  return (
    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
      <div className="flex items-center gap-1 text-emerald-500">
        <ThumbsUp className="w-3 h-3" /> {yes}
      </div>
      <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${yesPercent}%` }}
        />
        <div className="h-full bg-red-500/50 flex-1" />
      </div>
      <div className="flex items-center gap-1 text-red-500/50">
        {no} <ThumbsDown className="w-3 h-3" />
      </div>
    </div>
  );
}

export function LobbyCard({ lobby }: LobbyCardProps) {
  const hoursRemaining = Math.max(
    0,
    Math.floor((lobby.deadline.getTime() - Date.now()) / (1000 * 60 * 60))
  );

  const progressPercent = (lobby.players.length / lobby.totalMembers) * 100;

  return (
    <Link href={`/lobby/${lobby.id}`}>
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-5 group hover:border-orange-500/50 transition-colors cursor-pointer relative overflow-hidden">
        {/* Header Row: Theme & Buy In */}
        <div className="flex justify-between items-center mb-4">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
            {lobby.theme}
          </span>

          {/* Buy In Display */}
          <div className="flex items-center gap-2 bg-zinc-800/50 px-2 py-1 rounded-lg border border-zinc-700/50">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">
              Buy In
            </span>
            <span className="text-white font-bold text-sm">
              ${lobby.entryFee}
            </span>
          </div>
        </div>

        {/* Title & Pool Row */}
        <div className="flex justify-between items-start mb-3">
          <div className="pr-4">
            <h4 className="font-bold text-white text-lg group-hover:text-orange-400 transition-colors leading-tight">
              {lobby.target}
            </h4>
            <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
              <Clock className="w-3 h-3" /> {hoursRemaining}h left
            </div>
          </div>
          <div className="text-right whitespace-nowrap">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">
              Pool
            </div>
            <div className="font-mono font-bold text-orange-400 text-lg">
              ${lobby.totalPot}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-orange-500 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Footer: Avatars & Voting */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex -space-x-2">
            {lobby.players.slice(0, 3).map((player) => (
              <div
                key={player.id}
                className="w-6 h-6 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[9px] font-bold"
                style={{ backgroundColor: player.avatarColor || "#3f3f46" }}
              >
                {player.name.charAt(0)}
              </div>
            ))}
            {lobby.totalMembers > 3 && (
              <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[9px] text-zinc-400">
                +{lobby.totalMembers - 3}
              </div>
            )}
          </div>
          <div className="scale-90 origin-right">
            <VotingBar yes={lobby.yesVotes} no={lobby.noVotes} />
          </div>
        </div>
      </div>
    </Link>
  );
}
