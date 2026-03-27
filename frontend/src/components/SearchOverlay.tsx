import { useEffect } from 'react'
import { useSearch } from '../hooks/useSearch'
import { MovieCard } from './MovieCard'
import type { Movie } from '@cinescope/shared'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (movie: Movie) => void
  availableGenres: string[]
}

export function SearchOverlay({ open, onClose, onSelect, availableGenres }: Props) {
  const { query, setQuery, genres, setGenres, minRating, setMinRating, result, loading } = useSearch()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  function toggleGenre(g: string) {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <span className="text-slate-500">🔍</span>
          <input
            autoFocus
            className="flex-1 bg-transparent text-white text-base outline-none placeholder-slate-500"
            placeholder="Search 9,742 movies..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className="text-slate-500 text-sm cursor-pointer" onClick={onClose}>ESC</span>
        </div>

        <div className="flex max-h-[60vh]">
          {/* Facets */}
          <div className="w-44 flex-shrink-0 p-4 border-r border-slate-800 overflow-y-auto">
            <p className="text-xs font-bold text-slate-500 tracking-widest mb-3">GENRE</p>
            <div className="space-y-1">
              {availableGenres.slice(0, 12).map(g => (
                <label key={g} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genres.includes(g)}
                    onChange={() => toggleGenre(g)}
                    className="accent-violet-500"
                  />
                  {g}
                </label>
              ))}
            </div>
            <p className="text-xs font-bold text-slate-500 tracking-widest mt-4 mb-3">RATING</p>
            {[undefined, 3, 4, 4.5].map(r => (
              <label key={String(r)} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === r}
                  onChange={() => setMinRating(r)}
                  className="accent-violet-500"
                />
                {r ? `★ ${r}+` : 'Any'}
              </label>
            ))}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {loading && <p className="p-4 text-slate-500 text-sm">Searching...</p>}
            {!loading && result && (
              <>
                <p className="px-4 pt-3 text-xs text-slate-500">{result.total} results</p>
                {result.hits.map(movie => (
                  <div key={movie.id} className="px-4 py-1 border-b border-slate-800/50">
                    <MovieCard movie={movie} variant="compact" onClick={() => { onSelect(movie); onClose() }} />
                  </div>
                ))}
              </>
            )}
            {!loading && !result && (
              <p className="p-4 text-slate-500 text-sm">Start typing to search...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}