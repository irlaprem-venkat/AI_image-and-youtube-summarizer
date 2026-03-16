import { z } from "zod";

export const summaryModeSchema = z.enum(['tldr', 'bullet', 'study', 'blog', 'insights', 'actions']);

export const textSummarizerSchema = z.object({
  text: z.string().min(50, "Text must be at least 50 characters").max(10000, "Text exceeds maximum length of 10,000 characters"),
  mode: summaryModeSchema.optional().default('tldr'),
});

export const urlSummarizerSchema = z.object({
  url: z.string().url("Invalid URL format").startsWith("http", "Only HTTP/HTTPS URLs are allowed"),
  mode: summaryModeSchema.optional().default('tldr'),
});

export const youtubeSummarizerSchema = z.object({
  url: z.string().url("Invalid YouTube URL").includes("youtube.com", { message: "Must be a valid YouTube URL" }).or(z.string().url().includes("youtu.be")),
  mode: summaryModeSchema.optional().default('tldr'),
});

export const imageSummarizerSchema = z.object({
  mode: summaryModeSchema.optional().default('tldr'),
  // File handling is usually done via FormData, but we can validate the metadata here if needed
});
