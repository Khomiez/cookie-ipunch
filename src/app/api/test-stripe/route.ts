// src/app/api/test-stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe-server";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Stripe configuration...");
    
    // Test 1: Check if Stripe is initialized
    if (!stripe) {
      throw new Error("Stripe not initialized");
    }
    
    // Test 2: Check environment variables
    const hasPublicKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
    
    console.log("Environment check:", { hasPublicKey, hasSecretKey });
    
    // Test 3: Make a simple API call to Stripe
    const account = await stripe.accounts.retrieve();
    
    console.log("Stripe account info:", {
      id: account.id,
      country: account.country,
      defaultCurrency: account.default_currency,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted
    });
    
    // Test 4: Get domain info
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 
                  `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    
    return NextResponse.json({
      success: true,
      checks: {
        stripeInitialized: true,
        hasPublicKey,
        hasSecretKey,
        accountId: account.id,
        country: account.country,
        chargesEnabled: account.charges_enabled,
        domain: domain
      },
      message: "Stripe configuration is working correctly!"
    });
    
  } catch (error) {
    console.error("Stripe test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      checks: {
        stripeInitialized: !!stripe,
        hasPublicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      }
    }, { status: 500 });
  }
}