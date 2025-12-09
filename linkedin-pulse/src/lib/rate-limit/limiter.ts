import { getDb } from "../db/mongodb"

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

const FREE_LIMIT = 1 // 1 free analysis
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
const PAID_LIMIT = 100 // 100 analyses per day for paid users

export async function checkRateLimit(
  identifier: string,
  isPaidUser: boolean = false
): Promise<RateLimitResult> {
  try {
    const db = await getDb()
    const collection = db.collection("rate_limits")

    const now = new Date()
    const windowStart = new Date(now.getTime() - WINDOW_MS)

    // Find or create rate limit document
    const limitDoc = await collection.findOneAndUpdate(
      {
        identifier,
        windowStart: { $gte: windowStart },
      },
      {
        $setOnInsert: {
          identifier,
          requestCount: 0,
          windowStart: now,
          createdAt: now,
        },
        $inc: { requestCount: 1 },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    )

    const requestCount = limitDoc.requestCount || 0
    const limit = isPaidUser ? PAID_LIMIT : FREE_LIMIT
    const allowed = requestCount <= limit
    const remaining = Math.max(0, limit - requestCount)
    const resetAt = new Date(limitDoc.windowStart.getTime() + WINDOW_MS)

    // Clean up old documents (older than 48 hours)
    await collection.deleteMany({
      windowStart: { $lt: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
    })

    return {
      allowed,
      remaining,
      resetAt,
    }
  } catch (error) {
    console.error("❌ Rate limit check error:", error)
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: 0,
      resetAt: new Date(Date.now() + WINDOW_MS),
    }
  }
}

