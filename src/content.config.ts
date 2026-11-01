import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const stringOrArray = z.union([
  z.string(),
  z.array(z.string()),
]);

const writeups = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/writeups",

    // Preserve filenames such as TwoMillion.md and CCTV.md.
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),

  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),

    category: stringOrArray.optional(),
    tags: stringOrArray.optional(),

    difficulty: z.coerce.string().optional(),
    pinned: z.boolean().optional(),
    summary: z.string().optional(),

    platform: z.coerce.string().optional(),
    os: z.coerce.string().optional(),
    creator: z.coerce.string().optional(),
    machine: z.coerce.string().optional(),
    machine_url: z.string().optional(),
    achievement: z.string().optional(),
    tldr: z.string().optional(),
  }),
});

export const collections = { writeups };