// src/app/page.tsx
"use client";
import { ShoppingBag, Filter, Menu, ChevronDown } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import FloatingCardBar from "@/components/cart/FloatingCardBar";
import DeliveryNoti from "@/components/notification/DeliveryNoti";
import { Header } from "@/components/common";
import HeroSection from "@/components/common/HeroSection";
import EventsNewsSection from "@/components/events/EventsNewsSection";
import { useState } from "react";

export default function Home() {
  const [cookieNumber, setCookieNumber] = useState(0);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");
  const [isSortOpen, setIsSortOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fefbdc" }}>
      {/* Events & News Section with ID for navigation */}
      <section id="events" data-section="events">
        {/* Header */}
        <Header title="fatsprinkle.co"/>

        {/* Delivery Notification */}
        <DeliveryNoti />

        <EventsNewsSection />
      </section>

      {/* Hero Section */}
      <HeroSection />

      {/* Filter Bar */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full border-2 border-dashed"
              style={{ borderColor: "#7f6957", color: "#7f6957" }}
            >
              <Filter size={16} />
              <span className="text-sm font-medium">Sort</span>
              <ChevronDown size={16} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Sort Dropdown */}
            {isSortOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10"
                style={{ border: "1px solid #7f6957" }}
              >
                <button
                  onClick={() => {
                    setSortBy("default");
                    setIsSortOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                    sortBy === "default" ? "font-bold" : ""
                  }`}
                  style={{ color: "#7f6957" }}
                >
                  Default
                </button>
                <button
                  onClick={() => {
                    setSortBy("price_asc");
                    setIsSortOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                    sortBy === "price_asc" ? "font-bold" : ""
                  }`}
                  style={{ color: "#7f6957" }}
                >
                  Price: Low to High
                </button>
                <button
                  onClick={() => {
                    setSortBy("price_desc");
                    setIsSortOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                    sortBy === "price_desc" ? "font-bold" : ""
                  }`}
                  style={{ color: "#7f6957" }}
                >
                  Price: High to Low
                </button>
              </div>
            )}
          </div>
          <div className="text-sm opacity-75" style={{ color: "#7f6957" }}>
            {cookieNumber} delicious options
          </div>
        </div>
      </div>

      {/* Product Grid Section with ID for navigation */}
      <section id="products" data-section="products">
        <ProductGrid setCookieNumber={setCookieNumber} sortBy={sortBy} />
      </section>

      {/* Floating Cart Bar */}
      <FloatingCardBar />
    </div>
  );
}
