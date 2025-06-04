// src/app/api/admin/products/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, hasPermission } from "@/lib/adminAuth";
import stripe from "@/lib/stripe-server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

interface BulkOperation {
  action: "activate" | "deactivate" | "delete" | "update_category";
  productIds: string[];
  data?: { [key: string]: any };
}

// POST - Bulk operations on products
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

    const { action, productIds, data }: BulkOperation = await request.json();

    // Validation
    if (!action || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "Invalid bulk operation data" },
        { status: 400 }
      );
    }

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "No products selected" },
        { status: 400 }
      );
    }

    if (productIds.length > 100) {
      return NextResponse.json(
        { error: "Too many products selected (max 100)" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find existing products
    const existingProducts = await Product.find({
      stripeProductId: { $in: productIds },
    }).lean();

    if (existingProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some products not found" },
        { status: 404 }
      );
    }

    let successCount = 0;
    let errors: string[] = [];

    // Process bulk operation
    switch (action) {
      case "activate":
      case "deactivate":
        const newActiveStatus = action === "activate";

        for (const productId of productIds) {
          try {
            // Update in Stripe
            await stripe.products.update(productId, {
              active: newActiveStatus,
              metadata: {
                bulk_updated_by: adminSession.adminId,
                bulk_updated_at: new Date().toISOString(),
              },
            });

            // Update in MongoDB
            await Product.findOneAndUpdate(
              { stripeProductId: productId },
              {
                active: newActiveStatus,
                lastSyncedAt: new Date(),
              }
            );

            successCount++;
          } catch (error) {
            errors.push(`Failed to ${action} product ${productId}`);
          }
        }
        break;

      case "delete":
        for (const productId of productIds) {
          try {
            // Deactivate in Stripe (safer than deletion)
            await stripe.products.update(productId, {
              active: false,
              metadata: {
                bulk_deleted_by: adminSession.adminId,
                bulk_deleted_at: new Date().toISOString(),
              },
            });

            // Soft delete in MongoDB
            await Product.findOneAndUpdate(
              { stripeProductId: productId },
              {
                active: false,
                lastSyncedAt: new Date(),
              }
            );

            successCount++;
          } catch (error) {
            errors.push(`Failed to delete product ${productId}`);
          }
        }
        break;

      case "update_category":
        if (!data?.category) {
          return NextResponse.json(
            { error: "Category is required for bulk category update" },
            { status: 400 }
          );
        }

        for (const productId of productIds) {
          try {
            // Update in Stripe
            const currentProduct = await stripe.products.retrieve(productId);
            await stripe.products.update(productId, {
              metadata: {
                ...currentProduct.metadata,
                category: data.category,
                bulk_updated_by: adminSession.adminId,
                bulk_updated_at: new Date().toISOString(),
              },
            });

            // Update in MongoDB
            await Product.findOneAndUpdate(
              { stripeProductId: productId },
              {
                category: data.category,
                lastSyncedAt: new Date(),
              }
            );

            successCount++;
          } catch (error) {
            errors.push(`Failed to update category for product ${productId}`);
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid bulk operation action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed`,
      successCount,
      totalCount: productIds.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in bulk operation:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}

// PUT - Sync products with Stripe
export async function PUT(request: NextRequest) {
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

    let syncedCount = 0;
    let errors: string[] = [];

    try {
      // Fetch all products from Stripe
      const stripeProducts = await stripe.products.list({
        active: true,
        expand: ["data.default_price"],
        limit: 100,
      });

      for (const stripeProduct of stripeProducts.data) {
        try {
          const price = stripeProduct.default_price as any;

          const productData = {
            stripeProductId: stripeProduct.id,
            stripePriceId: price?.id || "",
            name: stripeProduct.name,
            description: stripeProduct.description || "",
            price: price ? (price.unit_amount || 0) / 100 : 0,
            images: stripeProduct.images || [],
            tag: stripeProduct.metadata?.tag || "",
            category: stripeProduct.metadata?.category || "cookies",
            active: stripeProduct.active,
            lastSyncedAt: new Date(),
          };

          // Upsert product in MongoDB
          await Product.findOneAndUpdate(
            { stripeProductId: stripeProduct.id },
            productData,
            { upsert: true, new: true }
          );

          syncedCount++;
        } catch (error) {
          errors.push(`Failed to sync product ${stripeProduct.id}`);
        }
      }
    } catch (stripeError) {
      console.error("Stripe sync error:", stripeError);
      return NextResponse.json(
        { error: "Failed to fetch products from Stripe" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Products synced with Stripe",
      syncedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error syncing products:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to sync products" },
      { status: 500 }
    );
  }
}
