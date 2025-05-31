import Image from "next/image";
import { ShoppingBag, User, Filter, Bell } from "lucide-react";

export default function Home() {
  const products = [
    {
      id: 1,
      name: "Original Cookie",
      description: "Dark Chocolate | Chocolate Chunk",
      price: 49,
      image: "/api/placeholder/300/300",
      tag: "Popular"
    },
    {
      id: 2,
      name: "Nutella Cookie",
      description: "Plain Dough | Nutella",
      price: 49,
      image: "/api/placeholder/300/300",
      tag: "New"
    },
    {
      id: 3,
      name: "S'mores Cookie",
      description: "Cracker | Marshmallow | Chocolate Chunk",
      price: 49,
      image: "/api/placeholder/300/300",
      tag: "Recommend"
    },
    {
      id: 4,
      name: "Double Chocolate",
      description: "Rich Cocoa | Dark Chocolate Chips",
      price: 52,
      image: "/api/placeholder/300/300",
      tag: "Limited"
    },
    {
      id: 5,
      name: "Strawberry Crumble",
      description: "Fresh Strawberry | Vanilla Crumble",
      price: 55,
      image: "/api/placeholder/300/300",
      tag: "Seasonal"
    },
    {
      id: 6,
      name: "Matcha White Chocolate",
      description: "Premium Matcha | White Chocolate",
      price: 58,
      image: "/api/placeholder/300/300",
      tag: "Premium"
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fefbdc' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3" style={{ backgroundColor: '#fefbdc' }}>
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#7f6957' }}>
            <Image
                src="/brand-images/fatsprinkle-logo.jpg"
                alt="Fat Sprinkle Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#7f6957', fontFamily: 'Comic Sans MS, cursive' }}>
              fatsprinkle.co
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative">
              <ShoppingBag size={24} style={{ color: '#7f6957' }} />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center" style={{ backgroundColor: '#7f6957' }}>
                3
              </span>
            </button>
            <button>
              <User size={24} style={{ color: '#7f6957' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Delivery Notification */}
      <div className="mx-4 mb-4">
        <div className="max-w-md mx-auto p-3 rounded-2xl flex items-center space-x-3" style={{ backgroundColor: '#eaf7ff' }}>
          <Bell size={20} style={{ color: '#7f6957' }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: '#7f6957' }}>Next Delivery: Friday, March 28</p>
            <p className="text-xs opacity-75" style={{ color: '#7f6957' }}>Order by Wednesday to get fresh cookies!</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#7f6957', fontFamily: 'Comic Sans MS, cursive' }}>
            Our Menu!
          </h2>
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7f6957' }}></div>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eaf7ff' }}></div>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7f6957' }}></div>
          </div>
          <p className="text-sm opacity-80" style={{ color: '#7f6957' }}>
            Freshly baked cookies made with love, delivered to your door
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-full border-2 border-dashed" style={{ borderColor: '#7f6957', color: '#7f6957' }}>
            <Filter size={16} />
            <span className="text-sm font-medium">Filter & Sort</span>
          </button>
          <div className="text-sm opacity-75" style={{ color: '#7f6957' }}>
            6 delicious options
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="px-4 pb-24">
        <div className="max-w-md mx-auto space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl p-4 shadow-lg relative overflow-hidden" style={{ isolation: 'isolate' }}>
              {/* Decorative sprinkles */}
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-30" style={{ backgroundColor: '#eaf7ff' }}></div>
              <div className="absolute top-4 right-6 w-1 h-1 rounded-full opacity-50" style={{ backgroundColor: '#7f6957' }}></div>
              <div className="absolute top-6 right-3 w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: '#eaf7ff' }}></div>
              
              {/* Product Tag */}
              {product.tag && (
                <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-24px)]">
                  <div className="px-2 py-1 rounded-full text-xs font-bold text-white transform -rotate-12 whitespace-nowrap" style={{ backgroundColor: '#7f6957' }}>
                    {product.tag}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0" style={{ backgroundColor: '#fefbdc' }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full" style={{ backgroundColor: '#eaf7ff' }}>
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍪</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1" style={{ color: '#7f6957', fontFamily: 'Comic Sans MS, cursive' }}>
                    {product.name}
                  </h3>
                  <p className="text-sm opacity-75 mb-2" style={{ color: '#7f6957' }}>
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold" style={{ color: '#7f6957' }}>
                        {product.price}.-
                      </span>
                    </div>
                    <button className="px-4 py-2 rounded-full text-sm font-bold text-white transform hover:scale-105 transition-transform" style={{ backgroundColor: '#7f6957' }}>
                      Pre-order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ backgroundColor: '#fefbdc' }}>
        <div className="max-w-md mx-auto">
          <button className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 transition-transform" style={{ backgroundColor: '#7f6957' }}>
            <ShoppingBag size={24} />
            <span>View Cart (3 items)</span>
            <span className="bg-white text-black px-2 py-1 rounded-full text-sm font-bold">
              147.-
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}