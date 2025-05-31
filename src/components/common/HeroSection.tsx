import React from "react";

type Props = {};

const HeroSection = (props: Props) => {
  return (
    <div className="px-4 mb-6">
      <div className="max-w-md mx-auto text-center">
        <h2
          className="text-3xl font-bold mb-2 comic-text"
          style={{ color: "#7f6957" }}
        >
          Our Menu!
        </h2>
        <div className="flex justify-center items-center space-x-2 mb-4">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#7f6957" }}
          ></div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#eaf7ff" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#7f6957" }}
          ></div>
        </div>
        <p className="text-sm opacity-80" style={{ color: "#7f6957" }}>
          Freshly baked cookies made with love, delivered to your door
        </p>
      </div>
    </div>
  );
};

export default HeroSection;