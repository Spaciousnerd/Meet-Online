import { z } from "zod";
export const ChatSchema = z.object({
  message: z.string().trim().min(1).max(500),
  sender: z.string().trim().min(1).max(30),
});
export const historySchema = z.object({
  token: z.string(),
  meetingCode: z.string().trim().min(3).max(100),
});
