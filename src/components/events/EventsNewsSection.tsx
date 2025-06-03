// src/components/events/EventsNewsSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Heart } from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  image: string;
  date: string;
  description: string;
  category: "event" | "news" | "special";
};

// Mock data - replace with actual data source later
const mockNewsItems: NewsItem[] = [
  {
    id: "1",
    title: "earthquake situation! ⚠️",
    image: "/events-and-news/earthquake.jpg",
    date: "March 25, 2025",
    description:
      "we are very sorry for the inconvenience caused. we are working on it and will be back soon.",
    category: "news",
  },
  {
    id: "2",
    title: "Valentine's day Promotion 💖",
    image: "/events-and-news/valentine.jpg",
    date: "February 14, 2025",
    description:
      "Happy valentine's day",
    category: "event",
  },
  {
    id: "3",
    title: "line official account",
    image: "/events-and-news/lineoa.jpg",
    date: "February 14, 2025",
    description:
      "join us",
    category: "special",
  },
  {
    id: "4",
    title: "cosci festival",
    image: "/events-and-news/cosci.jpg",
    date: "March 20, 2025",
    description:
      "come see us",
    category: "news",
  },
];

type Props = {};

const EventsNewsSection = (props: Props) => {
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  // Add useEffect to handle body scroll
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedItem]);

  const getCategoryIcon = (category: NewsItem["category"]) => {
    switch (category) {
      case "event":
        return <Calendar size={16} style={{ color: "#7f6957" }} />;
      case "special":
        return <Heart size={16} style={{ color: "#7f6957" }} />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: NewsItem["category"]) => {
    switch (category) {
      case "event":
        return "#eaf7ff";
      case "special":
        return "#fee2e2";
      case "news":
        return "#f0fdf4";
      default:
        return "#eaf7ff";
    }
  };

  return (
    <>
      <div className="px-4 mb-8">
        <div className="max-w-md mx-auto">
          {/* Section Header */}
          <div className="text-center mb-6">
            <h2
              className="text-2xl font-bold mb-2 comic-text"
              style={{ color: "#7f6957" }}
            >
              Events & News 📰
            </h2>
            <div className="flex justify-center items-center space-x-2 mb-3">
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
            <p
              className="text-sm opacity-80 comic-text"
              style={{ color: "#7f6957" }}
            >
              Stay updated with our latest happenings! ✨
            </p>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-2 gap-3">
            {mockNewsItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-transform relative"
              >
                {/* Category Badge */}
                <div
                  className="absolute top-2 left-2 z-10 px-2 py-1 rounded-full flex items-center space-x-1"
                  style={{ backgroundColor: getCategoryColor(item.category) }}
                >
                  {getCategoryIcon(item.category)}
                  <span
                    className="text-xs font-bold comic-text capitalize"
                    style={{ color: "#7f6957" }}
                  >
                    {item.category}
                  </span>
                </div>

                {/* Image */}
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3
                    className="font-bold text-sm mb-1 comic-text line-clamp-2"
                    style={{ color: "#7f6957" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-xs opacity-75 comic-text"
                    style={{ color: "#7f6957" }}
                  >
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-6">
            <button
              className="px-6 py-3 rounded-full text-sm font-bold text-white transform hover:scale-105 transition-transform comic-text"
              style={{ backgroundColor: "#7f6957" }}
            >
              View All Updates
            </button>
          </div>
        </div>
      </div>

      {/* Modal/Lightbox */}
      {selectedItem && (
        <div className="fixed inset-0 backdrop-blur-xs bg-white/30 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-3xl max-w-sm w-full max-h-[90vh] overflow-y-auto relative"
            style={{ backgroundColor: "#fefbdc" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center no-hover"
              style={{ backgroundColor: "#7f6957" }}
            >
              <X size={20} className="text-white" />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Category Badge */}
              <div className="flex justify-center mb-4">
                <div
                  className="px-4 py-2 rounded-full flex items-center space-x-2"
                  style={{
                    backgroundColor: getCategoryColor(selectedItem.category),
                  }}
                >
                  {getCategoryIcon(selectedItem.category)}
                  <span
                    className="text-sm font-bold comic-text capitalize"
                    style={{ color: "#7f6957" }}
                  >
                    {selectedItem.category}
                  </span>
                </div>
              </div>

              {/* Large Image */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <h2
                className="text-xl font-bold mb-3 comic-text text-center"
                style={{ color: "#7f6957" }}
              >
                {selectedItem.title}
              </h2>

              {/* Date */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Calendar size={16} style={{ color: "#7f6957" }} />
                <p
                  className="text-sm font-medium comic-text"
                  style={{ color: "#7f6957" }}
                >
                  {selectedItem.date}
                </p>
              </div>

              {/* Description */}
              <p
                className="text-base leading-relaxed text-center comic-text"
                style={{ color: "#7f6957" }}
              >
                {selectedItem.description}
              </p>

              {/* Action Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-8 py-3 rounded-full text-white font-bold transform hover:scale-105 transition-transform comic-text"
                  style={{ backgroundColor: "#7f6957" }}
                >
                  Got it! 👍
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventsNewsSection;
