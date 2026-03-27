import { Hono } from 'hono'
import { db } from '../db'
import type { TrackPayload } from '@cinescope/shared'

export const trackRoute = new Hono()

trackRoute.post('/', async c => {
  const body = await c.req.json<TrackPayload>()
  if (!body.movieId || !body.sessionId) return c.json({ error: 'Missing fields' }, 400)

  await db.$transaction([
    db.userSession.create({ data: { sessionId: body.sessionId, movieId: body.movieId } }),
    db.movie.update({ where: { id: body.movieId }, data: { clickCount: { increment: 1 } } }),
  ])

  return c.json({ ok: true })
})