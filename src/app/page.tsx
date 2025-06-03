// src/app/page.tsx
"use client";
import { ShoppingBag, Filter, Menu } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import FloatingCardBar from "@/components/cart/FloatingCardBar";
import DeliveryNoti from "@/components/notification/DeliveryNoti";
import { Header } from "@/components/common";
import HeroSection from "@/components/common/HeroSection";
import EventsNewsSection from "@/components/events/EventsNewsSection";
import { useState } from "react";

export default function Home() {
  const [cookieNumber, setCookieNumber] = useState(0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fefbdc" }}>
      {/* Header */}
      <Header />

      {/* Delivery Notification */}
      <DeliveryNoti />

      {/* Events & News Section */}
      <EventsNewsSection />

      {/* Hero Section */}
      <HeroSection />
      
      {/* Filter Bar */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            className="flex items-center space-x-2 px-4 py-2 rounded-full border-2 border-dashed"
            style={{ borderColor: "#7f6957", color: "#7f6957" }}
          >
            <Filter size={16} />
            <span className="text-sm font-medium">Filter & Sort</span>
          </button>
          <div className="text-sm opacity-75" style={{ color: "#7f6957" }}>
            {cookieNumber} delicious options
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid setCookieNumber={setCookieNumber} />

      {/* Floating Cart Bar */}
      <FloatingCardBar />
    </div>
  );
}
