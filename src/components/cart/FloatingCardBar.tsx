// src/components/cart/FloatingCardBar.tsx
'use client';

import React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useAppSelector } from "@/hooks/redux";

type Props = {};

const FloatingCardBar = (props: Props) => {
  const { totalItems, totalPrice } = useAppSelector(state => state.cart);

  // Don't show the floating cart if there are no items
  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 p-4 z-40"
      style={{ backgroundColor: "#fefbdc" }}
    >
      <div className="max-w-md mx-auto">
        <Link href="/cart">
          <button
            className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 transition-transform"
            style={{ backgroundColor: "#7f6957" }}
          >
            <ShoppingBag size={24} />
            <span>View Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
            <span className="bg-white text-black px-2 py-1 rounded-full text-sm font-bold">
              {totalPrice}.-
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default FloatingCardBar;