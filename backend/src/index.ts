import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { searchRoute } from './routes/search'
import { moviesRoute } from './routes/movies'
import { trendingRoute } from './routes/trending'
import { trackRoute } from './routes/track'
import { genresRoute } from './routes/genres'

const app = new Hono()
app.use('*', cors())

app.route('/api/search', searchRoute)
app.route('/api/movies', moviesRoute)
app.route('/api/trending', trendingRoute)
app.route('/api/track', trackRoute)
app.route('/api/genres', genresRoute)

app.get('/health', c => c.json({ ok: true }))

const port = parseInt(process.env.PORT ?? '3001')
serve({ fetch: app.fetch, port }, () => console.log(`Backend running on http://localhost:${port}`))
