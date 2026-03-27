export interface Movie {
  id: number
  title: string
  year?: number
  genres: string[]
  avgRating: number
  ratingCount: number
  clickCount: number
}

export interface FacetCount {
  value: string
  count: number
}

export interface SearchResult {
  hits: Movie[]
  total: number
  facetCounts: {
    genres: FacetCount[]
    // avgRating facet reserved for future use
  }
}

export interface SimilarMovie extends Movie {
  similarityScore: number
}

export interface MovieDetail extends Movie {
  similar: SimilarMovie[]
}

export interface TrendingResponse {
  movies: Movie[]
  window: string
}

export interface TrackPayload {
  movieId: number
  sessionId: string
}