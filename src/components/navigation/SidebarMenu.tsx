// src/components/navigation/SidebarMenu.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, ShoppingBag, Heart, Instagram, Music, ExternalLink, Star, Sparkles } from "lucide-react";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Delay hiding to allow animation to complete
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const scrollToSection = (sectionId: string) => {
    // First navigate to home page
    router.push('/');
    
    // Use setTimeout to ensure navigation completes before scrolling
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        onClose();
      } else {
        // If ID doesn't exist, try class-based scrolling
        const eventsSection = document.querySelector('[data-section="events"]');
        const productsSection = document.querySelector('[data-section="products"]');
        
        if (sectionId === 'events' && eventsSection) {
          eventsSection.scrollIntoView({ behavior: 'smooth' });
          onClose();
        } else if (sectionId === 'products' && productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth' });
          onClose();
        }
      }
    }, 500); // Small delay to ensure navigation completes
  };

  const menuItems = [
    {
      icon: Calendar,
      title: "Events & News",
      subtitle: "What's happening? ✨",
      action: () => scrollToSection('events'),
      gradient: "from-blue-100 to-cyan-100",
      iconBg: "#eaf7ff",
      iconColor: "#7f6957"
    },
    {
      icon: ShoppingBag,
      title: "Buy Cookies",
      subtitle: "Fresh baked goodness 🍪",
      action: () => scrollToSection('products'),
      gradient: "from-orange-100 to-yellow-100",
      iconBg: "#fef3c7",
      iconColor: "#7f6957"
    }
  ];

  const socialLinks = [
    {
      icon: Instagram,
      name: "Instagram",
      handle: "@fatsprinkle.co",
      url: "https://instagram.com/fatsprinkle.co",
      color: "#E4405F",
      bgColor: "#fce7f3"
    },
    {
      icon: Music,
      name: "TikTok",
      handle: "@fatsprinkle",
      url: "https://www.tiktok.com/@fatsprinkle.co",
      color: "#000000",
      bgColor: "#f3f4f6"
    }
  ];

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: "#fefbdc" }}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#7f6957]/10">
            <div>
              <h2 className="text-xl font-bold comic-text" style={{ color: "#7f6957" }}>
                Menu ✨
              </h2>
              <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
                Explore our sweet world
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transform hover:scale-105 transition-transform shadow-md"
              style={{ backgroundColor: "#7f6957" }}
              aria-label="Close menu"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Navigation Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 comic-text flex items-center" style={{ color: "#7f6957" }}>
                <Sparkles size={18} className="mr-2" />
                Navigate
              </h3>
              
              <div className="space-y-3">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className={`w-full p-4 rounded-2xl bg-gradient-to-r ${item.gradient} border border-white/50 shadow-sm transform hover:scale-[1.02] transition-all duration-200 text-left`}
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: item.iconBg }}
                      >
                        <item.icon size={20} style={{ color: item.iconColor }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold comic-text" style={{ color: "#7f6957" }}>
                          {item.title}
                        </h4>
                        <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
                          {item.subtitle}
                        </p>
                      </div>
                      <ExternalLink size={16} className="opacity-50" style={{ color: "#7f6957" }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* About Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 comic-text flex items-center" style={{ color: "#7f6957" }}>
                <Heart size={18} className="mr-2" />
                About Us
              </h3>
              
              <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#7f6957]/10">
                <p className="text-sm leading-relaxed comic-text mb-3" style={{ color: "#7f6957" }}>
                  We're a cozy bakery making fresh cookies with love! 🍪💕 
                  Follow us for behind-the-scenes moments and sweet updates.
                </p>
                
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#eaf7ff" }}
                  >
                    <Star size={14} style={{ color: "#7f6957" }} />
                  </div>
                  <span className="text-sm font-medium comic-text" style={{ color: "#7f6957" }}>
                    Made with love in Thailand
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold comic-text opacity-75" style={{ color: "#7f6957" }}>
                  Find us on social media:
                </h4>
                
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-3 rounded-xl transform hover:scale-[1.02] transition-all duration-200 shadow-sm border border-white/50"
                    style={{ backgroundColor: social.bgColor }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "white" }}
                      >
                        <social.icon size={18} style={{ color: social.color }} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-sm comic-text" style={{ color: "#7f6957" }}>
                          {social.name}
                        </h5>
                        <p className="text-xs opacity-75 comic-text" style={{ color: "#7f6957" }}>
                          {social.handle}
                        </p>
                      </div>
                      <ExternalLink size={14} className="opacity-50" style={{ color: "#7f6957" }} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#7f6957]/10">
            <div className="text-center">
              <p className="text-xs opacity-75 comic-text mb-2" style={{ color: "#7f6957" }}>
                © 2025 fatprinkle.co
              </p>
              <p className="text-xs opacity-50 comic-text" style={{ color: "#7f6957" }}>
                Spreading sweetness, one cookie at a time 🍪✨
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;