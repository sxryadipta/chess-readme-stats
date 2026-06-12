# Contributing to chess-readme-stats

First off- thank you. This project exists because people like you take time to make open source better. Whether you're fixing a typo, adding a feature, or opening an issue with a good idea, it all matters.

---

## Before you start

- Check the [open issues](https://github.com/sxryadipta/chess-readme-stats/issues) to see if what you want to work on already exists
- If you're planning something large, open an issue first and describe what you want to build; this avoids duplicate work and lets us align before you invest time
- For small fixes (typos, broken links, minor bugs), just open a PR directly

---

## Good first issues

If you're new to the codebase, these are well-scoped starting points:

- Country code → full country name lookup table (e.g. `IN` → `India`)
- Add `theme=light` query param support for the SVG card
- Add Blitz and Bullet rating variants to the card (currently only Rapid)
- Cache Chess.com API responses to reduce repeated fetches
- Add a rating history sparkline to the card
- Lichess username support alongside Chess.com

---

## Project structure

```
chess-readme-stats/
  app/
    page.jsx                          ← frontend website
    api/
      story/
        [username]/
          route.js                    ← story mode API endpoint
      card/
        [username]/
          route.js                    ← SVG card API endpoint
  public/                             ← static assets
  next.config.mjs                     ← Next.js config (SVG rewrite lives here)
  package.json
```

The two route files are where most feature work happens. The frontend in `page.jsx` is a single React component. There is no database, no auth, no external state — everything is stateless and per-request.

---

## Setting up locally

You need Node.js 18 or higher.

```bash
# fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/chess-readme-stats
cd chess-readme-stats

# install dependencies
npm install

# start the dev server
npm run dev
```

The app runs at `http://localhost:3000`. The API endpoints are at:

```
http://localhost:3000/api/story/:username
http://localhost:3000/api/card/:username.svg
```

No environment variables needed. The Chess.com API is fully public.

---

## Making changes

```bash
# create a branch for your work
git checkout -b feature/your-feature-name

# make your changes
# test manually at localhost:3000

# commit
git add .
git commit -m "brief description of what you changed"

# push to your fork
git push origin feature/your-feature-name
```

Then open a pull request from your fork to the `main` branch of this repo.

---

## Pull request guidelines

**Keep PRs focused.** One feature or fix per PR. If you have two unrelated changes, open two PRs. This makes reviewing faster and keeps the git history clean.

**Describe what you changed and why.** Not just what the code does; why the change is needed or what problem it solves. A one-paragraph description is enough for most PRs.

**Test your change manually** before opening the PR. Hit your local API endpoint, embed the card in a test README, run the story workflow on a test repo if it's relevant to your change.

**Don't break existing behaviour.** If your change affects the story output format or the SVG card layout, mention it explicitly in the PR description so users know what to expect.

---

## What makes a good issue

When opening a bug report, include:

- Your Chess.com username (so we can reproduce with real data)
- What you expected to happen
- What actually happened
- Any error messages from the browser console or terminal

When opening a feature request, include:

- What you want the tool to do that it doesn't do now
- Why it's useful — who benefits and in what situation
- Any relevant Chess.com API fields that would make it possible

---

## Code style

There is no linter configured beyond ESLint defaults from Next.js. Just try to match the style of the existing code:

- Plain JavaScript, no TypeScript
- `async/await` over `.then()` chains
- Descriptive variable names over short ones
- Comments on anything non-obvious, especially Chess.com API quirks

---

## Things we won't merge

- Changes that require a database or persistent storage — this project is intentionally stateless
- Paid API integrations — everything must work with Chess.com's free public API
- Dependencies that significantly increase bundle size without clear benefit
- Breaking changes to the existing URL structure (`/api/story/:username` and `/api/card/:username.svg`) — these are public endpoints that users have embedded in their READMEs

---

## Questions

Open an issue and tag it `question`. No question is too small.

---

Thanks again for contributing. Every improvement here ends up on someone's GitHub profile — which is a genuinely nice thing to be part of.
