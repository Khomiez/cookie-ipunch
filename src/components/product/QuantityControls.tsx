// src/components/product/QuantityControls.tsx
"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

type Props = {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: "sm" | "md" | "lg";
};

const QuantityControls = ({
  quantity,
  onIncrease,
  onDecrease,
  size = "md",
}: Props) => {
  const sizeClasses = {
    sm: {
      button: "w-6 h-6 text-xs",
      text: "text-sm px-2",
      icon: 12,
    },
    md: {
      button: "w-8 h-8 text-sm",
      text: "text-base px-3",
      icon: 16,
    },
    lg: {
      button: "w-10 h-10 text-base",
      text: "text-lg px-4",
      icon: 20,
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onDecrease}
        className={`${classes.button} rounded-full text-white flex items-center justify-center font-bold transform hover:scale-105 transition-transform`}
        style={{ backgroundColor: "#7f6957" }}
        aria-label="Decrease quantity"
      >
        <Minus size={classes.icon} />
      </button>

      <span
        className={`${classes.text} font-bold text-center min-w-[2rem]`}
        style={{ color: "#7f6957" }}
      >
        {quantity}
      </span>

      <button
        onClick={onIncrease}
        className={`${classes.button} rounded-full text-white flex items-center justify-center font-bold transform hover:scale-105 transition-transform`}
        style={{ backgroundColor: "#7f6957" }}
        aria-label="Increase quantity"
      >
        <Plus size={classes.icon} />
      </button>
    </div>
  );
};

export default QuantityControls;
