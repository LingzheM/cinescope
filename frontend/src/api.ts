import type { Movie, MovieDetail, SearchResult, TrendingResponse, TrackPayload } from '@cinescope/shared'

const BASE = '/api'

export async function fetchSearch(
  q: string,
  opts: { genres?: string[]; minRating?: number } = {}
): Promise<SearchResult> {
  const params = new URLSearchParams({ q })
  if (opts.genres?.length) params.set('genres', opts.genres.join(','))
  if (opts.minRating) params.set('minRating', String(opts.minRating))
  const res = await fetch(`${BASE}/search?${params}`)
  return res.json()
}

export async function fetchTrending(limit = 10): Promise<TrendingResponse> {
  const res = await fetch(`${BASE}/trending?limit=${limit}`)
  return res.json()
}

export async function fetchMovie(id: number): Promise<MovieDetail> {
  const res = await fetch(`${BASE}/movies/${id}`)
  return res.json()
}

export async function fetchGenres(): Promise<{ genre: string; count: number }[]> {
  const res = await fetch(`${BASE}/genres`)
  return res.json()
}

export async function postTrack(payload: TrackPayload): Promise<void> {
  await fetch(`${BASE}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}