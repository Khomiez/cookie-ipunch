// src/lib/adminProductValidation.ts
import { z } from "zod";

// Validation schemas
export const productCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_.,!()]+$/,
      "Product name contains invalid characters"
    ),

  description: z
    .string()
    .min(1, "Product description is required")
    .max(500, "Product description must be less than 500 characters"),

  price: z
    .number()
    .min(0.01, "Price must be greater than 0")
    .max(10000, "Price must be less than 10,000 THB")
    .multipleOf(0.01, "Price must have at most 2 decimal places"),

  images: z.array(z.string().url("Invalid image URL")).optional(),

  tag: z
    .string()
    .max(50, "Tag must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]*$/, "Tag contains invalid characters")
    .optional(),

  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters"),

  active: z.boolean().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const bulkOperationSchema = z.object({
  action: z.enum(["activate", "deactivate", "delete", "update_category"]),
  productIds: z
    .array(z.string().min(1))
    .min(1, "At least one product must be selected")
    .max(100, "Too many products selected"),
  data: z
    .object({
      category: z.string().optional(),
    })
    .optional(),
});

// Validation functions
export const validateProductData = (data: any, isUpdate = false) => {
  try {
    const schema = isUpdate ? productUpdateSchema : productCreateSchema;
    return {
      success: true,
      data: schema.parse(data),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: "general", message: "Validation failed" }],
    };
  }
};

export const validateBulkOperation = (data: any) => {
  try {
    return {
      success: true,
      data: bulkOperationSchema.parse(data),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: "general", message: "Validation failed" }],
    };
  }
};

// Business logic validations
export const validateProductBusiness = async (
  data: any,
  existingProductId?: string
) => {
  const errors: Array<{ field: string; message: string }> = [];

  // Check for duplicate names (you'd implement this with your database)
  // This is a placeholder - implement actual duplicate checking
  if (data.name) {
    // const duplicate = await checkProductNameDuplicate(data.name, existingProductId);
    // if (duplicate) {
    //   errors.push({ field: 'name', message: 'A product with this name already exists' });
    // }
  }

  // Validate image URLs if provided
  if (data.images && Array.isArray(data.images)) {
    for (let i = 0; i < data.images.length; i++) {
      const imageUrl = data.images[i];
      if (imageUrl && !isValidImageUrl(imageUrl)) {
        errors.push({
          field: `images.${i}`,
          message: "Invalid image URL or unsupported format",
        });
      }
    }
  }

  // Validate price logic
  if (data.price !== undefined) {
    if (data.price < 1) {
      errors.push({
        field: "price",
        message: "Price should be at least 1 THB for practical reasons",
      });
    }

    if (data.price > 1000 && !data.tag?.includes("Premium")) {
      // Warning for high prices without premium tag
      errors.push({
        field: "price",
        message: 'Consider adding "Premium" tag for products over 1000 THB',
      });
    }
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : null,
  };
};

// Helper functions
const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const hasValidExtension = validExtensions.some((ext) =>
      urlObj.pathname.toLowerCase().endsWith(ext)
    );

    // Allow common image hosting domains
    const validDomains = [
      "images.unsplash.com",
      "cdn.shopify.com",
      "imgur.com",
      "cloudinary.com",
      "amazonaws.com",
      "googleusercontent.com",
    ];

    const hasValidDomain =
      validDomains.some((domain) => urlObj.hostname.includes(domain)) ||
      hasValidExtension;

    return hasValidDomain;
  } catch {
    return false;
  }
};

// Product sanitization
export const sanitizeProductData = (data: any) => {
  return {
    ...data,
    name: data.name?.trim(),
    description: data.description?.trim(),
    tag: data.tag?.trim() || undefined,
    category: data.category?.trim() || "cookies",
    images: data.images?.filter((url: string) => url && url.trim()) || [],
    price: data.price ? Math.round(data.price * 100) / 100 : undefined, // Round to 2 decimal places
  };
};

// Error formatting
export const formatValidationErrors = (
  errors: Array<{ field: string; message: string }>
) => {
  const formatted: { [key: string]: string } = {};
  errors.forEach((error) => {
    formatted[error.field] = error.message;
  });
  return formatted;
};

// Product status validation
export const canToggleProductStatus = (
  product: any
): { allowed: boolean; reason?: string } => {
  // Check if product is used in pending orders
  // This would typically check your database

  if (!product.active && product.inventory?.stock === 0) {
    return {
      allowed: false,
      reason: "Cannot activate product with zero stock",
    };
  }

  return { allowed: true };
};

// Bulk operation validation
export const canPerformBulkOperation = (
  action: string,
  products: any[]
): { allowed: boolean; reason?: string } => {
  if (products.length === 0) {
    return { allowed: false, reason: "No products selected" };
  }

  if (action === "delete") {
    // Check if any product has pending orders
    const hasActiveOrders = products.some((p) => p.hasActiveOrders);
    if (hasActiveOrders) {
      return {
        allowed: false,
        reason: "Cannot delete products with active orders",
      };
    }
  }

  return { allowed: true };
};
