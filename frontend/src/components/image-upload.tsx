"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  taskDescription: string;
  onVerified: (result: { verified: boolean; reason: string }) => void;
}

export function ImageUpload({ taskDescription, onVerified }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVerify = async () => {
    if (!preview) return;

    setIsVerifying(true);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: preview,
          taskDescription,
        }),
      });

      const result = await response.json();

      if (result.verified) {
        toast({
          title: "Verified!",
          description: result.reason,
        });
      } else {
        toast({
          title: "Not Verified",
          description: result.reason,
          variant: "destructive",
        });
      }

      onVerified(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="bg-[#252525] p-6 rounded-2xl border-[#333]">
      <h3 className="text-lg font-bold mb-4 text-[#a0a0a0] uppercase tracking-wider">
        Verify Your Task
      </h3>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-[#ff6b35] bg-[#ff6b35]/10"
            : "border-[#333] hover:border-[#ff6b35]"
        }`}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => setPreview(null)}
                className="border-[#333] text-[#a0a0a0] hover:border-[#ff6b35]"
              >
                Remove
              </Button>
              <Button
                onClick={handleVerify}
                disabled={isVerifying}
                className="bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a]"
              >
                {isVerifying ? "Verifying..." : "Verify with AI"}
              </Button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-4xl mb-4">📷</div>
            <p className="text-[#a0a0a0]">
              Drag & drop an image or <span className="text-[#ff6b35]">click to upload</span>
            </p>
            <p className="text-sm text-[#666] mt-2">
              Upload proof of completing: {taskDescription}
            </p>
          </label>
        )}
      </div>
    </Card>
  );
}
