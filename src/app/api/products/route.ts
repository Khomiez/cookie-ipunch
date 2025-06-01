// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe-server";
import { IProduct } from "@/interfaces/product";

export async function GET() {
  try {
    // Fetch products from Stripe with their default prices
    const stripeProducts = await stripe.products.list({
      active: true,
      expand: ["data.default_price"], // Include price data
      limit: 100, // Adjust as needed
    });

    // Transform Stripe products to your IProduct interface
    const products: IProduct[] = stripeProducts.data
      .filter((product) => product.default_price) // Only include products with prices
      .map((product) => {
        const price = product.default_price as any; // Type assertion for expanded price

        return {
          id: product.id,
          name: product.name,
          description: product.description || "",
          price: (price.unit_amount || 0) / 100, // Convert cents to Baht
          priceId: price.id,
          image: product.images[0] || "/api/placeholder/300/300",
          images: product.images,
          tag: product.metadata?.tag || "",
          active: product.active,
        };
      });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products from Stripe:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, price, tag, images } = await request.json();

    // Create product in Stripe
    const product = await stripe.products.create({
      name,
      description,
      images: images || [],
      metadata: {
        tag: tag || "",
        category: "cookies",
      },
    });

    // Create price for the product (convert Baht to cents for Stripe)
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100), // Convert Baht to cents
      currency: "thb",
      product: product.id,
    });

    // Update product to set default price
    await stripe.products.update(product.id, {
      default_price: stripePrice.id,
    });

    const newProduct: IProduct = {
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: price, // Store in Baht directly
      priceId: stripePrice.id,
      image: product.images[0] || "/api/placeholder/300/300",
      images: product.images,
      tag: product.metadata?.tag || "",
      active: product.active,
    };

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}