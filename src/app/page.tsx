import Image from "next/image";
import { ShoppingBag, Filter, Menu } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import FloatingCardBar from "@/components/cart/FloatingCardBar";
import DeliveryNoti from "@/components/notification/DeliveryNoti";
import {Header} from "@/components/common";
import HeroSection from "@/components/common/HeroSection";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fefbdc" }}>
      {/* Header */}
      <Header/>

      {/* Delivery Notification */}
      <DeliveryNoti />

      {/* Hero Section */}
      <HeroSection/>

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
            6 delicious options
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid />

      {/* Floating Cart Bar */}
      <FloatingCardBar />
    </div>
  );
}
