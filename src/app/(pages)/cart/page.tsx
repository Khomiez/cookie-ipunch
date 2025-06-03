// src/app/(pages)/cart/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, Truck, Store } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { clearCart } from "@/store/slices/cartSlice";
import Header from "@/components/common/Header";
import CartItemCard from "@/components/cart/CartItemCard";
import DeliveryNoti from "@/components/notification/DeliveryNoti";
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

  const calculateTotal = () => {
    const shippingFee = deliveryMethod === 'shipping' ? 40 : 0;
    return totalPrice + shippingFee;
  };

  const shippingFee = deliveryMethod === 'shipping' ? 40 : 0;

  // Empty cart state with cozy messaging
  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#fefbdc" }}>
        <Header
          showBackButton={true}
          onBackClick={handleBackClick}
          title="Your cart"
        />

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
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-bold mb-4 comic-text" style={{ color: "#7f6957" }}>
            Delivery Method 🚚
          </h3>
          
          <div className="space-y-3">
            {/* Pickup Option */}
            <button
              onClick={() => setDeliveryMethod('pickup')}
              className={`w-full p-4 rounded-2xl border-2 transition-all ${
                deliveryMethod === 'pickup'
                  ? 'border-[#7f6957] shadow-lg'
                  : 'border-gray-200 hover:border-[#7f6957]'
              }`}
              style={{ backgroundColor: deliveryMethod === 'pickup' ? "#eaf7ff" : "white" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${
                    deliveryMethod === 'pickup' ? 'bg-[#7f6957]' : 'bg-gray-100'
                  }`}>
                    <Store size={20} className={deliveryMethod === 'pickup' ? 'text-white' : 'text-gray-500'} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold comic-text" style={{ color: "#7f6957" }}>Pick Up</div>
                    <div className="text-sm opacity-75" style={{ color: "#7f6957" }}>Come say hi! 👋</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-green-600 comic-text">FREE</span>
                  <span className="text-xs opacity-75" style={{ color: "#7f6957" }}>Ready Friday</span>
                </div>
              </div>
            </button>

            {/* Shipping Option */}
            <button
              onClick={() => setDeliveryMethod('shipping')}
              className={`w-full p-4 rounded-2xl border-2 transition-all ${
                deliveryMethod === 'shipping'
                  ? 'border-[#7f6957] shadow-lg'
                  : 'border-gray-200 hover:border-[#7f6957]'
              }`}
              style={{ backgroundColor: deliveryMethod === 'shipping' ? "#eaf7ff" : "white" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${
                    deliveryMethod === 'shipping' ? 'bg-[#7f6957]' : 'bg-gray-100'
                  }`}>
                    <Truck size={20} className={deliveryMethod === 'shipping' ? 'text-white' : 'text-gray-500'} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold comic-text" style={{ color: "#7f6957" }}>Home Delivery</div>
                    <div className="text-sm opacity-75" style={{ color: "#7f6957" }}>Straight to your door 🏠</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold comic-text" style={{ color: "#7f6957" }}>40.-</span>
                  <span className="text-xs opacity-75" style={{ color: "#7f6957" }}>Friday delivery</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto space-y-4">
          {items.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-4 pb-40">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h3 className="text-lg font-bold mb-4 comic-text" style={{ color: "#7f6957" }}>
              Order Summary 📝
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="comic-text" style={{ color: "#7f6957" }}>
                  {totalItems} {totalItems !== 1 ? 'cookies' : 'cookie'}
                </span>
                <span className="font-bold comic-text" style={{ color: "#7f6957" }}>{totalPrice.toFixed(0)}.-</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="comic-text" style={{ color: "#7f6957" }}>
                  {deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery 🚚'}
                </span>
                <span className={`font-bold comic-text ${shippingFee === 0 ? 'text-green-600' : ''}`} 
                      style={{ color: shippingFee === 0 ? "#16a34a" : "#7f6957" }}>
                  {shippingFee === 0 ? 'FREE! 🎉' : `${shippingFee}.-`}
                </span>
              </div>
              
              <div className="border-t-2 border-dashed border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold comic-text" style={{ color: "#7f6957" }}>
                    Total
                  </span>
                  <span className="text-2xl font-bold comic-text" style={{ color: "#7f6957" }}>
                    {calculateTotal().toFixed(0)}.-
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div
        className="fixed bottom-0 left-0 right-0 p-2 z-40 backdrop-blur-xs"
      >
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handleCheckout}
            disabled={isCheckoutLoading}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 transition-transform disabled:opacity-50 disabled:transform-none comic-text"
            style={{ backgroundColor: "#7f6957" }}
          >
            {isCheckoutLoading ? (
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
    </div>
  );
}