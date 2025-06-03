// src/components/events/EventsNewsSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Heart, Star, Bell, ArrowRight } from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  image: string;
  date: string;
  description: string;
  category: "event" | "news" | "special";
  link?: string;
};

// Mock data with better structure
const mockNewsItems: NewsItem[] = [
  {
    id: "1",
    title: "Earthquake Situation Update ⚠️",
    image: "/events-and-news/earthquake.jpg",
    date: "March 25, 2025",
    description:
      "We're working hard to get back to baking your favorite cookies. Thank you for your patience during this time. We'll update you as soon as we're ready to deliver sweet moments again! 🍪💕",
    category: "news",
  },
  {
    id: "2",
    title: "Valentine's Sweet Treats 💖",
    image: "/events-and-news/valentine.jpg",
    date: "February 14, 2025",
    description:
      "Love is in the air and in every bite! Special heart-shaped cookies and romantic gift packages available. Spread the sweetness with someone special! 💕🍪",
    category: "event",
  },
  {
    id: "3",
    title: "Join Our LINE Family! 📱",
    image: "/events-and-news/lineoa.jpg",
    date: "February 10, 2025",
    description:
      "Get exclusive updates, special promotions, and be the first to know about new cookie flavors! Join our cozy LINE community today! 🌟",
    category: "special",
    link: "https://linktr.ee/fatsprinkle.co",
  },
  {
    id: "4",
    title: "COSCI Festival Adventure 🎪",
    image: "/events-and-news/cosci.jpg",
    date: "March 20, 2025",
    description:
      "Come find us at the COSCI Festival! We'll be serving fresh cookies and spreading smiles. Don't miss our festival-exclusive flavors! 🎉🍪",
    category: "event",
  },
];

type Props = {};

