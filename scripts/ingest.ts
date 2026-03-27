import { readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'
import { parseCsv } from './lib/csv-parser'

const prisma = new PrismaClient()
const TYPESENSE_URL = `http://${process.env.TYPESENSE_HOST ?? 'localhost'}:${process.env.TYPESENSE_PORT ?? '8108'}`
const TYPESENSE_KEY = process.env.TYPESENSE_API_KEY ?? 'cinescope-dev-key'

// ---- helpers ----

function extractYear(title: string): { cleanTitle: string; year: number | null } {
  const match = title.match(/^(.*)\s+\((\d{4})\)\s*$/)
  if (!match) return { cleanTitle: title.trim(), year: null }
  return { cleanTitle: match[1].trim(), year: parseInt(match[2]) }
}

async function ensureTypesenseCollection() {
  const res = await fetch(`${TYPESENSE_URL}/collections/movies`, {
    headers: { 'X-TYPESENSE-API-KEY': TYPESENSE_KEY },
  })
  if (res.ok) {
    console.log('Dropping existing Typesense collection...')
    await fetch(`${TYPESENSE_URL}/collections/movies`, {
      method: 'DELETE',
      headers: { 'X-TYPESENSE-API-KEY': TYPESENSE_KEY },
    })
  }
  console.log('Creating Typesense collection...')
  await fetch(`${TYPESENSE_URL}/collections`, {
    method: 'POST',
    headers: { 'X-TYPESENSE-API-KEY': TYPESENSE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'movies',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'year', type: 'int32', optional: true },
        { name: 'genres', type: 'string[]', facet: true },
        { name: 'avgRating', type: 'float', facet: true },
        { name: 'ratingCount', type: 'int32' },
        { name: 'clickCount', type: 'int32' },
      ],
      default_sorting_field: 'clickCount',
    }),
  })
}

// ---- main ----

async function main() {
  console.log('Parsing movies.csv...')
  const moviesRaw = readFileSync('data/ml-latest-small/movies.csv', 'utf8')
  const movieRows = parseCsv(moviesRaw)

  console.log('Parsing ratings.csv...')
  const ratingsRaw = readFileSync('data/ml-latest-small/ratings.csv', 'utf8')
  const ratingRows = parseCsv(ratingsRaw)

  // Aggregate ratings per movie
  const ratingMap = new Map<number, { sum: number; count: number }>()
  for (const [userIdStr, movieIdStr, scoreStr] of ratingRows) {
    const movieId = parseInt(movieIdStr)
    const score = parseFloat(scoreStr)
    const existing = ratingMap.get(movieId)
    if (existing) { existing.sum += score; existing.count++ }
    else ratingMap.set(movieId, { sum: score, count: 1 })
  }

  // Build movie records
  const movies = movieRows.map(([idStr, rawTitle, genresStr]) => {
    const id = parseInt(idStr)
    const { cleanTitle, year } = extractYear(rawTitle)
    const genres = genresStr.split('|').filter(g => g !== '(no genres listed)')
    const agg = ratingMap.get(id)
    const avgRating = agg ? Math.round((agg.sum / agg.count) * 10) / 10 : 0
    const ratingCount = agg?.count ?? 0
    return { id, title: cleanTitle, year, genres, avgRating, ratingCount, clickCount: 0 }
  })

  console.log(`Upserting ${movies.length} movies to Postgres...`)
  await prisma.$transaction(
    movies.map(m =>
      prisma.movie.upsert({ where: { id: m.id }, create: m, update: m })
    )
  )

  console.log(`Inserting ${ratingRows.length} ratings to Postgres...`)
  const ratings = ratingRows.map(([userIdStr, movieIdStr, scoreStr]) => ({
    userId: parseInt(userIdStr),
    movieId: parseInt(movieIdStr),
    score: parseFloat(scoreStr),
  }))
  await prisma.rating.createMany({ data: ratings, skipDuplicates: true })

  console.log('Indexing movies in Typesense...')
  await ensureTypesenseCollection()
  const BATCH = 500
  for (let i = 0; i < movies.length; i += BATCH) {
    const batch = movies.slice(i, i + BATCH)
    const ndjson = batch.map(m => JSON.stringify({ ...m, id: String(m.id) })).join('\n')
    const res = await fetch(`${TYPESENSE_URL}/collections/movies/documents/import?action=upsert`, {
      method: 'POST',
      headers: { 'X-TYPESENSE-API-KEY': TYPESENSE_KEY, 'Content-Type': 'text/plain' },
      body: ndjson,
    })
    const text = await res.text()
    const errors = text.split('\n').filter(l => l && !JSON.parse(l).success)
    if (errors.length > 0) console.warn(`Batch ${i / BATCH}: ${errors.length} errors`)
    else console.log(`Batch ${i / BATCH + 1}: OK`)
  }

  console.log('Done.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
