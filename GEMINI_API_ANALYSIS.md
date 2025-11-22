# Gemini API Usage Analysis & Optimization Strategy

## Current Implementation Analysis

### API Call Patterns

**1. Ideas Generator (`/content/generate-ideas`)**
- **Location**: `backend/routes/content.js:969-1079`
- **Service**: `googleAIService.generateText()`
- **Model**: `gemini-flash-latest`
- **API Calls**: **1 call per user request**
- **Token Usage**: 
  - Input: ~800-1,200 tokens (prompt includes topic, angle, tone, audience, detailed instructions)
  - Output: Up to 3,000 tokens (`maxOutputTokens: 3000`)
  - **Total per request**: ~1,800-4,200 tokens
- **Frequency**: Per user action (not batched)

**2. Comments Generator (`/content/comments/generate`)**
- **Location**: `backend/routes/content.js:407-540`
- **Service**: `googleAIService.generateComment()`
- **Model**: `gemini-flash-latest`
- **API Calls**: **1 call per user request**
- **Token Usage**:
  - Input: ~600-900 tokens (post content + persona + comment type instructions)
  - Output: Up to 2,048 tokens (`maxOutputTokens: 2048`)
  - **Total per request**: ~1,400-2,950 tokens
- **Frequency**: Per user action (not batched)
- **Note**: Returns 3 comments per call (parsed from single response)

**3. Post Generator (`/content/generate`)**
- **Location**: `backend/routes/content.js:244-404`
- **Service**: `googleAIService.generatePost()`
- **Model**: `gemini-flash-latest`
- **API Calls**: **1 call per user request**
- **Token Usage**:
  - Input: ~1,200-2,000 tokens (includes persona, training posts, profile insights, LinkedIn insights)
  - Output: Up to 2,048 tokens (`maxOutputTokens: 2048`)
  - **Total per request**: ~2,400-4,048 tokens
- **Frequency**: Per user action (not batched)

### Current Batching Status
- ❌ **No batching implemented** - Each user action = 1 API call
- ❌ **No request queuing** - All requests hit API immediately
- ❌ **No concurrency limits** - Multiple users can trigger simultaneous calls
- ❌ **No daily API tracking** - Only per-user subscription limits tracked

### Per-User Allocation Logic
**Location**: `backend/models/UserSubscription.js:236-314`
- Tracks monthly limits per user (posts, comments, ideas)
- **NOT tracking daily API quota** - Only subscription-based limits
- Trial users: 7 posts/month, 14 comments/month, 14 ideas/month

---

## Gemini Free Tier Limits (2025)

- **Daily Requests**: 100 requests/day
- **Daily Input Tokens**: 6,000,000 tokens/day
- **Rate Limits**: Not explicitly documented, but likely ~15 requests/minute

---

## Capacity Calculations

### Scenario 1: Current Implementation (No Batching)

**Assumptions:**
- Average user generates: 1 idea + 1 comment + 0.5 posts per day
- Average tokens per request: 2,500 tokens (weighted average)
- Average requests per user per day: 2.5 requests

**Maximum Daily Users:**
```
100 requests/day ÷ 2.5 requests/user = 40 users/day
```

**Token Capacity:**
```
6,000,000 tokens/day ÷ 2,500 tokens/request = 2,400 requests/day
2,400 requests ÷ 2.5 requests/user = 960 users/day (token-limited)
```

**Bottleneck**: **Request limit (100/day) = 40 users max**

### Scenario 2: With Optimal Batching

**Batching Strategy:**
- **Ideas**: Already generates 5-6 ideas per call (no change needed)
- **Comments**: Already generates 3 comments per call (no change needed)
- **Posts**: Single post per call (could batch 2-3 posts, but UX impact)

**If users batch requests:**
- Average requests per user: 1.5 requests/day (combining actions)
- **Maximum Daily Users**: `100 requests/day ÷ 1.5 = 66 users/day`

**Token Capacity:**
- Still 960 users/day (token limit not the constraint)

**Bottleneck**: Still **Request limit (100/day) = 66 users max**

### Scenario 3: Request Queuing + Time Distribution

**Strategy**: Distribute requests across 24 hours
- Peak hours: 8 AM - 6 PM (10 hours) = 60% of requests
- Off-peak: 6 PM - 8 AM (14 hours) = 40% of requests

**With queuing:**
- Smooth distribution: ~4.2 requests/hour
- **Maximum Daily Users**: Still 40-66 users (request limit unchanged)

---

## Optimization Strategies

### 1. **Batching Multiple User Requests** ⭐ HIGHEST IMPACT

**Current**: Each user action = 1 API call
**Optimized**: Batch 3-5 user requests into 1 API call

**Implementation Location**: `backend/services/googleAI.js`

**Strategy**:
- Queue requests for 2-5 seconds
- Batch similar requests (all ideas, all comments)
- Single API call returns multiple results

**Impact**:
- **3x capacity**: 100 requests/day → 300 user actions/day
- **120 users/day** (if 2.5 actions/user)

**Code Location to Modify**:
- `backend/services/googleAI.js:86-122` (generateText method)
- `backend/services/googleAI.js:124-171` (generateComment method)
- Add batching queue in `backend/services/googleAI.js` constructor

### 2. **Request Rate Limiting & Queuing**

**Current**: No global rate limiting
**Optimized**: Queue requests when approaching limits

**Implementation Location**: `backend/services/googleAI.js`

