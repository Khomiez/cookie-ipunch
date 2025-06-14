// src/app/api/webhooks/stripe/route.ts - Updated for enhanced Order model
import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe-server";
import connectToDatabase from "@/lib/mongodb";
import Order, { IOrder, IOrderItem, ICustomerDetails } from "@/models/Order";
import Stripe from "stripe";

// Disable body parsing, need raw body for Stripe webhook
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No Stripe signature found" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Connect to database
    try {
      await connectToDatabase();
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Handle the event
    switch (stripeEvent.type) {
      case "checkout.session.completed":
        const session = stripeEvent.data.object as Stripe.Checkout.Session;

        try {
          // Check if order already exists
          const existingOrder = await Order.findOne({
            stripeSessionId: session.id,
          });

          if (existingOrder) {
            console.log(`Order already exists for session ${session.id}`);
            break;
          }

          const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            session.id,
            { expand: ["line_items.data.price.product"] }
          );

          const orderData = await parseStripeSession(sessionWithLineItems);
          const newOrder = new Order(orderData);
          await newOrder.save();

          console.log(`New order created: ${newOrder.orderId}`);

          // TODO: Send confirmation email
          // TODO: Send notification to admin
          // TODO: Integrate with real-time updates (WebSocket/SSE)
        } catch (error) {
          console.error("Error processing completed session:", error);
          // Don't return error to Stripe - log for manual review
        }
        break;

      case "payment_intent.succeeded":
        const succeededPayment = stripeEvent.data
          .object as Stripe.PaymentIntent;

        try {
          // Update order payment status
          await Order.findOneAndUpdate(
            { stripePaymentIntentId: succeededPayment.id },
            {
              paymentStatus: "paid",
              $push: {
                statusHistory: {
                  status: "confirmed",
                  timestamp: new Date(),
                  updatedBy: "stripe_webhook",
                  notes: "Payment confirmed by Stripe",
                },
              },
            }
          );

          console.log(
            `Payment confirmed for payment intent: ${succeededPayment.id}`
          );
        } catch (error) {
          console.error("Error updating payment status:", error);
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = stripeEvent.data.object as Stripe.PaymentIntent;

        try {
          // Update order payment status
          await Order.findOneAndUpdate(
            { stripePaymentIntentId: failedPayment.id },
            {
              paymentStatus: "failed",
              $push: {
                statusHistory: {
                  status: "cancelled",
                  timestamp: new Date(),
                  updatedBy: "stripe_webhook",
                  notes: `Payment failed: ${
                    failedPayment.last_payment_error?.message || "Unknown error"
                  }`,
                },
              },
            }
          );

          console.error("Payment failed:", {
            id: failedPayment.id,
            amount: failedPayment.amount,
            currency: failedPayment.currency,
            lastPaymentError: failedPayment.last_payment_error,
          });

          // TODO: Send notification to customer about payment failure
          // TODO: Send notification to admin
        } catch (error) {
          console.error("Error updating failed payment status:", error);
        }
        break;

      case "checkout.session.expired":
        const expiredSession = stripeEvent.data
          .object as Stripe.Checkout.Session;

        try {
          // Mark order as cancelled if it exists
          await Order.findOneAndUpdate(
            { stripeSessionId: expiredSession.id },
            {
              status: "cancelled",
              $push: {
                statusHistory: {
                  status: "cancelled",
                  timestamp: new Date(),
                  updatedBy: "stripe_webhook",
                  notes: "Checkout session expired",
                },
              },
            }
          );

          console.log("Checkout session expired:", expiredSession.id);
        } catch (error) {
          console.error("Error handling expired session:", error);
        }
        break;

      case "charge.dispute.created":
        const dispute = stripeEvent.data.object as Stripe.Dispute;

        try {
          // Find order by payment intent and mark as disputed
          await Order.findOneAndUpdate(
            { stripePaymentIntentId: dispute.payment_intent as string },
            {
              paymentStatus: "failed",
              adminNotes: `Dispute created: ${dispute.reason} - ${dispute.id}`,
              $push: {
                statusHistory: {
                  status: "cancelled",
                  timestamp: new Date(),
                  updatedBy: "stripe_webhook",
                  notes: `Payment disputed: ${dispute.reason}`,
                },
              },
            }
          );

          console.log("Dispute created:", dispute.id);
          // TODO: Send urgent notification to admin
        } catch (error) {
          console.error("Error handling dispute:", error);
        }
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}

// Helper function to parse Stripe session data into our enhanced order format
async function parseStripeSession(
  session: Stripe.Checkout.Session
): Promise<Partial<IOrder>> {
  const lineItems = session.line_items?.data || [];

  // Parse customer details with enhanced validation
  const customerDetails: ICustomerDetails = {
    name:
      session.customer_details?.name ||
      session.custom_fields?.find((f) => f.key === "customer_name")?.text
        ?.value ||
      "Unknown Customer",
    email: session.customer_details?.email || "",
    phone: session.customer_details?.phone || "",
  };

  // Add address only if delivery method is shipping AND address is provided
  const deliveryMethod =
    (session.metadata?.delivery_method as "pickup" | "shipping") || "pickup";

  if (deliveryMethod === "shipping" && session.customer_details?.address) {
    customerDetails.address = {
      line1: session.customer_details.address.line1 || "",
      line2: session.customer_details.address.line2 || "",
      city: session.customer_details.address.city || "",
      state: session.customer_details.address.state || "",
      postal_code: session.customer_details.address.postal_code || "",
      country: session.customer_details.address.country || "TH",
    };
  }

  // Parse order items with enhanced data
  const items: IOrderItem[] = [];
  let subtotal = 0;
  let shippingFee = 0;

  for (const lineItem of lineItems) {
    const price = lineItem.price;
    const product = price?.product as Stripe.Product;

    if (product && product.name !== "Shipping Fee") {
      const itemPrice = (price?.unit_amount || 0) / 100; // Convert from satang to Baht
      const quantity = lineItem.quantity || 1;
      const itemTotal = itemPrice * quantity;

      items.push({
        productId: product.id,
        stripeProductId: product.id,
        stripePriceId: price?.id || "",
        name: product.name,
        description: product.description || "",
        price: itemPrice,
        quantity: quantity,
        image: product.images?.[0] || "",
        tag: product.metadata?.tag || "",
      });

      subtotal += itemTotal;
    } else if (product?.name === "Shipping Fee") {
      shippingFee = (lineItem.amount_total || 0) / 100;
    }
  }

  // Calculate delivery date (Friday delivery as per business model)
  const deliveryDate = getNextDeliveryDate();

  // Initialize status history
  const initialStatus: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled" = "pending";
  const statusHistory = [
    {
      status: initialStatus,
      timestamp: new Date(),
      updatedBy: "stripe_webhook",
      notes: "Order created from successful Stripe checkout",
    },
  ];

  return {
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent as string,
    customerDetails,
    items,
    subtotal,
    shippingFee,
    total: (session.amount_total || 0) / 100, // Convert from satang to Baht
    deliveryMethod,
    deliveryDate,
    status: initialStatus,
    paymentStatus: session.payment_status === "paid" ? "paid" : "pending",
    statusHistory,
    source: session.metadata?.source || "fatsprinkle_website",
    orderType: session.metadata?.order_type || "pre_order",
    customerNotes: session.metadata?.customer_notes || "",
  };
}

// Helper function to calculate next delivery date (Friday)
function getNextDeliveryDate(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday

  let daysUntilFriday;
  if (dayOfWeek <= 5) {
    // Sunday to Friday
    daysUntilFriday = 5 - dayOfWeek;
  } else {
    // Saturday
    daysUntilFriday = 6; // Next Friday
  }

  // If it's Friday but past delivery cutoff time (12 PM), move to next Friday
  if (dayOfWeek === 5 && today.getHours() >= 12) {
    daysUntilFriday = 7;
  }

  // If it's the same day and before cutoff, deliver today
  if (daysUntilFriday === 0 && today.getHours() < 12) {
    daysUntilFriday = 0;
  }

  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + daysUntilFriday);
  deliveryDate.setHours(14, 0, 0, 0); // 2 PM delivery time

  return deliveryDate;
}

// Helper function to send admin notifications (placeholder for future implementation)
async function sendAdminNotification(type: string, data: any) {
  // TODO: Implement admin notifications
  // This could be:
  // - WebSocket real-time updates
  // - Email notifications
  // - Slack/Discord webhooks
  // - Push notifications

  console.log(`Admin notification [${type}]:`, data);
}

// Helper function to send customer notifications (placeholder for future implementation)
async function sendCustomerNotification(
  type: string,
  customerEmail: string,
  data: any
) {
  // TODO: Implement customer notifications
  // This could be:
  // - Email confirmations
  // - SMS updates
  // - WhatsApp messages

  console.log(`Customer notification [${type}] to ${customerEmail}:`, data);
}