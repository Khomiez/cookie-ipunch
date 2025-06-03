import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface CheckoutButtonProps {
  isLoading: boolean;
  onCheckout: () => void;
}

export default function CheckoutButton({ isLoading, onCheckout }: CheckoutButtonProps) {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 p-2 z-40 backdrop-blur-xs">
      <div className="max-w-md mx-auto space-y-3">
        <button
          onClick={onCheckout}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 transition-transform disabled:opacity-50 disabled:transform-none comic-text"
          style={{ backgroundColor: "#7f6957" }}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Baking your order... 🍪</span>
            </>
          ) : (
            <>
              <span>Proceed to Checkout</span>
              <ArrowRight size={24} />
            </>
          )}
        </button>

        <button
          onClick={() => router.push("/")}
          className="w-full py-3 rounded-2xl font-bold text-lg border-2 border-dashed transform hover:scale-105 transition-transform comic-text"
          style={{
            borderColor: "#7f6957",
            color: "#7f6957",
            backgroundColor: "#fefbdc",
          }}
        >
          Keep Shopping
        </button>
      </div>
    </div>
  );
} 