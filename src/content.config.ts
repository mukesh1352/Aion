import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const historicalContent = defineCollection({
  loader: glob({
    base: "./src/content/india",
    pattern: "**/*.mdx",
  }),

  schema: z.object({
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

    startYear: z.number().optional(),

    endYear: z.number().optional(),

    category: z.string().optional(),

    tags: z.array(z.string()).optional(),

    summary: z.string(),

    status: z.enum([
      "historical",
      "historical-traditional",
      "archaeological",
      "mythological",
      "traditional",
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

    location: z
      .object({
        name: z.string(),

        latitude: z.number(),

        longitude: z.number(),
      })
      .optional(),
  }),
});

export const collections = {
  historicalContent,
};