import { ChannelType } from "@prisma/client";
import { z } from "zod";

export const serverCreationSchema = z.object({
  name: z.string().min(1, { message: "Server name is required" }),
  imageUrl: z.string().min(1, { message: "Server image is required" }),
});

export const channelCreationSchema = z.object({
  name: z.string().min(1, { message: "Channel name is required" }),
  type: z.enum([ChannelType.AUDIO, ChannelType.VIDEO, ChannelType.TEXT]),
});
