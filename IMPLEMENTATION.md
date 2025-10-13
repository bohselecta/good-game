# GoodGame? - Complete Implementation Guide

## 🎯 Project Overview

**GoodGame?** is a web application that helps users decide if recorded sports games are worth watching without spoiling the outcome. It uses AI to analyze game competitiveness and entertainment value, with progressive spoiler reveals.

## 🏗️ Architecture

- **Frontend:** Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** SQLite (local) or PostgreSQL (production)
- **AI:** DeepSeek API for game analysis
- **Data Sources:** ESPN APIs for live sports data
- **Hosting:** Vercel with cron jobs for automated analysis

## 📁 Project Structure

```
goodgame/
├── app/
│   ├── page.tsx                 # Homepage with game list
│   ├── game/[id]/page.tsx       # Individual game detail
│   └── api/
│       ├── analyze/route.ts     # Manual trigger endpoint
│       ├── cron/route.ts        # Scheduled analysis
│       └── games/route.ts       # Get games list
├── lib/
│   ├── db.ts                    # Database functions
│   ├── deepseek.ts              # DeepSeek API integration
│   ├── sports-api.ts            # Fetch live game data
│   └── analyzer.ts              # Game quality analysis logic
├── components/
│   ├── GameCard.tsx             # Game preview card
│   └── SpoilerReveal.tsx        # Progressive spoiler component
├── prisma/
│   └── schema.prisma            # Database schema
└── vercel.json                  # Cron configuration
```

## 🚀 Setup Instructions

### 1. Environment Setup

First, ensure you have Node.js 18+ and npm installed.

### 2. Clone & Install

The project is already set up! If starting fresh:

```bash
npx create-next-app@latest goodgame --typescript --tailwind --app
cd goodgame
npm install prisma @prisma/client
```

### 3. Database Setup

```bash
# Initialize Prisma (already done)
npx prisma init --datasource-provider sqlite

# Generate client and create database
npx prisma generate
npx prisma db push
```

### 4. Environment Variables

Create `.env.local` in your project root:

```env
# Database
DATABASE_URL="file:./dev.db"

# API Keys - GET THESE FIRST!
DEEPSEEK_API_KEY="your-deepseek-api-key-here"

# Security
ADMIN_PASSWORD="your-admin-password-here"
CRON_SECRET="your-cron-secret-here"

# Optional: For production deployment
# DATABASE_URL="postgresql://username:password@localhost:5432/goodgame?schema=public"
```

### 5. Get API Keys

