import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    message: v.string(),
    scheduledTime: v.number(),
    method: v.union(v.literal("email"), v.literal("sms")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("reminders", {
      userId,
      message: args.message,
      scheduledTime: args.scheduledTime,
      method: args.method,
      status: "pending",
    });
  },
});

export const remove = mutation({
  args: {
    reminderId: v.id("reminders"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const reminder = await ctx.db.get(args.reminderId);
    if (!reminder) throw new Error("Reminder not found");
    if (reminder.userId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.reminderId);
  },
});

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("reminders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
