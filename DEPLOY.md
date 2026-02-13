# Deploy checklist (blank site fix)

The live site must serve a build **without** the old `ui-*.js` chunk. That chunk caused `React.forwardRef` to be undefined and a blank page.

## What to do

1. **Use the current code** (vite.config has no separate `@radix-ui` chunk).
2. **Build:** From repo root:
   ```bash
   cd spark-linkedin-ai-main
   npm run build
   ```
3. **Deploy the new `dist` folder** to your host (Vercel, Netlify, or static hosting).
4. **Confirm:** The deployed page's `<head>` must **not** contain any `ui-*.js` script or preload. It should only reference:
   - `index-*.js`
   - `vendor-*.js`
   - `icons-*.js`
   - `index-*.css`

If your host builds from Git, push the latest code and trigger a new deploy so it uses the updated `vite.config.ts`.
