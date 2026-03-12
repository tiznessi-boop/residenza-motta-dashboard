# Residenza Motta — Operations Dashboard

Hotel operations intelligence dashboard for Residenza Motta, Locarno (Ticino).  
Built with Next.js + Recharts. Ready for Vercel deployment.

## Quick Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. **Create a GitHub account** (if you don't have one) at [github.com](https://github.com)
2. **Create a new repository**:
   - Go to [github.com/new](https://github.com/new)
   - Name it `residenza-motta-dashboard`
   - Keep it **Private** (so only you and partners see the code)
   - Click "Create repository"

3. **Upload the files**:
   - On the repo page, click "uploading an existing file"
   - Drag and drop ALL files from this folder
   - Click "Commit changes"

4. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up with GitHub
   - Click "Add New Project"
   - Import your `residenza-motta-dashboard` repo
   - Click "Deploy" — no settings to change
   - In ~60 seconds you'll have a live URL like: `residenza-motta-dashboard.vercel.app`

5. **Share the URL** with your business partners!

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# From this project folder, run:
vercel

# Follow the prompts, and you'll get a live URL
```

## Updating Data

When you have new Amenitiz exports:
1. Upload the new files to Claude
2. Ask Claude to regenerate the dashboard
3. Replace the `components/Dashboard.jsx` file in your repo
4. Vercel auto-deploys on push (if using GitHub)

## Tech Stack

- **Next.js 14** — React framework
- **Recharts** — Charts and visualizations
- **DM Sans** — Typography

## Structure

```
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.js        # HTML shell + fonts
│   └── page.js          # Entry point
├── components/
│   └── Dashboard.jsx    # Main dashboard (all data + UI)
├── package.json
├── next.config.js
└── README.md
```
