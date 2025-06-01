// src/components/product/ProductGrid.tsx
"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { IProduct } from "@/interfaces";

type Props = {
  setCookieNumber: (number: number) => void;
};

const ProductGrid = ({ setCookieNumber }: Props) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data);
        setCookieNumber(data.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <main className="px-4 pb-22">
        <div className="max-w-md mx-auto space-y-4">
          {/* Loading skeleton */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-4 shadow-lg animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div
                  className="w-20 h-20 rounded-2xl"
                  style={{ backgroundColor: "#f0f0f0" }}
                />
                <div className="flex-1 space-y-2">
                  <div
                    className="h-4 rounded"
                    style={{ backgroundColor: "#f0f0f0", width: "60%" }}
                  />
                  <div
                    className="h-3 rounded"
                    style={{ backgroundColor: "#f0f0f0", width: "80%" }}
                  />
                  <div
                    className="h-3 rounded"
                    style={{ backgroundColor: "#f0f0f0", width: "40%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-4 pb-22">
        <div className="max-w-md mx-auto text-center py-8">
          <p className="text-red-500 mb-4">Error loading products: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-full text-white font-bold"
            style={{ backgroundColor: "#7f6957" }}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main className="px-4 pb-22">
        <div className="max-w-md mx-auto text-center py-8">
          <p style={{ color: "#7f6957" }}>
            No products available at the moment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pb-22">
      <div className="max-w-md mx-auto space-y-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
};

export default ProductGrid;
