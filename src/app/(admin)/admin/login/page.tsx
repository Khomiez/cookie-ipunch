// src/app/(admin)/admin/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, Cookie, Heart } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store admin session info in sessionStorage for client-side checks
        sessionStorage.setItem(
          "fatsprinkle_admin_session",
          JSON.stringify({
            adminId: data.admin.id,
            username: data.admin.username,
            role: data.admin.role,
            permissions: data.admin.permissions,
          })
        );

        // Redirect to dashboard
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ backgroundColor: "#f8f6f0" }} // Softer background
    >
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 opacity-20">
        <Cookie size={60} style={{ color: "#7f6957" }} />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <Heart size={40} style={{ color: "#7f6957" }} />
      </div>
      <div className="absolute top-1/4 right-20 opacity-10">
        <div
          className="w-32 h-32 rounded-full"
          style={{ backgroundColor: "#eaf7ff" }}
        />
      </div>
      <div className="absolute bottom-1/4 left-20 opacity-10">
        <div
          className="w-24 h-24 rounded-full"
          style={{ backgroundColor: "#fef3c7" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative"
              style={{ 
                backgroundColor: "#7f6957",
                boxShadow: "0 8px 30px rgba(127, 105, 87, 0.2)"
              }}
            >
              <Cookie size={36} className="text-white" />
              <div 
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#eaf7ff" }}
              >
                <span className="text-xs">✨</span>
              </div>
            </div>
          </div>
          <h1
            className="text-2xl font-bold mb-3 comic-text"
            style={{ color: "#7f6957" }}
          >
            Welcome Back! 👋
          </h1>
          <p
            className="text-base opacity-80 comic-text leading-relaxed"
            style={{ color: "#7f6957" }}
          >
            Let's manage your sweet cookie empire
          </p>
        </div>

        {/* Login Form */}
        <div 
          className="rounded-3xl shadow-xl p-8 backdrop-blur-sm border border-white/30"
          style={{ 
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            boxShadow: "0 20px 60px rgba(127, 105, 87, 0.1)"
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="text-sm font-medium mb-3 comic-text flex items-center space-x-2"
                style={{ color: "#7f6957" }}
              >
                <User size={16} />
                <span>Username</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none transition-all comic-text placeholder:opacity-60"
                  style={{ 
                    backgroundColor: "#fefbdc", 
                    borderColor: "#e5e7eb",
                    color: "#7f6957"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#7f6957"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium mb-3 comic-text flex items-center space-x-2"
                style={{ color: "#7f6957" }}
              >
                <Lock size={16} />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border-2 rounded-2xl focus:outline-none transition-all comic-text placeholder:opacity-60"
                  style={{ 
                    backgroundColor: "#fefbdc", 
                    borderColor: "#e5e7eb",
                    color: "#7f6957"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#7f6957"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:opacity-80 transition-opacity"
                >
                  {showPassword ? (
                    <EyeOff size={18} style={{ color: "#7f6957" }} className="opacity-60" />
                  ) : (
                    <Eye size={18} style={{ color: "#7f6957" }} className="opacity-60" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="rounded-2xl p-4 border"
                style={{ 
                  backgroundColor: "#fef2f2", 
                  borderColor: "#fecaca"
                }}
              >
                <p className="text-red-600 text-sm comic-text text-center flex items-center justify-center space-x-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl text-white font-medium text-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none comic-text shadow-lg"
              style={{ 
                backgroundColor: "#7f6957",
                boxShadow: "0 8px 30px rgba(127, 105, 87, 0.3)"
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <span>🍪</span>
                </div>
              )}
            </button>
          </form>

          {/* Friendly Footer Message */}
          <div className="text-center mt-6">
            <p
              className="text-sm opacity-70 comic-text"
              style={{ color: "#7f6957" }}
            >
              Ready to bake some amazing experiences? ✨
            </p>
          </div>
        </div>

        {/* Footer with credentials hint for development */}
        <div className="text-center mt-8">
          <p
            className="text-sm opacity-60 comic-text"
            style={{ color: "#7f6957" }}
          >
            © 2025 fatsprinkle.co - Made with 💕
          </p>
          {process.env.NODE_ENV === "development" && (
            <div 
              className="mt-4 p-4 rounded-2xl border border-white/50 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(234, 247, 255, 0.8)" }}
            >
              <p
                className="text-sm font-medium mb-2 comic-text"
                style={{ color: "#7f6957" }}
              >
                🛠️ Development Mode
              </p>
              <div className="text-xs space-y-1 comic-text" style={{ color: "#7f6957" }}>
                <p><strong>Username:</strong> judzuii</p>
                <p><strong>Password:</strong> devbyjudzuii</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}