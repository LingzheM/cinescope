import { Hono } from 'hono'
import { db } from '../db'
import type { MovieDetail, SimilarMovie } from '@cinescope/shared'

export const moviesRoute = new Hono()

moviesRoute.get('/:id', async c => {
  const id = parseInt(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)

  const movie = await db.movie.findUnique({ where: { id } })
  if (!movie) return c.json({ error: 'Not found' }, 404)

  const cfRows = await db.cFSimilarity.findMany({
    where: { movieId: id },
    orderBy: { score: 'desc' },
    take: 5,
    include: { movie: false },
  })

  const similarMovies = await db.movie.findMany({
    where: { id: { in: cfRows.map(r => r.similarMovieId) } },
  })

  const scoreById = new Map(cfRows.map(r => [r.similarMovieId, r.score]))
  const similar: SimilarMovie[] = similarMovies
    .map(m => ({ ...m, similarityScore: scoreById.get(m.id) ?? 0 }))
    .sort((a, b) => b.similarityScore - a.similarityScore)

  const detail: MovieDetail = { ...movie, similar }
  return c.json(detail)
})