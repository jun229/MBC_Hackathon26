"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { mockLobbies } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Heart, Camera, CheckCircle2, Loader2, Users } from "lucide-react";

function Badge({ children, color = "orange" }: { children: React.ReactNode; color?: "orange" | "zinc" }) {
  const colors = {
    orange: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    zinc: "bg-zinc-800 text-zinc-300",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const lobby = mockLobbies.find((l) => l.id === id) || mockLobbies[0];
  const [hasDeposited, setHasDeposited] = useState(false);
  const [verificationState, setVerificationState] = useState<
    "idle" | "uploading" | "analyzing" | "verified" | "failed"
  >("idle");
  const { toast } = useToast();

  const hoursRemaining = Math.max(
    0,
    Math.floor((lobby.deadline.getTime() - Date.now()) / (1000 * 60 * 60))
  );
  const minutesRemaining = Math.max(
    0,
    Math.floor(((lobby.deadline.getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60))
  );
  const secondsRemaining = Math.max(
    0,
    Math.floor(((lobby.deadline.getTime() - Date.now()) % (1000 * 60)) / 1000)
  );

  const verifiedCount = lobby.verifiedCount;
  const potentialVerified = verifiedCount + 1;
  const estimatedPayout = lobby.totalPot / potentialVerified || 0;

  const handleDeposit = () => {
    setHasDeposited(true);
    toast({
      title: "Deposit successful!",
      description: `You've committed $${lobby.entryFee} USDC`,
    });
  };

  const handleVerified = (result: { verified: boolean; reason: string }) => {
    if (result.verified) {
      setVerificationState("verified");
    } else {
      setVerificationState("failed");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-8">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <h2 className="font-bold text-lg text-white truncate">{lobby.name}</h2>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Main Task Display */}
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500/5 blur-3xl rounded-full" />
          <div className="relative bg-zinc-900/50 backdrop-blur-md border border-orange-500/30 rounded-2xl p-5 bg-gradient-to-b from-zinc-900 to-zinc-950">
            <div className="flex justify-between items-start mb-6">
              <Badge color="orange">Daily Challenge</Badge>
              <div className="text-right">
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">
                  Time Left
                </div>
                <div className="font-mono text-xl text-white font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500 animate-pulse" />
                  {String(hoursRemaining).padStart(2, "0")}:
                  {String(minutesRemaining).padStart(2, "0")}:
                  {String(secondsRemaining).padStart(2, "0")}
                </div>
              </div>
            </div>

            <div className="text-center py-6">
              <h3 className="text-2xl font-black text-white leading-tight mb-2">
                {lobby.taskDescription}
              </h3>
              <p className="text-zinc-400 text-sm">
                Verify by deadline to save your deposit.
              </p>
            </div>

            {/* Parimutuel Math Display */}
            <div className="bg-zinc-900/80 rounded-xl p-4 mt-4 border border-zinc-800/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400">Total Pot</span>
                <span className="font-mono text-white">${lobby.totalPot.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400">Current Survivors</span>
                <span className="font-mono text-white">
                  {verifiedCount} / {lobby.totalMembers}
                </span>
              </div>
              <div className="h-px bg-zinc-800 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-orange-400">Est. Payout</span>
                <span className="font-mono font-bold text-orange-400 text-lg">
                  ${estimatedPayout.toFixed(2)}
                </span>
              </div>
              <div className="text-[10px] text-zinc-600 mt-2 text-center flex items-center justify-center gap-1">
                <Heart className="w-3 h-3" />
                50% of forfeited funds go to {lobby.charityWallet}
              </div>
            </div>
          </div>
        </div>

        {/* Verification / Action Area */}
        <div className="pt-4">
          {!hasDeposited ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm px-1">
                <span className="text-zinc-400">Entry Fee</span>
                <span className="text-white font-bold">${lobby.entryFee} USDC</span>
              </div>
              <Button
                onClick={handleDeposit}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-6 text-base font-bold rounded-xl shadow-lg shadow-orange-500/20"
              >
                Commit ${lobby.entryFee} USDC
              </Button>
            </div>
          ) : verificationState === "verified" ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-5 h-5" /> Verified Successfully
              </div>
              <p className="text-center text-zinc-400 text-sm mt-2">
                Wait for the market to resolve to claim your winnings.
              </p>
            </div>
          ) : verificationState === "idle" ? (
            <ImageUpload
              taskDescription={lobby.taskDescription}
              onVerified={handleVerified}
            />
          ) : (
            <div className="bg-orange-950/10 border border-orange-500/20 rounded-2xl p-5">
              <div className="text-center">
                <h3 className="font-bold text-orange-400 mb-4">Task Active</h3>
                {verificationState === "uploading" && (
                  <div className="flex items-center justify-center gap-2 text-orange-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </div>
                )}
                {verificationState === "analyzing" && (
                  <div className="flex items-center justify-center gap-2 text-orange-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                  </div>
                )}
                {verificationState === "failed" && (
                  <div className="space-y-3">
                    <p className="text-red-400 text-sm">Verification failed. Try again.</p>
                    <Button
                      onClick={() => setVerificationState("idle")}
                      variant="outline"
                      className="border-orange-500/30 text-orange-400"
                    >
                      <Camera className="w-4 h-4" /> Upload Again
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Members List */}
        <div>
          <h4 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Participants
          </h4>
          <div className="space-y-2">
            {lobby.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: player.avatarColor || "#3f3f46" }}
                >
                  {player.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm text-zinc-300 flex-1">{player.name}</span>
                {player.isVerified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <span className="text-xs text-zinc-600">Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Terminate Button */}
        <button className="w-full py-4 text-red-500/50 text-sm font-medium hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20 rounded-xl">
          Vote to Terminate Market
        </button>
      </div>
    </div>
  );
}
