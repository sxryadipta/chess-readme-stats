


<div align="center">

# chess-readme-stats

**Automatically display your latest Chess.com games and stats on your GitHub profile README.**

Inspired by [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) · Built for chess players on GitHub

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Deploy with Vercel](https://img.shields.io/badge/deploy-Vercel-black.svg)](https://vercel.com)
[![SVG](https://img.shields.io/badge/Output-SVG-orange)](#)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen)](#)

---

![Chess Stats Card](https://chess-readme-stats.vercel.app/api/card/hikaru.svg)

</div>

---

## What is this?

**chess-readme-stats** gives your GitHub profile README a live chess section — no manual updates, no maintenance.

Two modes:

- **Story mode** — a narrative text block that updates via GitHub Actions every 6 hours, showing your last game, opening, accuracy, rating change, streak, and monthly record
- **Card mode** — a single image URL you embed anywhere, updates automatically on every page load, no workflow needed

---

## Demo

### Story mode

---

2026-06-10 · Blitz (3 min) · Playing as White

Opponent resigned after 38 moves

Opening: Sicilian Defense · ECO B20
Accuracy: 91.2%

Opponent: johndoe · 1542 rated (55 points above you)

Rating: 1487 → 1495 (+8)
Streak: 5-game win streak
This month: 21W 9L 3D (Blitz)

Peak hours: evenings
Personal best: 1623

---

### Card mode

![Chess Stats Card](https://chess-readme-stats.vercel.app/api/card/hikaru.svg)

---

## Quick start

### Card mode (easiest — 30 seconds)

Add this one line to your GitHub profile `README.md`:

```md
![Chess Stats](https://chess-readme-stats.vercel.app/api/card/YOUR_CHESSCOM_USERNAME.svg)
```

Done. The card updates automatically every time someone views your profile.

---

### Story mode (auto-updates via GitHub Actions)

**Step 1** — Add these tokens to your profile `README.md` where you want the story:

```md
<!-- CHESS_STORY -->
<!-- /CHESS_STORY -->
```

**Step 2** — Create `.github/workflows/chess.yml` in your profile repo:

```yaml
name: Update Chess Story
on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - name: Fetch chess story
        run: |
          curl -s "https://chess-readme-stats.vercel.app/api/story/YOUR_CHESSCOM_USERNAME" > /tmp/chess.md

      - name: Inject into README
        run: |
          node -e "
            const fs = require('fs');
            let readme = fs.readFileSync('README.md', 'utf8');
            const story = fs.readFileSync('/tmp/chess.md', 'utf8');
            readme = readme.replace(
              /(<!-- CHESS_STORY -->)[\s\S]*?(<!-- \/CHESS_STORY -->)/,
              \`<!-- CHESS_STORY -->\n\${story}\n<!-- /CHESS_STORY -->\`
            );
            fs.writeFileSync('README.md', readme);
          "

      - name: Commit changes
        run: |
          git config user.name "chess-bot"
          git config user.email "bot@users.noreply.github.com"
          git add README.md
          git diff --staged --quiet || git commit -m "update chess story"
          git push
```

**Step 3** — Go to Actions → Update Chess Story → Run workflow.

That's it. Your README now updates every 6 hours automatically.

---

## What data is shown

| Field | Source | Notes |
|---|---|---|
| Last game result | Chess.com API | Win / loss / draw with how it ended |
| Time control | Chess.com API | Blitz, Rapid, Bullet in plain English |
| Opening | PGN ECOUrl header | Most reliable opening source |
| Accuracy | Chess.com analysis | Shown only when available |
| Rating delta | Computed from last 2 games | `+8` or `-5` |
| Win streak | Computed from game history | Per time class |
| Monthly record | Computed from game history | Per time class |
| Peak hours | Computed from end timestamps | Morning / afternoon / evening / late night |
| Personal best | Chess.com stats API | Blitz peak, falls back to Rapid |
| Current rapid rating | Chess.com stats API | Live |
| Peak rapid rating | Chess.com stats API | All-time best |
| Win rate | Computed from record | Rapid games |
| Country | Chess.com profile API | Country code |
| Total games | Chess.com stats API | Rapid |

---

## API endpoints

Both endpoints are public and require no authentication.

```
GET /api/story/:username     → plain text markdown narrative
GET /api/card/:username.svg  → SVG image card
```

You can call them directly from any workflow, script, or README.

---

## Self-hosting

Want to run your own instance?

```bash
git clone https://github.com/sxryadipta/chess-readme-stats
cd chess-readme-stats
npm install
npm run dev
```

Deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sxryadipta/chess-readme-stats)

---

## Contributing

Contributions are what make open source worth building. Any contribution is welcome — bug fixes, new features, design improvements, or just opening an issue with an idea.

### Good first issues to start with

- [ ] Add Blitz and Bullet card variants
- [ ] Add a `theme=light` query param for light mode cards
- [ ] Cache responses to reduce Chess.com API load
- [ ] Add last 30 days rating sparkline to the card
- [ ] Support Lichess usernames in addition to Chess.com
- [ ] Add most played opening of all time (not just this month)
- [ ] Country code → full country name lookup table

### How to contribute

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Open a pull request with a clear description of what you changed and why

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a PR.

---

## Roadmap

- [x] Story mode narrative
- [x] SVG stats card
- [x] Website with live preview and copy-paste setup
- [ ] Light mode card theme
- [ ] Blitz / Bullet rating variants
- [ ] Rating history sparkline
- [ ] Lichess support
- [ ] Reusable GitHub Action (installable via `uses:`)

---

## Acknowledgements

- [Chess.com Public API](https://www.chess.com/news/view/published-data-api) — free, no auth required
- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) — the original inspiration
- [Next.js](https://nextjs.org) + [Vercel](https://vercel.com) — deployment infrastructure

---

## License

MIT © [Suryadipta Ghosh](https://github.com/sxryadipta)

---

<div align="center">

If this saved you time, a ⭐ on the repo goes a long way.

**[Try it now →](https://chess-readme-stats.vercel.app)**

</div>
