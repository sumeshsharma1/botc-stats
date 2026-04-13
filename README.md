# BotC Stats

A free, open-source leaderboard and analytics dashboard for [Blood on the Clocktower](https://bloodontheclocktower.com/) communities. Track your group's games, ELO ratings, win rates, and more.

**[Live Demo](https://rossfw.github.io/botc-stats/botc-web/)**

**Features:**
- ELO-based leaderboard with player rankings
- Per-player rating history charts
- Analytics dashboard: scripts, characters, players, storytellers, head-to-head matchups
- Works on GitHub Pages (free website/hosting) to share with friends
- Quick game logging with autocomplete for player names and characters
- Colorblind-friendly mode

## Quick Start (~20 minutes)

### 1. Create your own copy of this repo

1. Click the green **"Use this template"** button at the top of this page
2. Select **"Create a new repository"**
3. Give it a name (e.g., `my-botc-stats`), keep it **Public**, and click **Create repository**

Your site will immediately work in **demo mode** with sample data — no setup needed to preview it.

### 2. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click **New Project**
3. Give it a name (e.g., `botc-stats`) and set a database password
4. Wait for the project to finish creating (takes about a minute)

### 3. Set up the database

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click the **+** button to create a new query
3. Open the [`setup/schema.sql`](setup/schema.sql) file from this repo, copy its entire contents, and paste it into the SQL editor
4. Click the green **Run** button (or press Cmd+Enter)

This creates all the tables, security policies, and access codes.

**Important — change your access codes!** The schema creates two default codes that you **must** change before sharing your site:

1. In Supabase, click **Table Editor** in the left sidebar
2. Click the **access_codes** table
3. Right-click a row and select **Edit row** to change each code:
   - `change-me-submit` → your add code (share only with your group — this lets people log new games)
   - `change-me-edit` → your edit code (keep this to yourself — this lets you edit or fix existing games)

> **Keep both codes private to your group.** Anyone with the submit code can add games to your leaderboard.

### 4. Connect your site to Supabase

You need two values from Supabase. To find them:

**Project URL:**
1. Go to **Settings** (gear icon, left sidebar) > **General**
2. Find the **Project ID** and click **Copy** (it will look something like `lusnxllufwpptzwswctj`)
3. Your Project URL is: `https://` + your Project ID + `.supabase.co`
   - Example: if your Project ID is `lusnxllufwpptzwswctj`, your URL is `https://lusnxllufwpptzwswctj.supabase.co`

**Anon Key:**
1. Go to **Settings** > **API Keys**
2. Click the **"Legacy anon, service_role API keys"** tab
3. Find the **anon public** key and click **Copy** (it's a long string starting with `eyJhb...`)

> **Important:** Use the key from the **"Legacy"** tab (starts with `eyJhb...`), NOT the "Publishable key" tab (starts with `sb_publishable_`).

Now edit your config file on GitHub:
1. In your new repo, navigate to **botc-web > js > site-config.js**
2. Click the **pencil icon** (edit button) in the top right of the file
3. Replace the placeholder values:

```javascript
const SITE_CONFIG = {
    supabaseUrl: 'https://your-project-id.supabase.co',    // https:// + your Project ID + .supabase.co
    supabaseAnonKey: 'eyJhbGci...',                         // your anon public key from the Legacy tab
    communityName: 'My BotC Group',                         // your group's name
    minGamesForLeaderboard: 1,
};
```

4. Click **Commit changes** at the bottom

### 5. Enable GitHub Pages

> **Note:** This may already be configured — check Settings > Pages first. If it already says "Deploy from a branch" with main / (root), skip to the URL below.

1. In your repo, go to **Settings** (tab at the top)
2. Click **Pages** in the left sidebar
3. Under "Source", select **Deploy from a branch**
4. Set branch to **main** and folder to **/ (root)**
5. Click **Save**

Your site will be live within a few minutes at:

```
https://yourusername.github.io/your-repo-name/botc-web/
```

> **Important:** The URL must end with `/botc-web/` — that's where the app lives. The base URL will just show this README.

## How to log games

1. Click **"Add Game"** on the leaderboard page
2. Enter the access code your group admin set up
3. Enter players in each team (one per line): `Name Role`
4. Select which team is Evil, who won, and the script
5. Optionally add any Fabled or Lorics that were in play
6. Submit

**Input format:** `Name Role` — one player per line. Names can be anything (`Sarah`, `Sarah_Lin`, `SarahL`). Use underscores for spaces in names.
- Basic: `Sarah Imp`
- Full name: `Sarah_Lin Imp`
- Multiple roles: `Tom Snake_Charmer+Witch` — use `+` to indicate a role change during the game (first role listed first)
- Team change: `Mike Chef Good->Evil` — Mike started Good but ended Evil. Put Mike in the Evil team's textarea since that's where he ended up

## Configuration options

All settings are in `botc-web/js/site-config.js` (edit via the pencil icon on GitHub):

| Setting | Default | Description |
|---------|---------|-------------|
| `supabaseUrl` | `YOUR_SUPABASE_URL` | Your Supabase Project URL |
| `supabaseAnonKey` | `YOUR_SUPABASE_ANON_KEY` | Your Supabase Publishable key |
| `communityName` | `Blood on the Clocktower` | Shown in the site header |
| `minGamesForLeaderboard` | `1` | Min games to appear on leaderboard |
| `defaultRating` | `1500` | Starting ELO for new players |
| `kFactor` | `32` | ELO volatility (higher = bigger swings) |

## Project structure

```
botc-web/
  index.html          # Leaderboard page
  analytics.html      # Analytics dashboard
  css/                # Stylesheets
  js/
    site-config.js    # YOUR SETTINGS (edit this!)
    supabase.js       # Database connection
    demo-data.js      # Sample data for demo mode
    app.js            # Leaderboard logic
    elo.js            # ELO rating engine
    gameEntry.js      # Game submission form
    analytics.js      # Stats computation
    analyticsApp.js   # Analytics page controller
    autocomplete.js   # Smart input suggestions
    config.js         # Character & script definitions
    settings.js       # Colorblind mode
setup/
  schema.sql          # Database setup (run first)
  seed-data.sql       # Sample data for Supabase (optional)
```

## Staying updated

Template repositories don't automatically sync when the original is updated. To get new features or bug fixes:

1. Check [RossFW/botc-stats](https://github.com/RossFW/botc-stats) for updates
2. Create a new repo from the template (click "Use this template" again)
3. Paste your `site-config.js` settings into the new copy
4. Update your GitHub Pages to point to the new repo

Your game data is safe in Supabase — it's not stored in the repo, so you won't lose anything.

## License

MIT - Use it, modify it, share it. Built for the BotC community.
