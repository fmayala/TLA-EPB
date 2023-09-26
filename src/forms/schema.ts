import { z } from "zod";

export const formSchema = z.object({
  profile: z.string().min(2).max(50),
  ev: z.string().min(0).max(100).transform((val) => parseInt(val)),
  threshold_percentage: z.string().min(0).max(1000).transform((val) => parseInt(val)),
});

export const formSchemaSearch = z.object({
  sid: z.string(),
});

export type FormSchema = typeof formSchema;
export type FormSchemaSearch = typeof formSchemaSearch;