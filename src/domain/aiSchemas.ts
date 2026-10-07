import { z } from "zod";

export const aiSuggestionItemSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  placeAfterTitle: z.string().max(120).optional(),
});

export const aiStructuredSchema = z.object({
  kind: z.enum(["explanation", "next_step", "breakdown", "roadmap_items"]),
  message: z.string().min(1).max(2000),
  items: z.array(aiSuggestionItemSchema).max(5).optional(),
});

export type AiStructured = z.infer<typeof aiStructuredSchema>;

export const AI_SYSTEM_PROMPT =
  "You are an optional Career Assistant in APTIMI, a Career Execution Platform. Give targeted, modest suggestions. Never claim hiring outcomes, guaranteed internships, or fabricated sources. Return JSON only matching the schema.";
