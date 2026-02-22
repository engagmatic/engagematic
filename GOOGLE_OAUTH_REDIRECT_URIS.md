# Fix Google Sign-In "redirect_uri_mismatch" (Error 400)

Google is blocking sign-in because the **redirect URI** our app sends is not in your OAuth client’s allowed list. Add the **exact** URLs below.

## Steps

1. Open **Google Cloud Console**: https://console.cloud.google.com/apis/credentials  
2. Click your **OAuth 2.0 Client ID** (Web application).  
3. Under **Authorized redirect URIs**, click **+ ADD URI** and add **each** of these (copy‑paste; no extra spaces or slash at the end):

### Production (engagematic.com)

```
https://engagematic.com/auth/google/callback
```

If you also use `www`:

```
https://www.engagematic.com/auth/google/callback
```

### Local development

```
http://localhost:8080/auth/google/callback
http://localhost:5173/auth/google/callback
```

4. Under **Authorized JavaScript origins**, add (if not already):

```
https://engagematic.com
https://www.engagematic.com
http://localhost:8080
http://localhost:5173
```

5. Click **Save**.  
6. Wait 1–2 minutes, then try “Continue with Google” again (use a hard refresh or incognito if needed).

---

## If you get 401 Unauthorized from the backend

The backend (Render) must have these **Environment Variables** set:

| Variable | Example | Required |
|----------|---------|----------|
| `GOOGLE_CLIENT_ID` | `502515400049-xxx.apps.googleusercontent.com` | Yes |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxx` | Yes |
| `FRONTEND_URL` | `https://engagematic.com` (no trailing slash) | Yes (for fallback redirect_uri) |

Without `GOOGLE_CLIENT_SECRET`, the server cannot exchange the authorization code for a token and returns 401.

---

**Important:** The redirect URI must match **exactly** (including `http` vs `https`, and no trailing slash). The app sends: `{origin}/auth/google/callback` (e.g. `https://engagematic.com/auth/google/callback`).
