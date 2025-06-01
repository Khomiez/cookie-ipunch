// src/components/product/ProductCard.tsx
"use client";

import React from "react";
import { IProduct } from "@/interfaces";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addToCart, removeFromCart } from "@/store/slices/cartSlice";
import QuantityControls from "./QuantityControls";

type Props = {
  product: IProduct;
};

const ProductCard = ({ product }: Props) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  // Find the quantity of this product in the cart
  const cartItem = cartItems.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Format price from cents to display format
  const displayPrice = (product.price / 100).toFixed(0); // Remove decimals for whole numbers

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

  const handleIncrease = () => {
    dispatch(addToCart(product));
  };

  const handleDecrease = () => {
    dispatch(removeFromCart(product.id));
  };

  return (
    <div
      className="bg-white rounded-3xl p-4 shadow-lg relative overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* Product Tag - Using CSS class for consistency */}
      {product.tag && (
        <div className="product-tag">
          {product.tag}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div
          className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ backgroundColor: "#fefbdc" }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {product.image && product.image !== '/api/placeholder/300/300' ? (
              <img 
                src={product.image} 
                alt={product.name}
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
          <h3
            className="font-bold text-lg mb-1 comic-text"
            style={{ color: "#7f6957" }}
          >
            {product.name}
          </h3>
          <p className="text-sm opacity-75 mb-2" style={{ color: "#7f6957" }}>
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold" style={{ color: "#7f6957" }}>
                {displayPrice}.-
              </span>
            </div>

            {/* Conditional rendering: Pre-order button or Quantity controls */}
            {quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="px-4 py-2 rounded-full text-sm font-bold text-white transform hover:scale-105 transition-transform"
                style={{ backgroundColor: "#7f6957" }}
              >
                Pre-order
              </button>
            ) : (
              <QuantityControls
                quantity={quantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                size="sm"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;