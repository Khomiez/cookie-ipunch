// src/lib/adminProductValidation.ts
import { z } from "zod";

// Types
export interface ValidationResult<T> {
  success: boolean;
  data: T | null;
  errors: Array<{ field: string; message: string }> | null;
}

export interface ProductData {
  name?: string;
  description?: string;
  price?: number;
  images?: string[];
  tag?: string;
  category?: string;
  active?: boolean;
}

// Constants
const VALID_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"] as const;
const VALID_IMAGE_DOMAINS = [
  "images.unsplash.com",
  "cdn.shopify.com",
  "imgur.com",
  "cloudinary.com",
  "amazonaws.com",
  "googleusercontent.com",
] as const;

// Base validation schemas
const baseProductSchema = {
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
};

// Validation schemas
export const productCreateSchema = z.object(baseProductSchema);
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

// Helper functions
const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hasValidExtension = VALID_IMAGE_EXTENSIONS.some((ext) =>
      urlObj.pathname.toLowerCase().endsWith(ext)
    );

    const hasValidDomain =
      VALID_IMAGE_DOMAINS.some((domain) => urlObj.hostname.includes(domain)) ||
      hasValidExtension;

    return hasValidDomain;
  } catch {
    return false;
  }
};

const handleZodError = (error: z.ZodError): ValidationResult<any> => ({
  success: false,
  data: null,
  errors: error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  })),
});

// Validation functions
export const validateProductData = (
  data: ProductData,
  isUpdate = false
): ValidationResult<ProductData> => {
  try {
    const schema = isUpdate ? productUpdateSchema : productCreateSchema;
    return {
      success: true,
      data: schema.parse(data),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }
    return {
      success: false,
      data: null,
      errors: [{ field: "general", message: "Validation failed" }],
    };
  }
};

export const validateBulkOperation = (
  data: unknown
): ValidationResult<z.infer<typeof bulkOperationSchema>> => {
  try {
    return {
      success: true,
      data: bulkOperationSchema.parse(data),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
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
  data: ProductData,
  existingProductId?: string
): Promise<ValidationResult<ProductData>> => {
  const errors: Array<{ field: string; message: string }> = [];

  // Validate image URLs if provided
  if (data.images?.length) {
    data.images.forEach((imageUrl, index) => {
      if (!isValidImageUrl(imageUrl)) {
        errors.push({
          field: `images.${index}`,
          message: "Invalid image URL or unsupported format",
        });
      }
    });
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
      errors.push({
        field: "price",
        message: 'Consider adding "Premium" tag for products over 1000 THB',
      });
    }
  }

  return {
    success: errors.length === 0,
    data: errors.length === 0 ? data : null,
    errors: errors.length > 0 ? errors : null,
  };
};

// Product sanitization
export const sanitizeProductData = (data: ProductData): ProductData => ({
  ...data,
  name: data.name?.trim(),
  description: data.description?.trim(),
  tag: data.tag?.trim() || undefined,
  category: data.category?.trim() || "cookies",
});

// Utility functions
export const formatValidationErrors = (
  errors: Array<{ field: string; message: string }>
): string => {
  return errors.map((err) => `${err.field}: ${err.message}`).join("\n");
};

export const canToggleProductStatus = (
  product: ProductData
): { allowed: boolean; reason?: string } => {
  if (!product.active && product.price && product.price > 1000) {
    return {
      allowed: false,
      reason: "Premium products (over 1000 THB) cannot be deactivated",
    };
  }
  return { allowed: true };
};

export const canPerformBulkOperation = (
  action: string,
  products: ProductData[]
): { allowed: boolean; reason?: string } => {
  if (action === "deactivate") {
    const hasPremiumProducts = products.some(
      (p) => p.price && p.price > 1000
    );
    if (hasPremiumProducts) {
      return {
        allowed: false,
        reason: "Cannot deactivate premium products in bulk",
      };
    }
  }
  return { allowed: true };
};
