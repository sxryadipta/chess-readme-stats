export async function GET(request, context) {
  const { username } = await context.params

  // get current year and month for the API URL
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  // fetch this month's games and player stats in parallel
  const [gamesRes, statsRes] = await Promise.all([
    fetch(`https://api.chess.com/pub/player/${username}/games/${year}/${month}`),
    fetch(`https://api.chess.com/pub/player/${username}/stats`)
  ])

  // handle invalid username or API failure
  if (!gamesRes.ok || !statsRes.ok) {
    return new Response('Player not found', { status: 404 })
  }

  const { games } = await gamesRes.json()
  const stats = await statsRes.json()

  // handle no games this month
  if (!games || games.length === 0) {
    return new Response('No games found this month', { status: 404 })
  }

  // get last game and figure out which color you played
  const lastGame = games.at(-1)
  const myColor = lastGame.white.username.toLowerCase() === username.toLowerCase()
    ? 'white'
    : 'black'
  const opponentColor = myColor === 'white' ? 'black' : 'white'

  // extract all the fields we need
  const myRating = lastGame[myColor].rating
  const opponentRating = lastGame[opponentColor].rating
  const opponentUsername = lastGame[opponentColor].username
  const result = lastGame[myColor].result
  const ratingDiff = opponentRating - myRating

  // convert result to a readable sentence
  const resultMap = {
    win: 'Opponent resigned',
    resigned: 'You resigned',
    checkmated: 'You were checkmated',
    timeout: 'Opponent ran out of time',
    timevsinsufficient: 'Draw — time vs insufficient material',
    insufficient: 'Draw — insufficient material',
    stalemate: 'Draw by stalemate',
    agreed: 'Draw by agreement',
    repetition: 'Draw by repetition',
    abandoned: 'Opponent abandoned',
  }
  const resultLine = resultMap[result] ?? `Result: ${result}`

  // convert time_control to readable format
  const [base, increment] = lastGame.time_control.split('+')
  const minutes = Math.floor(Number(base) / 60)
  const timeLabel = increment
    ? `${minutes} min + ${increment} sec increment`
    : `${minutes} min`

  // count move number from PGN
  const moveMatches = lastGame.pgn.match(/(\d+)\./g)
  const moveCount = moveMatches ? moveMatches.length : 'unknown'

  // extract opening and ECO from PGN headers
  const openingMatch = lastGame.pgn.match(/\[Opening "(.+?)"\]/)
  const ecoMatch = lastGame.pgn.match(/\[ECO "(.+?)"\]/)
  const opening = openingMatch ? openingMatch[1] : null
  const eco = ecoMatch ? ecoMatch[1] : null

  // extract accuracy if available
  const accuracy = lastGame.accuracies?.[myColor] ?? null

  // Step 12: compute rating delta using last two games
  let ratingDelta = null
  if (games.length >= 2) {
    const prevGame = games.at(-2)
    const prevColor = prevGame.white.username.toLowerCase() === username.toLowerCase()
      ? 'white' : 'black'
    const prevRating = prevGame[prevColor].rating
    ratingDelta = myRating - prevRating
  }

  // Step 13: compute current streak
  let streak = 0
  let streakType = null
  for (let i = games.length - 1; i >= 0; i--) {
    const g = games[i]
    const color = g.white.username.toLowerCase() === username.toLowerCase()
      ? 'white' : 'black'
    const r = g[color].result
    const isWin = r === 'win' || r === 'timeout' || r === 'abandoned'
    const isDraw = r === 'agreed' || r === 'repetition' || r === 'stalemate'
      || r === 'insufficient' || r === 'timevsinsufficient'

    if (i === games.length - 1) {
      streakType = isWin ? 'win' : isDraw ? 'draw' : 'loss'
    }

    const matches = streakType === 'win' ? isWin
      : streakType === 'draw' ? isDraw
      : !isWin && !isDraw

    if (matches) streak++
    else break
  }
  const streakLabel = streakType === 'win'
    ? `${streak}-game win streak`
    : streakType === 'draw'
    ? `${streak}-game draw streak`
    : `${streak}-game losing skid`

  // computing this month's record
  let wins = 0, losses = 0, draws = 0
  for (const g of games) {
    const color = g.white.username.toLowerCase() === username.toLowerCase()
      ? 'white' : 'black'
    const r = g[color].result
    if (r === 'win' || r === 'timeout' || r === 'abandoned') wins++
    else if (r === 'agreed' || r === 'repetition' || r === 'stalemate'
      || r === 'insufficient' || r === 'timevsinsufficient') draws++
    else losses++
  }

  // most active hour
  const hourBuckets = Array(24).fill(0)
  for (const g of games) {
    const hour = new Date(g.end_time * 1000).getHours()
    hourBuckets[hour]++
  }
  const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets))
  const timeOfDay = peakHour >= 5 && peakHour < 12 ? 'mornings'
    : peakHour >= 12 && peakHour < 17 ? 'afternoons'
    : peakHour >= 17 && peakHour < 21 ? 'evenings'
    : 'late night'

  // personal best from stats
  const personalBest = stats.chess_blitz?.best?.rating
    ?? stats.chess_rapid?.best?.rating
    ?? null

  // game date from PGN header
  const dateMatch = lastGame.pgn.match(/\[Date "(.+?)"\]/)
  const gameDate = dateMatch
    ? dateMatch[1].replace(/\./g, '-')
    : new Date(lastGame.end_time * 1000).toDateString()

  const monthName = now.toLocaleString('default', { month: 'short' })
  const day = now.getDate()
  const displayDate = dateMatch
    ? dateMatch[1].replace(/\./g, '-')
    : `${monthName} ${day}, ${year}`

  const timeClassLabel = lastGame.time_class.charAt(0).toUpperCase()
    + lastGame.time_class.slice(1)

  const colorLabel = myColor.charAt(0).toUpperCase() + myColor.slice(1)

  const ratingBefore = myRating - (ratingDelta ?? 0)
  const ratingDeltaStr = ratingDelta !== null
    ? `${ratingDelta >= 0 ? '+' : ''}${ratingDelta}`
    : null

  const diffLabel = `${Math.abs(ratingDiff)} points ${ratingDiff >= 0 ? 'above' : 'below'} you`

  const lines = [
    `---`,
    ``,
    `### ♟ Last Match`,
    ``,
    `${displayDate} · ${timeClassLabel} (${timeLabel}) · Playing as ${colorLabel}`,
    ``,
    `${resultLine} after ${moveCount} moves`,
    ``,
    opening || eco
      ? `Opening: ${opening ?? ''}${opening && eco ? ' · ' : ''}${eco ? `ECO ${eco}` : ''}`
      : null,
    accuracy
      ? `Accuracy: ${Number(accuracy).toFixed(1)}%`
      : null,
    ``,
    `Opponent: ${opponentUsername} · ${opponentRating} rated (${diffLabel})`,
    ``,
    ratingDelta !== null
      ? `Rating: ${ratingBefore} → ${myRating} (${ratingDeltaStr})`
      : null,
    `Streak: ${streakLabel}`,
    `This month: ${wins}W ${losses}L ${draws}D (${timeClassLabel})`,
    ``,
    `Peak hours: ${timeOfDay}`,
    personalBest ? `Personal best: ${personalBest}` : null,
    ``,
    `---`,
  ]
    .filter(line => line !== null)
    .join('\n')

  return new Response(lines, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
  
}