const EventsNewsSection = (props: Props) => {
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Show only 2 items initially
  const displayedItems = showAll ? mockNewsItems : mockNewsItems.slice(0, 2);

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedItem]);

  const getCategoryIcon = (category: NewsItem["category"]) => {
    switch (category) {
      case "event":
        return <Calendar size={14} style={{ color: "#7f6957" }} />;
      case "special":
        return <Star size={14} style={{ color: "#7f6957" }} />;
      case "news":
        return <Bell size={14} style={{ color: "#7f6957" }} />;
      default:
        return <Bell size={14} style={{ color: "#7f6957" }} />;
    }
  };

  const getCategoryStyle = (category: NewsItem["category"]) => {
    switch (category) {
      case "event":
        return {
          backgroundColor: "#eaf7ff",
          borderColor: "#7f6957",
        };
      case "special":
        return {
          backgroundColor: "#fef3c7",
          borderColor: "#d97706",
        };
      case "news":
        return {
          backgroundColor: "#f0f9ff",
          borderColor: "#0369a1",
        };
      default:
        return {
          backgroundColor: "#eaf7ff",
          borderColor: "#7f6957",
        };
    }
  };

  const formatDescription = (description: string, maxLength: number = 60) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  return (
    <div className="px-4 mb-6" role="region" aria-label="Events and News">
      <div className="max-w-md mx-auto">
        {/* Header with better semantic structure */}
        <header className="text-center mb-5">
          <h2
            className="text-xl font-bold mb-2 comic-text"
            style={{ color: "#7f6957" }}
          >
            What's New? ✨
          </h2>
          <p
            className="text-sm opacity-70 comic-text"
            style={{ color: "#7f6957" }}
          >
            Stay in the loop with our sweet updates
          </p>
        </header>

        {/* News Cards - Stacked Design */}
        <div
          className="space-y-3"
          role="feed"
          aria-label="News and events feed"
        >
          {displayedItems.map((item, index) => {
            const categoryStyle = getCategoryStyle(item.category);

            return (
              <article
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer transform hover:scale-[1.02] transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-[#7f6957] focus:ring-opacity-50"
                style={{
                  boxShadow: "0 2px 12px rgba(127, 105, 87, 0.08)",
                }}
                role="button"
                tabIndex={0}
                aria-label={`Read more about ${item.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedItem(item);
                  }
                }}
              >
                <div className="flex items-center p-4">
                  {/* Image */}
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 mr-4"
                    style={{ backgroundColor: "#fefbdc" }}
                  >
                    <img
                      src={item.image}
                      alt={`${item.title} featured image`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Category Badge */}
                    <div className="flex items-center mb-2">
                      <div
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-full border"
                        style={{
                          backgroundColor: categoryStyle.backgroundColor,
                          borderColor: categoryStyle.borderColor,
                          borderWidth: "1px",
                        }}
                      >
                        {getCategoryIcon(item.category)}
                        <span
                          className="text-xs font-medium comic-text capitalize"
                          style={{ color: "#7f6957" }}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="font-bold text-sm mb-1 comic-text line-clamp-1"
                      style={{ color: "#7f6957" }}
                    >
                      {item.title}
                    </h3>

                    {/* Description preview */}
                    <p
                      className="text-xs opacity-70 comic-text line-clamp-2 mb-1"
                      style={{ color: "#7f6957" }}
                    >
                      {formatDescription(item.description)}
                    </p>

                    {/* Date */}
                    <time
                      className="text-xs opacity-50 comic-text"
                      style={{ color: "#7f6957" }}
                      dateTime={item.date}
                    >
                      {item.date}
                    </time>
                  </div>

                  {/* Arrow indicator */}
                  <div className="ml-2" aria-hidden="true">
                    <ArrowRight
                      size={16}
                      className="opacity-40"
                      style={{ color: "#7f6957" }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {mockNewsItems.length > 2 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="no-hover px-4 py-2 rounded-full text-sm font-medium border-2 border-dashed comic-text focus:outline-none focus:ring-2 focus:ring-[#7f6957] focus:ring-opacity-50"
              style={{
                borderColor: "#7f6957",
                color: "#7f6957",
                backgroundColor: "transparent",
              }}
              aria-expanded={showAll}
              aria-controls="news-feed"
            >
              {showAll
                ? "Show Less"
                : `View All (${mockNewsItems.length - 2} more)`}
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in duration-200 scrollbar-hide focus:outline-none"
            style={{
              backgroundColor: "#fefbdc",
              boxShadow: "0 20px 60px rgba(127, 105, 87, 0.2)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            tabIndex={-1}
          >
            {/* Hide scrollbar for Chrome, Safari and Opera */}
            <style jsx global>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center no-hover shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              style={{ backgroundColor: "#7f6957" }}
              aria-label="Close modal"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Category Badge - Top Center */}
              <div className="flex justify-center mb-4">
                <div
                  className="px-4 py-2 rounded-full flex items-center space-x-2 border"
                  style={{
                    ...getCategoryStyle(selectedItem.category),
                    borderWidth: "2px",
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
              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-5 shadow-lg">
                <img
                  src={selectedItem.image}
                  alt={`${selectedItem.title} detailed view`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <h2
                id="modal-title"
                className="text-xl font-bold mb-3 comic-text text-center leading-tight"
                style={{ color: "#7f6957" }}
              >
                {selectedItem.title}
              </h2>

              {/* Date with icon */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#eaf7ff" }}
                >
                  <Calendar size={14} style={{ color: "#7f6957" }} />
                </div>
                <time
                  className="text-sm font-medium comic-text"
                  style={{ color: "#7f6957" }}
                  dateTime={selectedItem.date}
                >
                  {selectedItem.date}
                </time>
              </div>

              {/* Description */}
              <div
                className="bg-white rounded-2xl p-4 mb-6 shadow-sm"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
              >
                <p
                  id="modal-description"
                  className="text-base leading-relaxed comic-text text-center"
                  style={{ color: "#7f6957" }}
                >
                  {selectedItem.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full px-6 py-3 rounded-2xl text-white font-bold transform hover:scale-105 transition-transform comic-text shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  style={{ backgroundColor: "#7f6957" }}
                >
                  Got it! 👍
                </button>

                {selectedItem.category === "special" && (
                  <button
                    onClick={() => {
                      if (selectedItem.link) {
                        window.open(selectedItem.link, '_blank');
                      }
                    }}
                    className="no-hover text-sm font-medium hover:opacity-80 transition-opacity focus:outline-none focus:underline"
                    style={{ color: "#7f6957" }}
                  >
                    Learn more →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsNewsSection;
