// src/app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, hasPermission } from "@/lib/adminAuth";
import stripe from "@/lib/stripe-server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { IProduct } from "@/interfaces/product";

// GET - Get single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const adminSession = await requireAdminAuth();

    if (!hasPermission(adminSession, "products")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const productId = params.id;

    // Connect to database
    await connectToDatabase();

    // Find product in MongoDB
    const product = await Product.findOne({
      stripeProductId: productId,
    }).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get fresh data from Stripe
    try {
      const stripeProduct = await stripe.products.retrieve(productId, {
        expand: ["default_price"],
      });

      const defaultPrice = stripeProduct.default_price as any;

      // Transform to IProduct format
      const transformedProduct: IProduct = {
        id: stripeProduct.id,
        name: stripeProduct.name,
        description: stripeProduct.description || "",
        price: defaultPrice
          ? (defaultPrice.unit_amount || 0) / 100
          : product.price,
        priceId: defaultPrice?.id || product.stripePriceId,
        image:
          stripeProduct.images?.[0] ||
          product.images?.[0] ||
          "/api/placeholder/300/300",
        images: stripeProduct.images || product.images || [],
        tag: stripeProduct.metadata?.tag || product.tag || "",
        active: stripeProduct.active && product.active,
      };

      return NextResponse.json({ product: transformedProduct });
    } catch (stripeError) {
      console.warn(
        "Failed to fetch from Stripe, using local data:",
        stripeError
      );

      // Fallback to local data
      const transformedProduct: IProduct = {
        id: product.stripeProductId,
        name: product.name,
        description: product.description,
        price: product.price,
        priceId: product.stripePriceId,
        image: product.images?.[0] || "/api/placeholder/300/300",
        images: product.images || [],
        tag: product.tag || "",
        active: product.active,
      };

      return NextResponse.json({ product: transformedProduct });
    }
  } catch (error) {
    console.error("Error fetching product:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const adminSession = await requireAdminAuth();

    if (!hasPermission(adminSession, "products")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const productId = params.id;
    const body = await request.json();
    const { name, description, price, images, tag, category, active } = body;

    // Validation
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      );
    }

    if (price !== undefined && price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find existing product
    const existingProduct = await Product.findOne({
      stripeProductId: productId,
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if name conflicts with another product
    if (name && name !== existingProduct.name) {
      const nameConflict = await Product.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        stripeProductId: { $ne: productId },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: "Product with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Update Stripe product
    const stripeUpdateData: any = {};
    if (name) stripeUpdateData.name = name;
    if (description !== undefined) stripeUpdateData.description = description;
    if (images) stripeUpdateData.images = images;
    if (active !== undefined) stripeUpdateData.active = active;

    if (tag !== undefined || category !== undefined) {
      stripeUpdateData.metadata = {
        ...((await stripe.products.retrieve(productId)).metadata || {}),
        ...(tag !== undefined && { tag }),
        ...(category !== undefined && { category }),
        updated_by: adminSession.adminId,
        updated_at: new Date().toISOString(),
      };
    }

    let updatedStripeProduct;
    try {
      updatedStripeProduct = await stripe.products.update(
        productId,
        stripeUpdateData
      );
    } catch (stripeError) {
      console.error("Stripe update failed:", stripeError);
      return NextResponse.json(
        { error: "Failed to update product in Stripe" },
        { status: 500 }
      );
    }

    // Update price if changed
    let newPriceId = existingProduct.stripePriceId;
    if (price && price !== existingProduct.price) {
      try {
        const newPrice = await stripe.prices.create({
          unit_amount: Math.round(price * 100),
          currency: "thb",
          product: productId,
        });

        // Update product's default price
        await stripe.products.update(productId, {
          default_price: newPrice.id,
        });

        newPriceId = newPrice.id;
      } catch (priceError) {
        console.error("Price update failed:", priceError);
        return NextResponse.json(
          { error: "Failed to update product price" },
          { status: 500 }
        );
      }
    }

    // Update MongoDB record
    const updateData: any = {
      lastSyncedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = price;
    if (images) updateData.images = images;
    if (tag !== undefined) updateData.tag = tag;
    if (category !== undefined) updateData.category = category;
    if (active !== undefined) updateData.active = active;
    if (newPriceId !== existingProduct.stripePriceId)
      updateData.stripePriceId = newPriceId;

    const updatedProduct = await Product.findOneAndUpdate(
      { stripeProductId: productId },
      updateData,
      { new: true, lean: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Failed to update product in database" },
        { status: 500 }
      );
    }

    // Return transformed product
    const transformedProduct: IProduct = {
      id: updatedStripeProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      priceId: updatedProduct.stripePriceId,
      image: updatedProduct.images?.[0] || "/api/placeholder/300/300",
      images: updatedProduct.images || [],
      tag: updatedProduct.tag || "",
      active: updatedProduct.active,
    };

    return NextResponse.json({
      success: true,
      product: transformedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const adminSession = await requireAdminAuth();

    if (!hasPermission(adminSession, "products")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const productId = params.id;

    // Connect to database
    await connectToDatabase();

    // Find existing product
    const existingProduct = await Product.findOne({
      stripeProductId: productId,
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is used in any orders (optional safety check)
    // You might want to implement this based on your Order model

    // Deactivate in Stripe instead of deleting (safer approach)
    try {
      await stripe.products.update(productId, {
        active: false,
        metadata: {
          deleted_by: adminSession.adminId,
          deleted_at: new Date().toISOString(),
        },
      });
    } catch (stripeError) {
      console.error("Stripe deactivation failed:", stripeError);
      return NextResponse.json(
        { error: "Failed to deactivate product in Stripe" },
        { status: 500 }
      );
    }

    // Soft delete in MongoDB (mark as inactive)
    await Product.findOneAndUpdate(
      { stripeProductId: productId },
      {
        active: false,
        lastSyncedAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}