**Strategy**:
- Track daily request count (in-memory or Redis)
- Queue requests when >80 requests/day
- Process queue at 4 requests/hour (smooth distribution)

**Impact**:
- Prevents hitting 100/day limit
- Better user experience (queued vs. error)

**Code Location to Add**:
- New file: `backend/services/geminiQuotaTracker.js`
- Integrate in `backend/services/googleAI.js` constructor

### 3. **Token Optimization**

**Current Prompts**:
- Ideas: ~1,200 tokens (very detailed instructions)
- Comments: ~900 tokens (includes examples)
- Posts: ~2,000 tokens (includes training posts, insights)

**Optimization Opportunities**:
- **Ideas prompt** (`backend/routes/content.js:1082-1270`): Reduce from ~1,200 to ~800 tokens
  - Remove redundant examples
  - Condense instructions
  - **Savings**: ~400 tokens/request = 33% reduction

- **Comments prompt** (`backend/services/googleAI.js:305-407`): Reduce from ~900 to ~600 tokens
  - Remove verbose examples
  - Simplify instructions
  - **Savings**: ~300 tokens/request = 33% reduction

- **Posts prompt** (`backend/services/googleAI.js:173-303`): Reduce from ~2,000 to ~1,400 tokens
  - Limit training posts to 2-3 (not all)
  - Condense persona description
  - **Savings**: ~600 tokens/request = 30% reduction

**Impact**:
- Average tokens: 2,500 → 1,800 tokens/request
- **Token capacity**: 960 → 1,333 users/day (but still limited by 100 requests/day)

### 4. **Caching & Reuse**

**Strategy**: Cache common requests
- Cache idea generation for same topic+angle combinations
- Cache comment generation for same post+persona combinations

**Impact**:
- Reduce API calls by 20-30%
- **Capacity**: 40 → 50-55 users/day

**Code Location to Add**:
- New file: `backend/services/geminiCache.js`
- Integrate in `backend/routes/content.js` before API calls

### 5. **Smart Request Distribution**

**Strategy**: Prioritize based on user tier
- Paid users: Immediate processing
- Trial users: Queued during peak hours

**Impact**:
- Better experience for paying users
- Same overall capacity

---

## Recommended Implementation Priority

### Phase 1: Immediate (Max Impact)
1. **Daily API Request Tracking** - Prevent hitting 100/day limit
2. **Request Queuing** - Smooth distribution across 24 hours
3. **Alert System** - Notify when approaching limits

### Phase 2: High Impact
4. **Batching Multiple Requests** - 3x capacity increase
5. **Token Optimization** - Reduce prompt sizes by 30%

### Phase 3: Optimization
6. **Caching** - Reduce redundant calls
7. **Smart Distribution** - Prioritize paid users

---

## Where to Add Logging & Alerts

### 1. Daily Request Tracking
**Location**: `backend/services/googleAI.js`
- Add counter in constructor: `this.dailyRequestCount = 0`
- Increment in each `generateContent()` call
- Reset at midnight (cron job or scheduled task)

**Alert Thresholds**:
- **Warning**: 70 requests/day (70% of limit)
- **Critical**: 90 requests/day (90% of limit)
- **Block**: 100 requests/day (reject new requests)

### 2. Token Usage Tracking
**Location**: `backend/services/googleAI.js:52-84` (generatePost)
- Already tracks: `response.usageMetadata?.totalTokenCount`
- **Add**: Daily token accumulator
- **Alert**: When >5,000,000 tokens/day (83% of limit)

### 3. Alert Implementation
**Location**: New file: `backend/services/geminiAlerts.js`

**Alert Methods**:
- Console logging (current)
- Database logging (new table: `api_quota_alerts`)
- Email notification (if configured)
- Webhook (for monitoring tools)

**Code Locations to Add Alerts**:
- `backend/services/googleAI.js:52` (before generateContent)
- `backend/services/googleAI.js:97` (after generateContent)
- `backend/services/googleAI.js:143` (before generateContent in comments)

### 4. Request Queue Monitoring
**Location**: If implementing queuing
- Log queue depth
- Log average wait time
- Alert when queue >50 requests

---

## Current Code Flow for Tracking

### Ideas Generation Flow:
```
User Request → backend/routes/content.js:1048
  → googleAIService.generateText()
    → backend/services/googleAI.js:86
      → this.model.generateContent() ← TRACK HERE
        → response.usageMetadata.totalTokenCount ← LOG HERE
```

### Comments Generation Flow:
```
User Request → backend/routes/content.js:474
  → googleAIService.generateComment()
    → backend/services/googleAI.js:124
      → this.model.generateContent() ← TRACK HERE
        → response.usageMetadata.totalTokenCount ← LOG HERE
```

### Posts Generation Flow:
```
User Request → backend/routes/content.js:244
  → googleAIService.generatePost()
    → backend/services/googleAI.js:13
      → this.model.generateContent() ← TRACK HERE
        → response.usageMetadata.totalTokenCount ← LOG HERE
```

---

## Summary

**Current Capacity**: **~40 users/day** (request-limited)
**With Batching**: **~120 users/day** (3x improvement)
**With All Optimizations**: **~150-200 users/day** (caching + batching + optimization)

**Primary Bottleneck**: 100 requests/day limit (not tokens)
**Secondary Constraint**: Token limit (6M/day) allows 960 users, but request limit caps at 100

**Key Insight**: Request batching is the highest-impact optimization, potentially tripling capacity.

