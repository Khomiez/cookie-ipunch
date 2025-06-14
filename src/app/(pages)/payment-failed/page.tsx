// src/app/(pages)/payment-failed/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  XCircle,
  RefreshCw,
  ArrowLeft,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { useAppSelector } from "@/hooks/redux";
import Header from "@/components/common/Header";

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<string>("");
  const [isRetrying, setIsRetrying] = useState(false);
  const { items, totalItems, totalPrice } = useAppSelector(
    (state) => state.cart
  );

  useEffect(() => {
    const session_id = searchParams.get("session_id");
    const error = searchParams.get("error");

    if (session_id) {
      setSessionId(session_id);
    }

    // Handle different error types
    if (error) {
      setErrorReason(getErrorMessage(error));
    }
  }, [searchParams]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "card_declined":
        return "Your card was declined. Please try a different payment method.";
      case "insufficient_funds":
        return "Insufficient funds. Please check your account balance.";
      case "expired_card":
        return "Your card has expired. Please use a different card.";
      case "processing_error":
        return "Payment processing error. Please try again.";
      case "authentication_required":
        return "Additional authentication required. Please try again.";
      default:
        return "Payment was unsuccessful. Please try again or use a different payment method.";
    }
  };

  const handleBackClick = () => {
    router.push("/cart");
  };

  const handleRetryPayment = async () => {
    setIsRetrying(true);

    try {
      // Redirect back to cart for retry
      router.push("/cart");
    } catch (error) {
      console.error("Error during retry:", error);
      setIsRetrying(false);
    }
  };

  const handleContactSupport = () => {
    // You can implement this to open email client or support chat
    const email = "support@fatsprinkle.co";
    const subject = "Payment Issue - Order Reference";
    const body = `Hi, I had trouble with my payment. ${
      sessionId ? `Session ID: ${sessionId}` : ""
    }\n\nError: ${errorReason}\n\nPlease help me complete my order.`;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const paymentMethods = [
    {
      icon: CreditCard,
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, etc.",
    },
    { icon: Smartphone, name: "PromptPay", description: "Thai mobile banking" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fefbdc" }}>
      <Header
        showBackButton={true}
        onBackClick={handleBackClick}
        title="Payment Failed"
      />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full text-center">
          {/* Error Icon */}
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: "#fee2e2" }}
          >
            <XCircle size={40} className="text-red-500" />
          </div>

          {/* Error Message */}
          <h1
            className="text-2xl font-bold mb-3 comic-text"
            style={{ color: "#7f6957" }}
          >
            Payment Unsuccessful 😔
          </h1>

          <p className="text-base mb-6" style={{ color: "#7f6957" }}>
            {errorReason ||
              "We couldn't process your payment. Don't worry, your cookies are still waiting for you!"}
          </p>

          {/* Order Summary */}
          {totalItems > 0 && (
            <div className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
              <h3
                className="font-bold mb-2 comic-text"
                style={{ color: "#7f6957" }}
              >
                Your Order 🍪
              </h3>
              <div className="text-sm space-y-1" style={{ color: "#7f6957" }}>
                <div className="flex justify-between">
                  <span>
                    {totalItems} {totalItems !== 1 ? "cookies" : "cookie"}
                  </span>
                  <span className="font-bold">{totalPrice}.-</span>
                </div>
              </div>
            </div>
          )}

          {/* Session ID */}
          {sessionId && (
            <div
              className="text-sm opacity-75 mb-6 font-mono bg-white rounded-lg p-2"
              style={{ color: "#7f6957" }}
            >
              Session: #{sessionId.slice(-8).toUpperCase()}
            </div>
          )}

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
            <h3
              className="font-bold mb-3 comic-text"
              style={{ color: "#7f6957" }}
            >
              Try These Payment Methods 💳
            </h3>
            <div className="space-y-2">
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 rounded-lg"
                  style={{ backgroundColor: "#fefbdc" }}
                >
                  <method.icon size={20} style={{ color: "#7f6957" }} />
                  <div className="text-left">
                    <div
                      className="font-medium text-sm"
                      style={{ color: "#7f6957" }}
                    >
                      {method.name}
                    </div>
                    <div
                      className="text-xs opacity-75"
                      style={{ color: "#7f6957" }}
                    >
                      {method.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="w-full px-6 py-3 rounded-2xl text-white font-bold transform hover:scale-105 transition-transform flex items-center justify-center space-x-2 disabled:opacity-50"
              style={{ backgroundColor: "#7f6957" }}
            >
              {isRetrying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  <span>Try Again</span>
                </>
              )}
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 rounded-2xl font-bold border-2 border-dashed transform hover:scale-105 transition-transform"
              style={{
                borderColor: "#7f6957",
                color: "#7f6957",
                backgroundColor: "transparent",
              }}
            >
              <ArrowLeft size={20} className="inline mr-2" />
              Continue Shopping
            </button>

            <button
              onClick={handleContactSupport}
              className="no-hover w-full px-6 py-2 text-sm underline opacity-80 hover:opacity-100 transition-opacity"
              style={{ color: "#7f6957" }}
            >
              Need help? Contact Support
            </button>
          </div>

          {/* Helpful Tips */}
          <div className="mt-6">
            <h4
              className="font-bold mb-2 comic-text"
              style={{ color: "#7f6957" }}
            >
              Common Solutions:
            </h4>
            <ul
              className="text-sm space-y-1 opacity-75"
              style={{ color: "#7f6957" }}
            >
              <li>• Check your card details and billing address</li>
              <li>• Ensure sufficient funds in your account</li>
              <li>• Try a different payment method</li>
              <li>• Contact your bank if the issue persists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
