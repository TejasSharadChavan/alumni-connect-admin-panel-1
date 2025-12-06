# 🚀 Quick Start - Populate Feed with Real Data

## Your feed is currently empty because there are no posts in the database yet.

---

## Run This Command:

```bash
cd alumni-connect-admin-panel-1
bun run scripts/seed-posts.ts
```

---

## What This Does:

✅ Creates **15 realistic posts** from actual users in your system
✅ Uses **stable Unsplash images** (won't change)
✅ Covers **all categories**: General, Career, Events, Academic, Achievements, Announcements
✅ Distributes posts among **real users** in the database
✅ Sets **random timestamps** (last 7 days) for realistic feed
✅ All posts are **approved** and ready to display

---

## After Running:

1. Refresh your feed page (`/feed`)
2. You should see 15 posts
3. Try filtering by category (left sidebar)
4. Try reacting, commenting, sharing

---

## Sample Posts You'll See:

- 🏆 "Excited to share that I've completed my Machine Learning certification..."
- 🎤 "Our college tech fest is coming up next month..."
- 💼 "Just landed my dream job as a Software Engineer..."
- 📚 "Reminder: Final year project submissions are due next week..."
- 🤝 "Alumni meetup this Saturday at 5 PM..."
- And 10 more!

---

## Optional: Clear Existing Posts First

If you want to start fresh:

```bash
bun run scripts/clear-posts.ts
```

Then run the seed script.

---

## That's It!

Your feed will be populated with realistic, engaging content from real users in your system.

Users can then create their own posts through the "Create Post" button.
