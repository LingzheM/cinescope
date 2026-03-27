import { useState, useEffect, useRef } from 'react'
import { fetchSearch } from '../api'
import type { SearchResult } from '@cinescope/shared'

const DEBOUNCE_MS = 150

export function useSearch() {
  const [query, setQuery] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number | undefined>()
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!query && genres.length === 0 && !minRating) {
      setResult(null)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await fetchSearch(query || '*', { genres, minRating })
        setResult(data)
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
  }, [query, genres, minRating])

  return { query, setQuery, genres, setGenres, minRating, setMinRating, result, loading }
}