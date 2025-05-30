// src/components/providers/ReduxProvider.tsx
"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import CartHydrationProvider from "./CartHydrationProvider";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <CartHydrationProvider>
        {children}
      </CartHydrationProvider>
    </Provider>
  );
}