**DeepSeek API Key:**
- Sign up at [DeepSeek](https://platform.deepseek.com/)
- Generate an API key
- Add to `DEEPSEEK_API_KEY`

**Security Secrets:**
- Generate random strings for `ADMIN_PASSWORD` and `CRON_SECRET`
- Example: `openssl rand -base64 32`

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the homepage (empty initially).

### 7. Test the System

**Manual Analysis Trigger:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password-here"}'
```

**Check Games API:**
```bash
curl http://localhost:3000/api/games
```

## 🔧 Key Features

### ✅ Progressive Spoiler Reveals
- **Level 1:** Quality score (1-10) + brief analysis
- **Level 2:** Winner information
- **Level 3:** Final score

### ✅ Multi-Sport Support
- NFL (🏈)
- NBA (🏀)
- Soccer/Premier League (⚽)
- Easy to add more sports

### ✅ Automated Analysis
- Runs hourly via Vercel cron
- Analyzes yesterday's and today's completed games
- Only processes games once

### ✅ Manual Triggers
- POST to `/api/analyze` with admin password
- Useful for testing and immediate analysis

## 📊 Database Schema

```prisma
model Game {
  id            String   @id @default(cuid())
  sport         String   // "nfl", "nba", "soccer", "f1"
  league        String   // "NFL", "Premier League", etc.
  homeTeam      String
  awayTeam      String
  gameDate      DateTime
  status        String   // "scheduled", "live", "final"

  // Analysis results
  qualityScore  Int?     // 1-10, how "good" the game is
  isClose       Boolean?
  excitement    String?  // "blowout", "competitive", "thriller"
  analysis      String?  // DeepSeek's detailed analysis

  // Spoilers (nullable until revealed)
  finalScore    String?  // "28-24"
  winner        String?
  leadChanges   Int?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([gameDate, sport])
}
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect Repository:**
   - Push to GitHub
   - Connect to Vercel

2. **Environment Variables:**
   - Add all variables from `.env.local` to Vercel dashboard
   - Switch `DATABASE_URL` to PostgreSQL

3. **Database:**
   - Use Vercel Postgres or Railway
   - Update `DATABASE_URL` in Prisma schema

4. **Cron Jobs:**
   - Vercel automatically reads `vercel.json`
   - Runs `/api/cron` every hour

### Alternative: Railway

1. **Setup:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Database:**
   - Add PostgreSQL plugin
   - Copy `DATABASE_URL`

3. **Deploy:**
   ```bash
   railway up
   ```

## 🚀 Vercel Deployment

Vercel provides excellent support for Next.js applications with built-in optimizations and global CDN distribution.

### Why Vercel?

- ✅ **Next.js native**: Built by the same team behind Next.js
- ✅ **Global CDN**: Fast worldwide distribution
- ✅ **Automatic deployments**: Deploy on every Git push
- ✅ **Preview deployments**: Test changes before production
- ✅ **Analytics**: Built-in performance monitoring

### Vercel Setup Steps:

1. **Create Vercel Account:**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub account

2. **Deploy from GitHub:**
   - Import repository: `https://github.com/bohselecta/good-game.git`
   - Vercel auto-detects Next.js

3. **Database Setup:**
   - Vercel doesn't provide databases, so we use SQLite
   - Database file is created during build process

4. **Environment Variables:**
   In Vercel dashboard → Settings → Environment Variables:
   ```env
   DATABASE_URL=file:./dev.db
   DEEPSEEK_API_KEY=your-deepseek-api-key-here
   ADMIN_PASSWORD=your-admin-password-here
   CRON_SECRET=your-cron-secret-here
   NODE_ENV=production
   ```

5. **Build Settings:**
   Vercel automatically detects:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`

6. **Cron Jobs:**
   Vercel's cron jobs work with the `/api/cron` endpoint (runs daily at 9 AM UTC):
   ```json
   {
     "crons": [
       {
         "path": "/api/cron",
         "schedule": "0 9 * * *"
       }
     ]
   }
   ```

   **Note:** Free Vercel accounts are limited to one cron job per day. The schedule runs at 9 AM UTC daily. For more frequent analysis, consider:

   - **Upgrade to Vercel Pro**: Unlock unlimited cron jobs for $20/month
   - **External Cron Service**: Use Cron-Job.org, EasyCron, or similar services to call your `/api/cron` endpoint
   - **Manual Triggers**: Use the admin endpoint `/api/analyze` to trigger analysis manually

   **Example with Cron-Job.org:**
   ```
   URL: https://your-app.vercel.app/api/cron
   Method: GET
   Headers: Authorization: Bearer YOUR_CRON_SECRET
   Schedule: Every hour (0 * * * *)
   ```

### Vercel Features:

- **Preview Deployments**: Every PR gets a unique URL
- **Custom Domains**: Easy domain setup
- **Analytics**: Real-time performance metrics
- **Edge Functions**: Global API execution
- **Rollback**: Instant rollback to previous versions

**Vercel URLs:**
- **Dashboard**: https://vercel.com/dashboard
- **Docs**: https://vercel.com/docs

## 🧪 Testing

### Manual Testing

1. **Trigger Analysis:**
   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -d '{"password":"your-admin-password"}'
   ```

2. **Check Results:**
   - Visit homepage
   - Click on games to test spoiler reveals

### API Testing

```bash
# Get all games
curl http://localhost:3000/api/games

# Get specific game
curl http://localhost:3000/api/games/{game-id}

# Trigger analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}'
```

## 🔍 Troubleshooting

### Common Issues

**"DeepSeek API error"**
- Check your API key
- Verify account has credits
- Check API rate limits

**"No games found"**
- ESPN API might be rate-limited
- Try different dates
- Check console for API errors

**Database connection issues**
- Ensure `DATABASE_URL` is correct
- Run `npx prisma db push` after schema changes
- Check file permissions for SQLite

**Cron jobs not working**
- Verify `CRON_SECRET` matches Vercel env var
- Check Vercel function logs
- Test `/api/cron` endpoint manually

### Debug Mode

Add to your environment:
```env
NODE_ENV=development
DEBUG=*
```

## 🚀 Next Steps

### Adding New Sports

1. **Add fetcher in `lib/sports-api.ts`:**
   ```typescript
   export async function fetchFormula1Races(date: string): Promise<GameData[]> {
     // Implementation
   }
   ```

2. **Update analyzer in `lib/analyzer.ts`:**
   ```typescript
   const f1Races = await fetchFormula1Races(today);
   // Add to allGames array
   ```

3. **Add emoji in components:**
   ```typescript
   case 'f1': return '🏎️';
   ```

### Improving Analysis

- Add more detailed stats to DeepSeek prompts
- Include player performance data
- Add sentiment analysis for game atmosphere
- Implement user voting/ratings

### UI Enhancements

- Add dark/light theme toggle
- Implement filtering by sport/league
- Add search functionality
- Create mobile app version

## 📈 Performance Considerations

- **API Rate Limits:** ESPN API has limits - implement caching
- **DeepSeek Costs:** ~$0.01-0.05 per analysis - monitor usage
- **Database:** Use connection pooling for production
- **Caching:** Implement Redis for frequently accessed data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source. Feel free to use and modify as needed.

---

**Happy gaming! 🎮** Questions? Open an issue or reach out to the maintainers.
