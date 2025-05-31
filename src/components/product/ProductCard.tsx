import { IProduct } from "@/interfaces";
import React from "react";

type Props = {
  product: IProduct;
};

const ProductCard = ({ product }: Props) => {
  return (
    <div
      className="bg-white rounded-3xl p-4 shadow-lg relative overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* Decorative sprinkles */}
      <div
        className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-30"
        style={{ backgroundColor: "#eaf7ff" }}
      ></div>
      <div
        className="absolute top-4 right-6 w-1 h-1 rounded-full opacity-50"
        style={{ backgroundColor: "#7f6957" }}
      ></div>
      <div
        className="absolute top-6 right-3 w-1.5 h-1.5 rounded-full opacity-40"
        style={{ backgroundColor: "#eaf7ff" }}
      ></div>

      {/* Product Tag */}
      {product.tag && (
        <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-24px)]">
          <div
            className="px-2 py-1 rounded-full text-xs font-bold text-white transform -rotate-12 whitespace-nowrap"
            style={{ backgroundColor: "#7f6957" }}
          >
            {product.tag}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div
          className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ backgroundColor: "#fefbdc" }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-full"
              style={{ backgroundColor: "#eaf7ff" }}
            >
              <div className="w-full h-full flex items-center justify-center text-2xl">
                🍪
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h3
            className="font-bold text-lg mb-1 font-comic"
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
                {product.price}.-
              </span>
            </div>
            <button
              className="px-4 py-2 rounded-full text-sm font-bold text-white transform hover:scale-105 transition-transform"
              style={{ backgroundColor: "#7f6957" }}
            >
              Pre-order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;