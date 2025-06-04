// src/app/(admin)/admin/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, Shield } from "lucide-react";

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
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: "#fefbdc" }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "#7f6957" }}
            >
              <Shield size={32} className="text-white" />
            </div>
          </div>
          <h1
            className="text-3xl font-bold mb-2 comic-text"
            style={{ color: "#7f6957" }}
          >
            Admin Portal
          </h1>
          <p
            className="text-lg opacity-75 comic-text"
            style={{ color: "#7f6957" }}
          >
            Welcome back to fatsprinkle.co
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold mb-2 comic-text"
                style={{ color: "#7f6957" }}
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User
                    size={20}
                    style={{ color: "#7f6957" }}
                    className="opacity-50"
                  />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#7f6957] focus:outline-none transition-colors comic-text"
                  style={{ backgroundColor: "#fefbdc" }}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold mb-2 comic-text"
                style={{ color: "#7f6957" }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock
                    size={20}
                    style={{ color: "#7f6957" }}
                    className="opacity-50"
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#7f6957] focus:outline-none transition-colors comic-text"
                  style={{ backgroundColor: "#fefbdc" }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff
                      size={20}
                      style={{ color: "#7f6957" }}
                      className="opacity-50 hover:opacity-75"
                    />
                  ) : (
                    <Eye
                      size={20}
                      style={{ color: "#7f6957" }}
                      className="opacity-50 hover:opacity-75"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm comic-text text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-white font-bold text-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none comic-text shadow-lg"
              style={{ backgroundColor: "#7f6957" }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer with credentials hint for development */}
        <div className="text-center mt-8">
          <p
            className="text-sm opacity-75 comic-text"
            style={{ color: "#7f6957" }}
          >
            © 2025 fatsprinkle.co - Admin Dashboard
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <p
                className="text-xs font-bold mb-1"
                style={{ color: "#7f6957" }}
              >
                Development Credentials:
              </p>
              <p className="text-xs opacity-75" style={{ color: "#7f6957" }}>
                Username: judzuii
                <br />
                Password: devbyjudzuii
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
