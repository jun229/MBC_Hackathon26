import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string | number;
  label: string;
  variant?: "success" | "accent" | "default";
}

export function StatCard({ value, label, variant = "success" }: StatCardProps) {
  return (
    <Card className="bg-[#252525] p-10 rounded-2xl border-[#333] hover:border-[#ff6b35] transition-all duration-300 hover:-translate-y-1">
      <div
        className={cn(
          "font-mono-display text-5xl font-bold leading-none mb-2",
          variant === "success" && "text-[#4ade80]",
          variant === "accent" && "text-[#ff6b35]",
          variant === "default" && "text-white"
        )}
      >
        {typeof value === "number" && value > 0 ? `+$${value}` : value}
      </div>
      <div className="text-sm text-[#a0a0a0] uppercase tracking-wider">
        {label}
      </div>
    </Card>
  );
}
