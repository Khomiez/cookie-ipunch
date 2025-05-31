// src/app/(pages)/cart/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { clearCart } from "@/store/slices/cartSlice";
import Header from "@/components/common/Header";
import CartItemCard from "@/components/cart/CartItemCard";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalItems, totalPrice } = useAppSelector(
    (state) => state.cart
  );

  const handleBackClick = () => {
    router.back();
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch(clearCart());
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#fefbdc" }}>
        <Header
          showBackButton={true}
          onBackClick={handleBackClick}
          title="Your Cart"
        />

        <div className="px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: "#eaf7ff" }}
            >
              <ShoppingBag size={40} style={{ color: "#7f6957" }} />
            </div>

            <h2
              className="text-2xl font-bold mb-4 comic-text"
              style={{ color: "#7f6957" }}
            >
              Your cart is empty
            </h2>

            <p className="text-sm opacity-75 mb-8" style={{ color: "#7f6957" }}>
              Looks like you haven't added any delicious cookies yet!
            </p>

            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-full text-white font-bold transform hover:scale-105 transition-transform"
              style={{ backgroundColor: "#7f6957" }}
            >
              Start Shopping
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

      {/* Cart Summary */}
      <div className="px-4 mb-6  comic-text">
        <div className="max-w-md mx-auto">
          <div
            className="p-4 rounded-2xl"
            style={{ backgroundColor: "#eaf7ff" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold" style={{ color: "#7f6957" }}>
                Total Items: {totalItems}
              </span>
              <button
                onClick={handleClearCart}
                className="text-sm underline opacity-80 hover:opacity-100 transition-opacity"
                style={{ color: "#7f6957" }}
              >
                Clear Cart
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold" style={{ color: "#7f6957" }}>
                Total: {totalPrice}.-
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-4 pb-32">
        <div className="max-w-md mx-auto space-y-4">
          {items.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Checkout Button */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 z-40"
        style={{ backgroundColor: "#fefbdc" }}
      >
        <div className="max-w-md mx-auto space-y-3">
          <button
            className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 transition-transform"
            style={{ backgroundColor: "#7f6957" }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={24} />
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-2xl font-bold text-lg border-2 border-dashed transform hover:scale-105 transition-transform"
            style={{
              borderColor: "#7f6957",
              color: "#7f6957",
              backgroundColor: "transparent",
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}