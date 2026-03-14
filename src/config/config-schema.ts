import { z } from 'zod';

export const profileSchema = z.object({
  apiKey: z.string().optional(),
  secretKey: z.string().optional(),
  sandbox: z.boolean().optional(),
  defaultOutput: z.enum(['json', 'table', 'csv', 'quiet']).optional(),
  builderCode: z.string().optional(),
});

export const configSchema = z.object({
  defaultProfile: z.string().default('default'),
  profiles: z.record(z.string(), profileSchema).default({}),
});

export type ValidatedConfig = z.infer<typeof configSchema>;
