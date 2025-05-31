import { Bell } from "lucide-react";
import React from "react";

type Props = {};

const DeliveryNoti = (props: Props) => {
  return (
    <div className="mx-4 mb-4">
      <div
        className="max-w-md mx-auto p-3 rounded-2xl flex items-center space-x-3"
        style={{ backgroundColor: "#eaf7ff" }}
      >
        <Bell size={20} style={{ color: "#7f6957" }} />
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: "#7f6957" }}>
            Next Delivery: Friday, March 28
          </p>
          <p className="text-xs opacity-75" style={{ color: "#7f6957" }}>
            Order by Wednesday to get fresh cookies!
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryNoti;
