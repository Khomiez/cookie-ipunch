// src/components/providers/CartHydrationProvider.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/redux";
import { initializeCart } from "@/store/slices/cartSlice";

export default function CartHydrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize cart from localStorage after component mounts
    dispatch(initializeCart());
  }, [dispatch]);

  return <>{children}</>;
}
