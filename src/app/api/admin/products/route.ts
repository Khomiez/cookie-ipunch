// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, hasPermission } from "@/lib/adminAuth";
import stripe from "@/lib/stripe-server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { IProduct } from "@/interfaces/product";

// GET - List all products for admin
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = await requireAdminAuth();

    if (!hasPermission(adminSession, "products")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // 'active', 'inactive', 'all'
    const category = searchParams.get("category") || "";

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tag: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") {
      query.active = true;
    } else if (status === "inactive") {
      query.active = false;
    }

    if (category) {
      query.category = category;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Transform to IProduct format
    const transformedProducts: IProduct[] = products.map((product) => ({
      id: product.stripeProductId,
      name: product.name,
      description: product.description,
      price: product.price,
      priceId: product.stripePriceId,
      image: product.images?.[0] || "/api/placeholder/300/300",
      images: product.images,
      tag: product.tag || "",
      active: product.active,
    }));

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = await requireAdminAuth();

    if (!hasPermission(adminSession, "products")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, images, tag, category } = body;

    // Validation
    if (!name || !description || !price) {
      return NextResponse.json(
        { error: "Name, description, and price are required" },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if product with same name exists
    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this name already exists" },
        { status: 409 }
      );
    }

    // Create product in Stripe first
    const stripeProduct = await stripe.products.create({
      name,
      description,
      images: images || [],
      metadata: {
        tag: tag || "",
        category: category || "cookies",
        created_by: adminSession.adminId,
      },
    });

    // Create price for the product
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100), // Convert Baht to satang
      currency: "thb",
      product: stripeProduct.id,
    });

    // Update Stripe product with default price
    await stripe.products.update(stripeProduct.id, {
      default_price: stripePrice.id,
    });

    // Save to MongoDB
    const newProduct = new Product({
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
      name,
      description,
      price,
      images: images || [],
      tag: tag || "",
      category: category || "cookies",
      active: true,
      lastSyncedAt: new Date(),
    });

    await newProduct.save();

    // Return transformed product
    const transformedProduct: IProduct = {
      id: stripeProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      priceId: stripePrice.id,
      image: newProduct.images?.[0] || "/api/placeholder/300/300",
      images: newProduct.images,
      tag: newProduct.tag || "",
      active: newProduct.active,
    };

    return NextResponse.json(
      {
        success: true,
        product: transformedProduct,
        message: "Product created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
