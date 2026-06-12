export async function GET(request, context) {
  const { username: rawUsername } = await context.params
  const username = rawUsername.replace(/\.svg$/, '')
  const [statsRes, profileRes] = await Promise.all([
    fetch(`https://api.chess.com/pub/player/${username}/stats`),
    fetch(`https://api.chess.com/pub/player/${username}`)
  ])

  if (!statsRes.ok || !profileRes.ok) {
    return new Response('Player not found', { status: 404 })
  }

  const stats = await statsRes.json()
  const profile = await profileRes.json()

  // current and peak rapid rating
  const rapidCurrent = stats.chess_rapid?.last?.rating ?? 'N/A'
  const rapidPeak = stats.chess_rapid?.best?.rating ?? 'N/A'

  // total rapid games and win rate
  const rapidWins = stats.chess_rapid?.record?.win ?? 0
  const rapidLosses = stats.chess_rapid?.record?.loss ?? 0
  const rapidDraws = stats.chess_rapid?.record?.draw ?? 0
  const totalGames = rapidWins + rapidLosses + rapidDraws
  const winRate = totalGames > 0
    ? ((rapidWins / totalGames) * 100).toFixed(1)
    : 'N/A'

  // country — Chess.com gives a URL like https://api.chess.com/pub/country/US
  const countryCode = profile.country?.split('/').at(-1) ?? null
  const countryDisplay = countryCode ?? 'Unknown'

  // most played opening — needs this month's games
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  let topOpening = 'N/A'
  try {
    const gamesRes = await fetch(
      `https://api.chess.com/pub/player/${username}/games/${year}/${month}`
    )
    if (gamesRes.ok) {
      const { games } = await gamesRes.json()
      if (games && games.length > 0) {
        const openingCount = {}
        for (const g of games) {
          const match = g.pgn?.match(/\[ECOUrl "(.+?)"\]/)
          if (match) {
            const slug = match[1].split('/openings/')[1]?.split('?')[0]
            if (slug) {
              const name = slug.replace(/\.\.\./g, ' — ').replace(/-/g, ' ').trim()
              openingCount[name] = (openingCount[name] ?? 0) + 1
            }
          }
        }
        const sorted = Object.entries(openingCount).sort((a, b) => b[1] - a[1])
        if (sorted.length > 0) topOpening = sorted[0][0]
      }
    }
  } catch (_) {}

  // truncate long opening names so they fit the card
  const openingDisplay = topOpening.length > 40
    ? topOpening.slice(0, 38) + '…'
    : topOpening

  const svg = `
<svg width="480" height="200" viewBox="0 0 480 200"
  xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="Chess stats for ${username}">
  <title>Chess stats — ${username}</title>

  <rect width="480" height="200" rx="12"
    fill="#161b22" stroke="#30363d" stroke-width="1"/>

  <text x="24" y="36"
    font-family="monospace" font-size="11" fill="#58a6ff">chess stats</text>

  <text x="24" y="64"
    font-family="monospace" font-size="22" font-weight="600"
    fill="#e6edf3">${username}</text>

  <text x="${24 + username.length * 14}" y="64"
    font-family="monospace" font-size="13"
    fill="#8b949e">${countryDisplay}</text>

  <line x1="24" y1="78" x2="456" y2="78"
    stroke="#30363d" stroke-width="0.8"/>

  <text x="24" y="105"
    font-family="monospace" font-size="11" fill="#8b949e">rapid rating</text>
  <text x="24" y="124"
    font-family="monospace" font-size="20" font-weight="600"
    fill="#e6edf3">${rapidCurrent}</text>

  <text x="128" y="105"
    font-family="monospace" font-size="11" fill="#8b949e">peak rating</text>
  <text x="128" y="124"
    font-family="monospace" font-size="20" font-weight="600"
    fill="#e6edf3">${rapidPeak}</text>

  <text x="248" y="105"
    font-family="monospace" font-size="11" fill="#8b949e">win rate</text>
  <text x="248" y="124"
    font-family="monospace" font-size="20" font-weight="600"
    fill="#58a6ff">${winRate}%</text>

  <text x="356" y="105"
    font-family="monospace" font-size="11" fill="#8b949e">total games</text>
  <text x="356" y="124"
    font-family="monospace" font-size="20" font-weight="600"
    fill="#e6edf3">${totalGames.toLocaleString()}</text>

  <line x1="24" y1="138" x2="456" y2="138"
    stroke="#30363d" stroke-width="0.8"/>

  <text x="24" y="160"
    font-family="monospace" font-size="11" fill="#8b949e">most played opening this month</text>
  <text x="24" y="178"
    font-family="monospace" font-size="13"
    fill="#e6edf3">${openingDisplay}</text>

  <text x="380" y="192"
    font-family="monospace" font-size="9"
    fill="#484f58">chess-readme-stats</text>
</svg>`

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-cache, max-age=0, must-revalidate',
    },
  })
}