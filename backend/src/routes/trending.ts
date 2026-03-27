import { Hono } from 'hono'
import { db } from '../db'

export const trendingRoute = new Hono()

trendingRoute.get('/', async c => {
  const limit = parseInt(c.req.query('limit') ?? '10')
  const windowDays = parseInt((c.req.query('window') ?? '7d').replace('d', ''))
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000)

  // Group UserSession clicks by movieId within the time window
  const clicks = await db.userSession.groupBy({
    by: ['movieId'],
    where: { timestamp: { gte: since } },
    _count: { movieId: true },
    orderBy: { _count: { movieId: 'desc' } },
    take: limit,
  })

  const movieIds = clicks.map(c => c.movieId)
  const movies = await db.movie.findMany({ where: { id: { in: movieIds } } })

  // Sort movies to match click ranking order
  const movieById = new Map(movies.map(m => [m.id, m]))
  const sorted = movieIds.map(id => movieById.get(id)).filter(Boolean)

  return c.json({ movies: sorted, window: `${windowDays}d` })
})