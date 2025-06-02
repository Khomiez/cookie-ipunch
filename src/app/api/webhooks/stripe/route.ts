// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe-server";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Payment succeeded:", session.id);

      // TODO: Implement order fulfillment
      // 1. Save order to MongoDB
      // 2. Send confirmation email
      // 3. Update inventory if applicable
      // 4. Send notification to admin

      try {
        // Get session details with line items
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          session.id,
          { expand: ["line_items.data.price.product"] }
        );

        console.log("Order details:", {
          sessionId: session.id,
          customerEmail: session.customer_details?.email,
          amount: session.amount_total,
          currency: session.currency,
          paymentStatus: session.payment_status,
          shippingAddress: session.customer_details?.address,
          lineItems: sessionWithLineItems.line_items?.data,
        });

        // Here you would save to your database
        // await saveOrderToDatabase(sessionWithLineItems);
      } catch (error) {
        console.error("Error processing completed session:", error);
      }

      break;

    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object);
      // TODO: Handle failed payment (notify customer, log for admin)
      break;

    case "checkout.session.expired":
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session expired:", expiredSession.id);

      // TODO: Optionally notify customer about expired session
      // Could send email reminder with cart recovery link
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log("Payment failed:", {
        id: failedPayment.id,
        amount: failedPayment.amount,
        currency: failedPayment.currency,
        lastPaymentError: failedPayment.last_payment_error,
      });

      // TODO: Handle failed payment
      // 1. Log the failure reason
      // 2. Send notification to customer with retry options
      // 3. Update analytics/metrics
      // 4. Possibly send to admin for review if frequent failures
      break;

    case "payment_intent.requires_action":
      const actionRequired = event.data.object as Stripe.PaymentIntent;
      console.log("Payment requires additional action:", actionRequired.id);

      // This is typically handled automatically by Stripe's frontend
      // but you might want to log it for analytics
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
