// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe-server";
import { CartItem } from "@/store/slices/cartSlice";

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: CartItem[] } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Convert cart items to Stripe line items using Price IDs
    const lineItems = items.map((item) => {
      // Check if the item has a priceId (from Stripe)
      if (item.priceId) {
        return {
          price: item.priceId, // Use Stripe Price ID directly
          quantity: item.quantity,
        };
      } else {
        // Fallback for items without priceId (legacy/mock data)
        return {
          price_data: {
            currency: "thb",
            product_data: {
              name: item.name,
              description: item.description,
              metadata: {
                product_id: item.id.toString(),
                tag: item.tag || "",
              },
            },
            unit_amount: Math.round(item.price * 100), // Convert Baht to cents for Stripe
          },
          quantity: item.quantity,
        };
      }
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/cart`,
      metadata: {
        source: "fatsprinkle_preorder",
        order_type: "pre_order",
      },
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["TH"], // Thailand only for now
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}