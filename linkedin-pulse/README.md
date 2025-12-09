# LinkedIn Profile Analyzer SaaS

A production-ready LinkedIn profile optimization tool built with Next.js 14, TypeScript, and Google Gemini AI.

## Features

- ✅ AI-powered profile analysis with scoring (0-100)
- ✅ Detailed feedback on headline and about section
- ✅ Persona-specific recommendations
- ✅ Generated LinkedIn posts
- ✅ Rate limiting (1 free analysis, then signup required)
- ✅ MongoDB integration for storing analyses
- ✅ Clerk authentication
- ✅ Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **AI**: Google Gemini 1.5 Pro
- **Database**: MongoDB
- **Auth**: Clerk
- **Validation**: Zod
- **Forms**: React Hook Form

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create `.env.local`:
   ```env
   MONGODB_URI=your-mongodb-uri
   GEMINI_API_KEY=your-gemini-key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Project Structure

```
linkedin-pulse/
├── src/
│   ├── app/
│   │   ├── api/profile-analyzer/analyze/route.ts
│   │   ├── tools/profile-analyzer/page.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── profile-analyzer/
│   │   │   ├── AnalyzerForm.tsx
│   │   │   ├── ResultsDisplay.tsx
│   │   │   ├── ScoreCard.tsx
│   │   │   └── UpgradeCTA.tsx
│   │   └── ui/
│   └── lib/
│       ├── ai/
│       │   ├── gemini-client.ts
│       │   └── prompts.ts
│       ├── db/
│       │   └── mongodb.ts
│       ├── rate-limit/
│       │   └── limiter.ts
│       └── utils/
│           ├── validation.ts
│           └── index.ts
```

## Deployment

1. Push to GitHub
2. Deploy to Vercel (auto-detects Next.js)
3. Add environment variables in Vercel dashboard
4. Test production build

## License

MIT

