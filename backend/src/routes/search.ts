import { Hono } from 'hono'
import { TYPESENSE_BASE, TYPESENSE_HEADERS } from '../typesense-client'
import type { SearchResult } from '@cinescope/shared'

export const searchRoute = new Hono()

searchRoute.get('/', async c => {
  const q = c.req.query('q') ?? '*'
  const genres = c.req.query('genres')   // comma-separated
  const minRating = c.req.query('minRating')
  const year = c.req.query('year')

  const filterParts: string[] = []
  if (genres) filterParts.push(`genres:=[${genres.split(',').map(g => `\`${g}\``).join(',')}]`)
  if (minRating) filterParts.push(`avgRating:>=${minRating}`)
  if (year) filterParts.push(`year:=${year}`)

  const params = new URLSearchParams({
    q,
    query_by: 'title',
    sort_by: '_text_match:desc,clickCount:desc',
    per_page: '20',
    facet_by: 'genres,avgRating',
    ...(filterParts.length > 0 ? { filter_by: filterParts.join(' && ') } : {}),
  })

  const res = await fetch(`${TYPESENSE_BASE}/collections/movies/documents/search?${params}`, {
    headers: TYPESENSE_HEADERS,
  })
  const data = await res.json() as any

  const result: SearchResult = {
    hits: data.hits?.map((h: any) => ({ ...h.document, id: parseInt(h.document.id) })) ?? [],
    total: data.found ?? 0,
    facetCounts: {
      genres: data.facet_counts?.find((f: any) => f.field_name === 'genres')
        ?.counts?.map((fc: any) => ({ value: fc.value, count: fc.count })) ?? [],
    },
  }

  return c.json(result)
})