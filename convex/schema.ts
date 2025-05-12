import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  reminders: defineTable({
    userId: v.id("users"),
    message: v.string(),
    scheduledTime: v.number(),
    method: v.union(v.literal("email"), v.literal("sms")),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_scheduled_time", ["scheduledTime", "status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
