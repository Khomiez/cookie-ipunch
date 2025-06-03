// src/app/api/webhooks/stripe/route.ts
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
          const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            session.id,
            { expand: ["line_items.data.price.product"] }
          );

          const orderData = await parseStripeSession(sessionWithLineItems);
          const newOrder = new Order({
            ...orderData,
            orderId: `FS${new Date().toISOString().slice(2, 10).replace(/-/g, "")}001`
          });
          await newOrder.save();
          
          // TODO: Send confirmation email
          // TODO: Send notification to admin
        } catch (error) {
          console.error("Error processing completed session:", error);
          // Don't return error to Stripe - log for manual review
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = stripeEvent.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", {
          id: failedPayment.id,
          amount: failedPayment.amount,
          currency: failedPayment.currency,
          lastPaymentError: failedPayment.last_payment_error,
        });
        // TODO: Update order status if exists
        // TODO: Send notification to customer
        break;

      case "checkout.session.expired":
        const expiredSession = stripeEvent.data.object as Stripe.Checkout.Session;
        console.log("Checkout session expired:", expiredSession.id);
        // TODO: Optionally clean up or notify
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

// Helper function to parse Stripe session data into our order format
async function parseStripeSession(session: Stripe.Checkout.Session): Promise<Partial<IOrder>> {
  const lineItems = session.line_items?.data || [];
  
  // Parse customer details
  const customerDetails: ICustomerDetails = {
    name: session.customer_details?.name || 
           session.custom_fields?.find(f => f.key === 'customer_name')?.text?.value || 
           'Unknown Customer',
    email: session.customer_details?.email || '',
    phone: session.customer_details?.phone || '',
  };

  // Add address only if delivery method is shipping AND address is provided
  const deliveryMethod = session.metadata?.delivery_method as 'pickup' | 'shipping' || 'pickup';
  
  if (deliveryMethod === 'shipping' && session.customer_details?.address) {
    customerDetails.address = {
      line1: session.customer_details.address.line1 || '',
      line2: session.customer_details.address.line2 || '',
      city: session.customer_details.address.city || '',
      state: session.customer_details.address.state || '',
      postal_code: session.customer_details.address.postal_code || '',
      country: session.customer_details.address.country || 'TH',
    };
  }

  // Parse order items
  const items: IOrderItem[] = [];
  let subtotal = 0;
  let shippingFee = 0;

  for (const lineItem of lineItems) {
    const price = lineItem.price;
    const product = price?.product as Stripe.Product;
    
    if (product && product.name !== 'Shipping Fee') {
      const itemTotal = (lineItem.amount_total || 0) / 100; // Convert from satang to Baht
      
      items.push({
        productId: product.id,
        stripeProductId: product.id,
        stripePriceId: price?.id || '',
        name: product.name,
        description: product.description || '',
        price: (price?.unit_amount || 0) / 100, // Convert from satang to Baht
        quantity: lineItem.quantity || 1,
        image: product.images?.[0] || '',
        tag: product.metadata?.tag || '',
      });
      
      subtotal += itemTotal;
    } else if (product?.name === 'Shipping Fee') {
      shippingFee = (lineItem.amount_total || 0) / 100;
    }
  }

  // Calculate delivery date (Friday delivery as per your business model)
  const deliveryDate = getNextDeliveryDate();

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
    status: 'confirmed',
    paymentStatus: 'paid',
    source: session.metadata?.source || 'fatsprinkle_website',
    orderType: session.metadata?.order_type || 'pre_order',
  };
}

// Helper function to calculate next delivery date (Friday)
function getNextDeliveryDate(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday
  
  let daysUntilFriday;
  if (dayOfWeek <= 5) { // Sunday to Friday
    daysUntilFriday = 5 - dayOfWeek;
  } else { // Saturday
    daysUntilFriday = 6; // Next Friday
  }
  
  // If it's Friday but past delivery cutoff time, move to next Friday
  if (dayOfWeek === 5 && today.getHours() >= 12) {
    daysUntilFriday = 7;
  }
  
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + daysUntilFriday);
  deliveryDate.setHours(14, 0, 0, 0); // 2 PM delivery time
  
  return deliveryDate;
}