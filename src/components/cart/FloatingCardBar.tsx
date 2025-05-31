import { ShoppingBag } from "lucide-react";
import React from "react";

type Props = {};

const FloatingCardBar = (props: Props) => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 p-4"
      style={{ backgroundColor: "#fefbdc" }}
    >
      <div className="max-w-md mx-auto">
        <button
          className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 transition-transform"
          style={{ backgroundColor: "#7f6957" }}
        >
          <ShoppingBag size={24} />
          <span>View Cart (3 items)</span>
          <span className="bg-white text-black px-2 py-1 rounded-full text-sm font-bold">
            147.-
          </span>
        </button>
      </div>
    </div>
  );
};

export default FloatingCardBar;
