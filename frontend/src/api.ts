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