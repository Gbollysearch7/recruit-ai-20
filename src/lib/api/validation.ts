import { z } from 'zod';

// Enrichment parameter schema - matches CreateEnrichmentParameters type
const enrichmentSchema = z.object({
  description: z.string().min(1).max(500),
  format: z.enum(['text', 'number', 'boolean', 'date', 'list', 'url']).optional(),
});

// Create search request schema
export const createSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Query is required')
    .max(1000, 'Query must be less than 1000 characters')
    .transform((val) => val.trim()),
  count: z
    .number()
    .int('Count must be an integer')
    .min(1, 'Count must be at least 1')
    .max(100, 'Count must be at most 100')
    .default(20),
  criteria: z
    .array(z.string().min(1).max(500).transform((val) => val.trim()))
    .max(10, 'Maximum 10 criteria allowed')
    .optional(),
  enrichments: z
    .array(enrichmentSchema)
    .max(5, 'Maximum 5 enrichments allowed')
    .optional(),
});

// List websets query params schema
export const listWebsetsSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(1).max(100).optional()),
  cursor: z.string().optional(),
});

// Get webset items query params schema
export const getItemsSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 100))
    .pipe(z.number().int().min(1).max(1000)),
  cursor: z.string().optional(),
});

// Webset ID parameter schema
export const websetIdSchema = z.object({
  id: z.string().min(1, 'Webset ID is required'),
});

// Type exports
export type CreateSearchInput = z.infer<typeof createSearchSchema>;
export type ListWebsetsInput = z.infer<typeof listWebsetsSchema>;
export type GetItemsInput = z.infer<typeof getItemsSchema>;

// Validation helper that returns formatted errors
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// Format Zod errors for API response
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}
