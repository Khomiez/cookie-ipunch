// src/app/(pages)/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useAppDispatch } from "@/hooks/redux";
import { clearCart } from "@/store/slices/cartSlice";
import Header from "@/components/common/Header";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session_id = searchParams.get("session_id");
    if (session_id) {
      setSessionId(session_id);
      // Clear the cart after successful payment
      dispatch(clearCart());
    }
    setIsLoading(false);
  }, [searchParams, dispatch]);

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
    <div className="min-h-screen" style={{ backgroundColor: "#fefbdc" }}>
      <Header
        showBackButton={true}
        onBackClick={handleBackClick}
        title="Order Success"
      />

      <div className="px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce"
            style={{ backgroundColor: "#eaf7ff" }}
          >
            <CheckCircle size={48} style={{ color: "#7f6957" }} />
          </div>

          <h1
            className="text-3xl font-bold mb-4 comic-text"
            style={{ color: "#7f6957" }}
          >
            Order Confirmed! 🎉
          </h1>

          <p className="text-lg mb-6" style={{ color: "#7f6957" }}>
            Thank you for your pre-order! We'll start preparing your delicious
            cookies and notify you when they're ready for delivery.
          </p>

          <div className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
            <h3
              className="font-bold mb-2 comic-text"
              style={{ color: "#7f6957" }}
            >
              What happens next?
            </h3>
            <div className="text-sm space-y-2" style={{ color: "#7f6957" }}>
              <p>✅ Payment confirmed</p>
              <p>🍪 Cookies will be freshly baked</p>
              <p>📧 You'll receive updates via email</p>
              <p>🚚 Delivery on Friday, March 28</p>
            </div>
          </div>

          {sessionId && (
            <div
              className="text-sm opacity-75 mb-8 font-mono"
              style={{ color: "#7f6957" }}
            >
              Order Reference: #{sessionId.slice(-8).toUpperCase()}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 rounded-2xl text-white font-bold transform hover:scale-105 transition-transform flex items-center justify-center space-x-2"
              style={{ backgroundColor: "#7f6957" }}
            >
              <span>Continue Shopping</span>
              <ArrowRight size={20} />
            </button>

            <button
              onClick={() => router.push("/orders")}
              className="w-full px-6 py-3 rounded-2xl font-bold border-2 border-dashed transform hover:scale-105 transition-transform"
              style={{
                borderColor: "#7f6957",
                color: "#7f6957",
                backgroundColor: "transparent",
              }}
            >
              View Order History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
