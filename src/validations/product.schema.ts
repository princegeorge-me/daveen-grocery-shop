import { z } from 'zod'

export const CreateProductSchema = z.object({
  name:             z.string().min(2).max(200),
  slug:             z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description:      z.string().max(5000).optional(),
  shortDescription: z.string().max(300).optional(),
  categoryId:       z.string().cuid(),
  price:            z.number().int().positive(),
  compareAtPrice:   z.number().int().positive().optional().nullable(),
  costPerItem:      z.number().int().positive().optional().nullable(),
  sku:              z.string().max(100).optional().nullable(),
  barcode:          z.string().max(100).optional().nullable(),
  trackInventory:   z.boolean().default(true),
  weight:           z.number().positive().optional().nullable(),
  weightUnit:       z.enum(['LB','OZ','KG','G','ML','L']).default('LB'),
  images:           z.array(z.object({ url: z.string().url(), alt: z.string(), position: z.number() })).default([]),
  tags:             z.array(z.string()).default([]),
  metaTitle:        z.string().max(70).optional().nullable(),
  metaDescription:  z.string().max(160).optional().nullable(),
  isActive:         z.boolean().default(true),
  isFeatured:       z.boolean().default(false),
  quantity:         z.number().int().min(0).default(0),
  lowStockThreshold:z.number().int().min(0).default(5),
})

export const UpdateProductSchema = CreateProductSchema.partial()

export const ProductQuerySchema = z.object({
  category: z.string().optional(),
  search:   z.string().optional(),
  limit:    z.coerce.number().int().min(1).max(100).default(24),
  cursor:   z.string().optional(),
  sort:     z.enum(['newest','price_asc','price_desc','popular','featured']).default('newest'),
  featured: z.coerce.boolean().optional(),
  inStock:  z.coerce.boolean().optional(),
  tags:     z.string().optional(),   // comma-separated
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
export type ProductQueryInput  = z.infer<typeof ProductQuerySchema>
