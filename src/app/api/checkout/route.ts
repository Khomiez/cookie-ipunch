// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe-server";
import Stripe from "stripe";
import { CartItem } from "@/store/slices/cartSlice";

export async function POST(request: NextRequest) {
  try {
    console.log("=== CHECKOUT API STARTED ===");
    
    // Step 1: Parse request body
    const { 
      items,
      deliveryMethod,
    }: { 
      items: CartItem[],
      deliveryMethod: 'shipping' | 'pickup',
    } = await request.json();
    
    console.log("Received items:", items?.length || 0);

    // Step 2: Validate input
    if (!items || items.length === 0) {
      console.error("❌ No items in cart");
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!deliveryMethod) {
      console.error("❌ Delivery method not selected");
      return NextResponse.json({ error: "Please select a delivery method" }, { status: 400 });
    }

    // Step 3: Check Stripe initialization
    if (!stripe) {
      console.error("❌ Stripe not initialized");
      return NextResponse.json({ error: "Payment system not available" }, { status: 500 });
    }

    // Step 4: Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY not found");
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 });
    }

    // Step 5: Get domain
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 
                  `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    console.log("✅ Using domain:", domain);

    // Step 6: Process line items
    console.log("📦 Processing line items...");
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      console.log(`Processing: ${item.name} (ID: ${item.id})`);
      
      // Validate item
      if (!item.id || !item.name || !item.price || item.quantity <= 0) {
        throw new Error(`Invalid item: ${item.name || 'Unknown'}`);
      }

      // Use price_data for all payment methods
      lineItems.push({
        price_data: {
          currency: "thb",
          product_data: {
            name: item.name,
            description: item.description || `Delicious ${item.name} cookies`,
            images: item.image && item.image !== '/api/placeholder/300/300' ? [item.image] : [],
            metadata: {
              product_id: item.id.toString(),
              tag: item.tag || "",
            },
          },
          unit_amount: Math.round(item.price * 100), // Convert Baht to satang
        },
        quantity: item.quantity,
      });
    }

    // Add shipping fee if delivery method is shipping
    if (deliveryMethod === 'shipping') {
      lineItems.push({
        price_data: {
          currency: "thb",
          product_data: {
            name: "Shipping Fee",
            description: "Delivery fee for shipping",
          },
          unit_amount: 4000, // 40 THB in satang
        },
        quantity: 1,
      });
    }

    console.log(`✅ Created ${lineItems.length} line items`);

    // Step 7: Configure payment methods
    const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = ["card", "promptpay"];

    console.log("🔄 Creating Stripe checkout session with payment methods:", paymentMethodTypes);
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: paymentMethodTypes,
      line_items: lineItems,
      mode: "payment",
      success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/cart`,
      metadata: {
        source: "fatsprinkle_preorder",
        order_type: "pre_order",
        total_items: items.reduce((sum, item) => sum + item.quantity, 0).toString(),
        delivery_method: deliveryMethod,
      },
      customer_email: request.headers.get('x-user-email') || undefined,
      billing_address_collection: deliveryMethod === 'shipping' ? 'required' : 'auto',
      shipping_address_collection: deliveryMethod === 'shipping' ? {
        allowed_countries: ["TH"],
      } : undefined,
      phone_number_collection: {
        enabled: true,
      },
      customer_creation: "always",
      locale: "th",
      automatic_tax: {
        enabled: false,
      },
      custom_fields: [
        {
          key: 'customer_name',
          label: {
            type: 'custom',
            custom: 'ชื่อผู้รับ',
          },
          type: 'text',
          optional: false,
        },
      ],
    };

    console.log("Session params:", JSON.stringify(sessionParams, null, 2));

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("✅ Stripe session created:", session.id);
    console.log("✅ Checkout URL:", session.url);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error("❌ CHECKOUT ERROR:", error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n')
      });
    }

    // Return appropriate error response
    const isDev = process.env.NODE_ENV === 'development';
    const errorMessage = error instanceof Error ? error.message : "Checkout failed";
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: isDev ? {
          type: error?.constructor?.name,
          stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined
        } : undefined
      },
      { status: 500 }
    );
  }
}