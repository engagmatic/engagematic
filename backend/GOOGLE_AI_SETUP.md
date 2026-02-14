# Google AI (Gemini) setup for Engagematic

Post, idea, and comment generation use the Gemini API. You need a valid API key.

## 1. Create an API key

1. Open **https://aistudio.google.com/apikey**
2. Sign in with your Google account
3. Click **Create API key** and copy the key

## 2. Configure the backend

In `backend/.env` set:

```env
GOOGLE_AI_API_KEY=your_new_key_here
```

**Important:** If you see "API key was reported as leaked" or "404 model not found", create a **new** key and update `.env`.

## 3. Models (default: Gemini 2.0)

The app uses **gemini-2.0-flash** (fallback: **gemini-2.0-flash-lite**). These work with the current Google AI API. To override:

```env
GEMINI_MODEL=gemini-2.0-flash-lite
GEMINI_FALLBACK_MODEL=gemini-2.0-flash
```

## 4. Rate limits (429)

If you see **429 Too Many Requests** or "quota exceeded", the free tier limit may be used. Wait a minute and retry, or check [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).

## 5. Restart after changes

After changing `.env` or model names, **restart the backend** (stop and run `node server.js` again from `backend`).
