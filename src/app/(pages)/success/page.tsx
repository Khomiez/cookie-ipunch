// src/app/(pages)/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useAppDispatch } from "@/hooks/redux";
import { clearCart } from "@/store/slices/cartSlice";
import Header from "@/components/common/Header";
import Script from "next/script";

declare global {
  interface Window {
    confetti: any;
  }
}

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const session_id = searchParams.get("session_id");
    if (session_id) {
      setSessionId(session_id);
      // Clear the cart after successful payment
      dispatch(clearCart());
    }
    setIsLoading(false);
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (!mounted) return;

    // Enhanced falling confetti animation
    const createFallingConfetti = () => {
      if (!window.confetti) return;

      // Main confetti burst from top
      const duration = 1500;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const runAnimation = () => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return;
        }

        // Create multiple small bursts across the top
        const particleCount = 2 * (timeLeft / duration);

        // Left side
        window.confetti({
          particleCount: Math.floor(particleCount / 3),
          spread: 60,
          origin: { x: randomInRange(0.1, 0.3), y: 0 },
          colors: ["#faee73", "#eaf7ff", "#7f6957", "#ffffff"],
          gravity: 0.6,
          scalar: randomInRange(0.8, 1.2),
          drift: randomInRange(-0.5, 0.5),
          ticks: 200,
          startVelocity: randomInRange(25, 35),
          shapes: ["circle", "square"],
        });

        // Center
        window.confetti({
          particleCount: Math.floor(particleCount / 3),
          spread: 70,
          origin: { x: randomInRange(0.4, 0.6), y: 0 },
          colors: ["#faee73", "#eaf7ff", "#7f6957", "#ffffff"],
          gravity: 0.6,
          scalar: randomInRange(0.8, 1.2),
          drift: randomInRange(-0.5, 0.5),
          ticks: 200,
          startVelocity: randomInRange(25, 35),
          shapes: ["circle", "square"],
        });

        // Right side
        window.confetti({
          particleCount: Math.floor(particleCount / 3),
          spread: 60,
          origin: { x: randomInRange(0.7, 0.9), y: 0 },
          colors: ["#faee73", "#eaf7ff", "#7f6957", "#ffffff"],
          gravity: 0.6,
          scalar: randomInRange(0.8, 1.2),
          drift: randomInRange(-0.5, 0.5),
          ticks: 200,
          startVelocity: randomInRange(25, 35),
          shapes: ["circle", "square"],
        });

        // Cookie emojis falling
        if (Math.random() < 0.3) {
          window.confetti({
            particleCount: 2,
            spread: 30,
            origin: { x: randomInRange(0.2, 0.8), y: 0 },
            gravity: 0.5,
            scalar: 1.5,
            drift: randomInRange(-0.3, 0.3),
            ticks: 250,
            startVelocity: randomInRange(15, 25),
            shapes: ["emoji"],
            shapeOptions: {
              emoji: {
                value: ["🍪", "✨", "🎉"],
              },
            },
          });
        }

        requestAnimationFrame(runAnimation);
      };

      runAnimation();
    };

    // Initial big burst
    setTimeout(() => {
      if (window.confetti) {
        window.confetti({
          particleCount: 100,
          spread: 160,
          origin: { y: 0 },
          colors: ["#faee73", "#eaf7ff", "#7f6957", "#ffffff"],
          gravity: 0.8,
          scalar: 1,
          ticks: 300,
          startVelocity: 40,
          shapes: ["circle", "square"],
        });
      }
    }, 200);

    // Start continuous falling effect
    setTimeout(createFallingConfetti, 500);

  }, [mounted]);

  const handleBackClick = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#fefbdc" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7f6957] mx-auto mb-4"></div>
          <p style={{ color: "#7f6957" }}>Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: "#fefbdc" }}>
      <Script src="https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3.0.3/tsparticles.confetti.bundle.min.js" />
      <Header
        showBackButton={true}
        onBackClick={handleBackClick}
        title="Order Success"
      />

      <div className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
        <div className="max-w-md w-full text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce"
            style={{ backgroundColor: "#eaf7ff" }}
          >
            <CheckCircle size={40} style={{ color: "#7f6957" }} />
          </div>

          <h1
            className="text-2xl font-bold mb-3 comic-text"
            style={{ color: "#7f6957" }}
          >
            Order Confirmed! 🎉
          </h1>

          <p className="text-base mb-4" style={{ color: "#7f6957" }}>
            Thank you for your pre-order! We'll start preparing your delicious
            cookies and notify you when they're ready for delivery.
          </p>

          <div className="bg-white rounded-2xl p-3 mb-4 shadow-lg">
            <h3
              className="font-bold mb-2 comic-text"
              style={{ color: "#7f6957" }}
            >
              What happens next?
            </h3>
            <div className="text-sm space-y-1" style={{ color: "#7f6957" }}>
              <p>✅ Payment confirmed</p>
              <p>🍪 Cookies will be freshly baked</p>
              <p>📧 You'll receive updates via email</p>
              <p>🚚 Delivery on Friday, March 28</p>
            </div>
          </div>

          {sessionId && (
            <div
              className="text-sm opacity-75 mb-4 font-mono"
              style={{ color: "#7f6957" }}
            >
              Order Reference: #{sessionId.slice(-8).toUpperCase()}
            </div>
          )}

          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 rounded-2xl text-white font-bold transform hover:scale-105 transition-transform flex items-center justify-center space-x-2"
            style={{ backgroundColor: "#7f6957" }}
          >
            <span>Continue Shopping</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}