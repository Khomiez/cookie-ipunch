import React from "react";

type DeliveryMethod = 'shipping' | 'pickup';

interface OrderSummaryProps {
  totalItems: number;
  totalPrice: number;
  deliveryMethod: DeliveryMethod;
}

export default function OrderSummary({
  totalItems,
  totalPrice,
  deliveryMethod,
}: OrderSummaryProps) {
  const shippingFee = deliveryMethod === 'shipping' ? 40 : 0;
  const total = totalPrice + shippingFee;

  return (
    <div className="px-4 pb-40">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <h3 className="text-lg font-bold mb-4 comic-text" style={{ color: "#7f6957" }}>
            Order Summary 📝
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="comic-text" style={{ color: "#7f6957" }}>
                {totalItems} {totalItems !== 1 ? 'cookies' : 'cookie'}
              </span>
              <span className="font-bold comic-text" style={{ color: "#7f6957" }}>{totalPrice.toFixed(0)}.-</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="comic-text" style={{ color: "#7f6957" }}>
                {deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery 🚚'}
              </span>
              <span className={`font-bold comic-text ${shippingFee === 0 ? 'text-green-600' : ''}`} 
                    style={{ color: shippingFee === 0 ? "#16a34a" : "#7f6957" }}>
                {shippingFee === 0 ? 'FREE! 🎉' : `${shippingFee}.-`}
              </span>
            </div>
            
            <div className="border-t-2 border-dashed border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold comic-text" style={{ color: "#7f6957" }}>
                  Total
                </span>
                <span className="text-2xl font-bold comic-text" style={{ color: "#7f6957" }}>
                  {total.toFixed(0)}.-
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 