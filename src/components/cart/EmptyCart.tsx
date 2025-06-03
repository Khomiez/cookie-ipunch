import React from "react";
import { useRouter } from "next/navigation";

export default function EmptyCart() {
  const router = useRouter();

  return (
    <div className="px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        <div
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: "#eaf7ff" }}
        >
          <div className="text-4xl">🍪</div>
        </div>

        <h2
          className="text-2xl font-bold mb-4 comic-text"
          style={{ color: "#7f6957" }}
        >
          Your cart is empty!
        </h2>

        <p className="text-sm opacity-75 mb-8 comic-text" style={{ color: "#7f6957" }}>
          Add some cookies to your cart 🌟
        </p>

        <button
          onClick={() => router.push("/")}
          className="px-8 py-4 rounded-full text-white font-bold transform hover:scale-105 transition-transform comic-text"
          style={{ backgroundColor: "#7f6957" }}
        >
          Start Shopping! 🍪
        </button>
      </div>
    </div>
  );
} 