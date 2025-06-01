// src/components/cart/CartItemCard.tsx
"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { CartItem } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/hooks/redux";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
} from "@/store/slices/cartSlice";
import QuantityControls from "../product/QuantityControls";

type Props = {
  item: CartItem;
};

const CartItemCard = ({ item }: Props) => {
  const dispatch = useAppDispatch();

  const handleIncrease = () => {
    dispatch(addToCart(item));
  };

  const handleDecrease = () => {
    dispatch(removeFromCart(item.id));
  };

  const handleRemove = () => {
    dispatch(updateQuantity({ id: item.id, quantity: 0 }));
  };

  // Price is now stored directly in Baht
  const displayPrice = item.price.toFixed(0);
  const itemTotal = item.price * item.quantity;

  return (
    <div
      className="bg-white rounded-3xl p-4 shadow-lg relative overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* Product Tag - Using CSS class for consistency */}
      {item.tag && (
        <div className="product-tag">
          {item.tag}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div
          className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ backgroundColor: "#fefbdc" }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {item.image && item.image !== '/api/placeholder/300/300' ? (
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full"
                style={{ backgroundColor: "#eaf7ff" }}
              >
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🍪
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className="font-bold text-lg mb-1 comic-text"
                style={{ color: "#7f6957" }}
              >
                {item.name}
              </h3>
              <p
                className="text-sm opacity-75 mb-2"
                style={{ color: "#7f6957" }}
              >
                {item.description}
              </p>
            </div>

            <button
              onClick={handleRemove}
              className="ml-2 p-2 no-hover"
              aria-label="Remove item"
            >
              <Trash2 size={16} className="text-[#7f6957]" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-bold" style={{ color: "#7f6957" }}>
                {displayPrice}.- each
              </span>
              <QuantityControls
                quantity={item.quantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                size="sm"
              />
            </div>

            <div className="text-right">
              <div className="text-sm opacity-75" style={{ color: "#7f6957" }}>
                Total
              </div>
              <div className="text-xl font-bold" style={{ color: "#7f6957" }}>
                {itemTotal.toFixed(0)}.-
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;