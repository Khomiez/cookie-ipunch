import React from "react";
import Image from "next/image";
import { ShoppingBag, Menu } from "lucide-react";

type Props = {};

const Header = (props: Props) => {
  return (
    <header
      className="sticky top-0 z-50 px-4 py-3"
      style={{ backgroundColor: "#fefbdc" }}
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#7f6957" }}
          >
            <Image
              src="/brand-images/fatsprinkle-logo.jpg"
              alt="Fat Sprinkle Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <h1
            className="text-xl font-bold font-comic"
            style={{ color: "#7f6957" }}
          >
            fatsprinkle.co
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative">
            <ShoppingBag size={24} style={{ color: "#7f6957" }} />
            <span
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center"
              style={{ backgroundColor: "#7f6957" }}
            >
              3
            </span>
          </button>
          <button>
            <Menu size={28} style={{ color: "#7f6957" }} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;