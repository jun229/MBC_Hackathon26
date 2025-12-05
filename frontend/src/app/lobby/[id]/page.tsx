"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/image-upload";
import { mockLobbies } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function LobbyPage() {
  const params = useParams();
  const id = params.id as string;
  const lobby = mockLobbies.find((l) => l.id === id) || mockLobbies[0];
  const [hasJoined, setHasJoined] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  const hoursRemaining = Math.max(0, Math.floor((lobby.deadline.getTime() - Date.now()) / (1000 * 60 * 60)));

  const handleJoin = () => {
    // In real app, this would call the smart contract
    setHasJoined(true);
    toast({
      title: "Joined Lobby!",
      description: `You've deposited $${lobby.entryFee} USDC`,
    });
  };

  const handleVerified = (result: { verified: boolean; reason: string }) => {
    if (result.verified) {
      setIsVerified(true);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-10 py-10">
      <Header userName="User" />

      <div className="max-w-4xl mx-auto">
        {/* Lobby Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{lobby.icon}</div>
          <h1 className="text-4xl font-bold mb-4">{lobby.name}</h1>
          <p className="text-xl text-[#a0a0a0] mb-6">
            {lobby.verifiedCount}/{lobby.totalMembers} will {lobby.taskDescription.toLowerCase()}
          </p>
          <div className="flex justify-center gap-2">
            {progressCircles}
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Stats Card */}
          <Card className="bg-[#252525] p-8 rounded-2xl border-[#333]">
            <h3 className="text-lg font-bold mb-6 text-[#a0a0a0] uppercase tracking-wider">
              Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1a1a1a] p-6 rounded-xl text-center">
                <div className="font-mono-display text-3xl font-bold text-[#4ade80]">
                  ${lobby.totalPot}
                </div>
                <div className="text-sm text-[#a0a0a0] mt-1">Total Pot</div>
              </div>
              <div className="bg-[#1a1a1a] p-6 rounded-xl text-center">
                <div className="font-mono-display text-3xl font-bold text-white">
                  {hoursRemaining}h
                </div>
                <div className="text-sm text-[#a0a0a0] mt-1">Time Left</div>
              </div>
              <div className="bg-[#1a1a1a] p-6 rounded-xl text-center">
                <div className="font-mono-display text-3xl font-bold text-[#ff6b35]">
                  ${lobby.entryFee}
                </div>
                <div className="text-sm text-[#a0a0a0] mt-1">Entry Fee</div>
              </div>
              <div className="bg-[#1a1a1a] p-6 rounded-xl text-center">
                <div className="font-mono-display text-3xl font-bold text-white">
                  {lobby.verifiedCount}/{lobby.totalMembers}
                </div>
                <div className="text-sm text-[#a0a0a0] mt-1">Verified</div>
              </div>
            </div>
          </Card>

          {/* Members Card */}
          <Card className="bg-[#252525] p-8 rounded-2xl border-[#333]">
            <h3 className="text-lg font-bold mb-6 text-[#a0a0a0] uppercase tracking-wider">
              Members
            </h3>
            <div className="space-y-3">
              {lobby.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl"
                >
                  <Avatar className="h-9 w-9" style={{ backgroundColor: player.avatarColor }}>
                    <AvatarFallback className="bg-transparent text-white text-sm font-bold">
                      {player.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1">{player.name}</span>
                  {player.isVerified && (
                    <span className="text-[#4ade80] text-sm">✓ Verified</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Join or Verify Section */}
        {!hasJoined ? (
          <Card className="bg-[#252525] p-8 rounded-2xl border-[#333] text-center">
            <h3 className="text-xl font-bold mb-4">Join this Lobby</h3>
            <p className="text-[#a0a0a0] mb-6">
              Stake ${lobby.entryFee} USDC to participate. Complete the task and get verified to win!
            </p>
            <Button
              onClick={handleJoin}
              className="bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] px-8 py-6 text-lg"
            >
              Join for ${lobby.entryFee} USDC
            </Button>
          </Card>
        ) : isVerified ? (
          <Card className="bg-[#252525] p-8 rounded-2xl border-[#333] text-center border-[#4ade80]">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2 text-[#4ade80]">You're Verified!</h3>
            <p className="text-[#a0a0a0]">
              Wait for the market to resolve to claim your winnings.
            </p>
          </Card>
        ) : (
          <ImageUpload
            taskDescription={lobby.taskDescription}
            onVerified={handleVerified}
          />
        )}

        {/* Charity Info */}
        <Card className="bg-[#1a1a1a] p-6 rounded-2xl border-[#333] mt-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💝</span>
            <div>
              <p className="text-sm text-[#a0a0a0]">50% of forfeited stakes go to charity</p>
              <p className="text-xs text-[#666]">Charity: {lobby.charityWallet}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
