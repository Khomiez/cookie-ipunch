// src/app/(pages)/cart/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { clearCart } from "@/store/slices/cartSlice";
import Header from "@/components/common/Header";
import CartItemCard from "@/components/cart/CartItemCard";
import DeliveryNoti from "@/components/notification/DeliveryNoti";
import EmptyCart from "@/components/cart/EmptyCart";
import DeliveryMethodSelector from "@/components/cart/DeliveryMethodSelector";
import OrderSummary from "@/components/cart/OrderSummary";
import CheckoutButton from "@/components/cart/CheckoutButton";
import stripePromise from "@/lib/stripe";

type DeliveryMethod = 'shipping' | 'pickup';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const { items, totalItems, totalPrice } = useAppSelector(
    (state) => state.cart
  );

  const handleBackClick = () => {
    router.push("/");
  };

  const handleClearCart = () => {
    if (window.confirm("Remove all cookies from cart? 🥺")) {
      dispatch(clearCart());
    }
  };

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);

    try {
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          items,
          deliveryMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { sessionId } = await response.json();

      if (!sessionId) {
        throw new Error("No session ID returned");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error("Error redirecting to checkout:", error);
        alert("Error redirecting to checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(`Something went wrong with checkout: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#fefbdc" }}>
        <Header
          showBackButton={true}
          onBackClick={handleBackClick}
          title="Your cart"
        />
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fefbdc" }}>
      <Header
        showBackButton={true}
        onBackClick={handleBackClick}
        title="Your Cart"
      />

      {/* Delivery Notification */}
      <DeliveryNoti />

      {/* Cart Summary Header */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold comic-text" style={{ color: "#7f6957" }}>
                Your order 📃
              </h2>
              <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
                {totalItems} {totalItems !== 1 ? 'cookies' : 'cookie'}
              </p>
            </div>
            <button
              onClick={handleClearCart}
              className="text-sm underline opacity-80 hover:opacity-100 transition-opacity comic-text"
              style={{ color: "#7f6957" }}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Method Selection */}
      <DeliveryMethodSelector
        deliveryMethod={deliveryMethod}
        onDeliveryMethodChange={setDeliveryMethod}
      />

      {/* Cart Items */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto space-y-4">
          {items.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <OrderSummary
        totalItems={totalItems}
        totalPrice={totalPrice}
        deliveryMethod={deliveryMethod}
      />

      {/* Checkout Button */}
      <CheckoutButton
        isLoading={isCheckoutLoading}
        onCheckout={handleCheckout}
      />
    </div>
  );
}