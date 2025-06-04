// src/components/common/Header.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import { useAppSelector } from "@/hooks/redux";
import SidebarMenu from "@/components/navigation/SidebarMenu";

type Props = {
  showBackButton?: boolean;
  onBackClick?: () => void;
  title?: string;
};

const Header = ({ showBackButton = false, onBackClick, title }: Props) => {
  const { totalItems } = useAppSelector((state) => state.cart);
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 px-4 py-3"
        style={{ backgroundColor: "#fefbdc" }}
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            {showBackButton ? (
              <button
                onClick={onBackClick}
                className="no-hover"
                aria-label="Go back"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7f6957"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#7f6957" }}
              >
                <Image
                  src="/brand-images/fatsprinkle-logo.jpg"
                  alt="Fat Sprinkle Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            )}
            {title && (
              <h1 className="text-lg font-medium" style={{ color: "#7f6957" }}>
                {title}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isClient && (
              <Link href="/cart" className="relative">
                <ShoppingBag size={24} style={{ color: "#7f6957" }} />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: "#7f6957", color: "#fefbdc" }}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <button onClick={handleMenuClick} className="no-hover">
              <Menu size={24} style={{ color: "#7f6957" }} />
            </button>
          </div>
        </div>
      </header>

      <SidebarMenu isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
    </>
  );
};

export default Header;