import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const TARGET_SESSIONS = 5000
const MOVIE_POOL = 500   // distribute clicks among top-rated movies

function randomTimestamp(daysAgo: number): Date {
  const now = Date.now()
  const past = now - daysAgo * 24 * 60 * 60 * 1000
  return new Date(past + Math.random() * (now - past))
}

/** Power-law-like weight: rank 1 gets most clicks */
function weightedRandom(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

async function main() {
  console.log('Loading top movies for seeding...')
  const movies = await prisma.movie.findMany({
    orderBy: { avgRating: 'desc' },
    take: MOVIE_POOL,
    select: { id: true, avgRating: true },
  })

  const weights = movies.map((m, i) => Math.pow(m.avgRating, 3) / (i + 1))

  console.log(`Generating ${TARGET_SESSIONS} synthetic sessions...`)
  const sessions = Array.from({ length: TARGET_SESSIONS }, () => {
    const idx = weightedRandom(weights)
    return {
      sessionId: `seed-${Math.random().toString(36).slice(2)}`,
      movieId: movies[idx].id,
      timestamp: randomTimestamp(30),
    }
  })

  await prisma.userSession.createMany({ data: sessions })

  // Update clickCount on Movie
  const countByMovie = new Map<number, number>()
  for (const s of sessions) countByMovie.set(s.movieId, (countByMovie.get(s.movieId) ?? 0) + 1)

  for (const [movieId, count] of countByMovie) {
    await prisma.movie.update({ where: { id: movieId }, data: { clickCount: { increment: count } } })
  }

  console.log(`Done. Seeded ${sessions.length} sessions across ${countByMovie.size} movies.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
