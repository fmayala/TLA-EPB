import { z } from "zod";

export const formSchema = z.object({
  profile: z.string().min(2).max(50),
  ev: z.number().min(8).max(100),
  threshold_percentage: z.number().min(0).max(1000),
});

export const formSchemaSearch = z.object({
  sid: z.string(),
});

export const formSchemaAddProfile = z.object({
  milesdriven: z.string().min(0).transform((val) => parseInt(val)),
  expenditure: z.string().min(0).transform((val) => parseFloat(val)),
  name: z.string().min(2).max(50),
});


export type FormSchema = typeof formSchema;
export type FormSchemaSearch = typeof formSchemaSearch;
export type FormSchemaAddProfile = typeof formSchemaAddProfile;