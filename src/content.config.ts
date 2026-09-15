import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const historicalContent = defineCollection({
  loader: glob({
    base: "./src/content/india",
    pattern: "**/*.md",
  }),

  schema: z.object({
    // -----------------------------------------
    // Identity
    // -----------------------------------------

    id: z.string(),

    type: z.enum([
      "overview",
      "person",
      "event",
      "place",
      "story",
      "fact",
    ]),

    world: z.string(),

    era: z.string(),

    title: z.string(),

    subtitle: z.string().optional(),

    // -----------------------------------------
    // Chronology
    // -----------------------------------------

    startYear: z.number().optional(),

    endYear: z.number().optional(),

    // -----------------------------------------
    // Geography
    // -----------------------------------------

    latitude: z.number().optional(),

    longitude: z.number().optional(),

    // -----------------------------------------
    // Classification
    // -----------------------------------------

    category: z.string().optional(),

    aliases: z.array(z.string()).optional(),

    tags: z.array(z.string()).optional(),

    // -----------------------------------------
    // Editorial / Historical Status
    // -----------------------------------------

    summary: z.string(),

    status: z.enum([
      "historical",
      "archaeological",
      "historical-traditional",
      "traditional",
      "mythological",
      "debated",
      "uncertain",
    ]),

    confidence: z
      .enum([
        "high",
        "medium",
        "low",
        "debated",
      ])
      .optional(),

    // -----------------------------------------
    // Media
    // -----------------------------------------

    image: z.string().optional(),

    imageAlt: z.string().optional(),

    imageCredit: z.string().optional(),

    imageSource: z.string().optional(),

    imageLicense: z.string().optional(),
  }),
});

export const collections = {
  historicalContent,
};