import React from "react";
import ProductCard from "./ProductCard";
import { IProduct } from "@/interfaces";

type Props = {};

const ProductGrid = (props: Props) => {
  const products: IProduct[] = [
    {
      id: 1,
      name: "Original Cookie",
      description: "Dark Chocolate | Chocolate Chunk",
      price: 49,
      image: "/api/placeholder/300/300",
      tag: "Popular",
    },
    {
      id: 2,
      name: "Nutella Cookie",
      description: "Plain Dough | Nutella",
      price: 49,
      image: "/api/placeholder/300/300",
      tag: "New",
    },
    {
      id: 3,
      name: "S'mores Cookie",
      description: "Cracker | Marshmallow | Chocolate Chunk",
      price: 49,
      image: "/api/placeholder/300/300",
      tag: "Recommend",
    },
    {
      id: 4,
      name: "Double Chocolate",
      description: "Rich Cocoa | Dark Chocolate Chips",
      price: 52,
      image: "/api/placeholder/300/300",
      tag: "Limited",
    },
    {
      id: 5,
      name: "Strawberry Crumble",
      description: "Fresh Strawberry | Vanilla Crumble",
      price: 55,
      image: "/api/placeholder/300/300",
      tag: "Seasonal",
    },
    {
      id: 6,
      name: "Matcha White Chocolate",
      description: "Premium Matcha | White Chocolate",
      price: 58,
      image: "/api/placeholder/300/300",
      tag: "Premium",
    },
  ];

  return (
    <main className="px-4 pb-24">
      <div className="max-w-md mx-auto space-y-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product}/>
        ))}
      </div>
    </main>
  );
};

export default ProductGrid;
