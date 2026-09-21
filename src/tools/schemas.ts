import z from "zod";

export const repoField = z.string().describe('Repository in owner/name format');

export const summarySchema = z.object({
  number: z.number(),
  title: z.string(),
  state: z.string(),
  author: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  labels: z.array(z.string()),
  commentCount: z.number(),
  url: z.string()
});

export const pullRequestSummarySchema = z.object({
  number: z.number(),
  title: z.string(),
  description: z.string(),
  descriptionTruncated: z.boolean(),
  author: z.string(),
  state: z.string(),
  url: z.string()
});