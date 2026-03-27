import { Hono } from 'hono'
import { db } from '../db'

export const genresRoute = new Hono()

// Genres don't change — compute once and cache in-process
let cachedGenres: { genre: string; count: number }[] | null = null

genresRoute.get('/', async c => {
  if (cachedGenres) return c.json(cachedGenres)

  const movies = await db.movie.findMany({ select: { genres: true } })
  const counts = new Map<string, number>()
  for (const { genres } of movies) {
    for (const g of genres) counts.set(g, (counts.get(g) ?? 0) + 1)
  }
  cachedGenres = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => ({ genre, count }))

  return c.json(cachedGenres)
})