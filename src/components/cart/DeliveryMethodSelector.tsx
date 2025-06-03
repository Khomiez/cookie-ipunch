import React from "react";
import { Store, Truck } from "lucide-react";

type DeliveryMethod = 'shipping' | 'pickup';

interface DeliveryMethodSelectorProps {
  deliveryMethod: DeliveryMethod;
  onDeliveryMethodChange: (method: DeliveryMethod) => void;
}

export default function DeliveryMethodSelector({
  deliveryMethod,
  onDeliveryMethodChange,
}: DeliveryMethodSelectorProps) {
  return (
    <div className="px-4 mb-6">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-bold mb-4 comic-text" style={{ color: "#7f6957" }}>
          Delivery Method 🚚
        </h3>
        
        <div className="space-y-3">
          {/* Pickup Option */}
          <button
            onClick={() => onDeliveryMethodChange('pickup')}
            className={`w-full p-4 rounded-2xl border-2 transition-all ${
              deliveryMethod === 'pickup'
                ? 'border-[#7f6957] shadow-lg'
                : 'border-gray-200 hover:border-[#7f6957]'
            }`}
            style={{ backgroundColor: deliveryMethod === 'pickup' ? "#eaf7ff" : "white" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${
                  deliveryMethod === 'pickup' ? 'bg-[#7f6957]' : 'bg-gray-100'
                }`}>
                  <Store size={20} className={deliveryMethod === 'pickup' ? 'text-white' : 'text-gray-500'} />
                </div>
                <div className="text-left">
                  <div className="font-bold comic-text" style={{ color: "#7f6957" }}>Pick Up</div>
                  <div className="text-sm opacity-75" style={{ color: "#7f6957" }}>Come say hi! 👋</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-green-600 comic-text">FREE</span>
                <span className="text-xs opacity-75" style={{ color: "#7f6957" }}>Ready Friday</span>
              </div>
            </div>
          </button>

          {/* Shipping Option */}
          <button
            onClick={() => onDeliveryMethodChange('shipping')}
            className={`w-full p-4 rounded-2xl border-2 transition-all ${
              deliveryMethod === 'shipping'
                ? 'border-[#7f6957] shadow-lg'
                : 'border-gray-200 hover:border-[#7f6957]'
            }`}
            style={{ backgroundColor: deliveryMethod === 'shipping' ? "#eaf7ff" : "white" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${
                  deliveryMethod === 'shipping' ? 'bg-[#7f6957]' : 'bg-gray-100'
                }`}>
                  <Truck size={20} className={deliveryMethod === 'shipping' ? 'text-white' : 'text-gray-500'} />
                </div>
                <div className="text-left">
                  <div className="font-bold comic-text" style={{ color: "#7f6957" }}>Home Delivery</div>
                  <div className="text-sm opacity-75" style={{ color: "#7f6957" }}>Straight to your door 🏠</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold comic-text" style={{ color: "#7f6957" }}>40.-</span>
                <span className="text-xs opacity-75" style={{ color: "#7f6957" }}>Friday delivery</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
} 