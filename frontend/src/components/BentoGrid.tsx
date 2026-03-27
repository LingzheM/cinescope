import { useState, useEffect } from 'react'
import type { Movie, MovieDetail } from '@cinescope/shared'
import { fetchTrending, fetchGenres, fetchMovie } from '../api'
import { useTracking } from '../hooks/useTracking'
import { MovieCard } from './MovieCard'
import { TrendingList } from './TrendingList'
import { SearchOverlay } from './SearchOverlay'

export function BentoGrid() {
  const [trending, setTrending] = useState<Movie[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [selected, setSelected] = useState<MovieDetail | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const { trackView } = useTracking()

  useEffect(() => {
    fetchTrending(10).then(r => setTrending(r.movies))
    fetchGenres().then(gs => setGenres(gs.map(g => g.genre)))
  }, [])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function handleSelectMovie(movie: Movie) {
    trackView(movie.id)
    const detail = await fetchMovie(movie.id)
    setSelected(detail)
  }

  const hero = trending[0]
  const rest = trending.slice(1, 5)
  const cfSeed = selected
  const cfRecs = cfSeed?.similar.slice(0, 2) ?? []

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-black tracking-tight">🎬 CineScope</span>
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full px-4 py-2 text-slate-400 text-sm transition-colors w-72"
        >
          <span>🔍</span>
          <span>Search 9,742 movies...</span>
          <span className="ml-auto text-xs text-violet-400 bg-violet-950 px-2 py-0.5 rounded-md">⌘K</span>
        </button>
        <div className="text-xs text-slate-600">anonymous session</div>
      </nav>

      {/* Bento Grid */}
      <main className="px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[160px]">

          {/* Hero — spans 2 rows + 1 col on large */}
          <div className="lg:col-span-1 lg:row-span-2 row-span-2">
            {hero ? (
              <MovieCard movie={hero} variant="hero" onClick={() => handleSelectMovie(hero)} />
            ) : (
              <div className="bg-slate-900 rounded-xl h-full animate-pulse" />
            )}
          </div>

          {/* Trending list */}
          <div className="lg:col-span-1">
            <TrendingList movies={rest} onSelect={handleSelectMovie} />
          </div>

          {/* Genre browser */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-xs font-bold text-emerald-400 tracking-widest mb-3">BROWSE BY GENRE</p>
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 8).map(g => (
                <button
                  key={g}
                  onClick={() => setSearchOpen(true)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* CF Recommendations */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-xl p-4 border border-blue-900/40">
            <p className="text-xs font-bold text-sky-400 tracking-widest mb-1">BECAUSE YOU VIEWED</p>
            {cfSeed ? (
              <>
                <p className="text-xs text-slate-500 mb-3 truncate">→ {cfSeed.title}</p>
                <div className="space-y-2">
                  {cfRecs.map(m => (
                    <div key={m.id} className="flex justify-between items-center">
                      <span className="text-sm text-slate-200 truncate">{m.title}</span>
                      <span className="text-xs text-sky-400 bg-blue-950 px-2 py-0.5 rounded-md flex-shrink-0 ml-2">
                        {Math.round(m.similarityScore * 100)}% match
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 mt-2">Open a movie to get recommendations</p>
            )}
          </div>

          {/* Highest rated */}
          {trending.length > 0 && (() => {
            const top = [...trending].sort((a, b) => b.avgRating - a.avgRating)[0]
            return (
              <div
                className="bg-gradient-to-br from-slate-900 to-violet-950 rounded-xl p-4 border border-violet-900/40 cursor-pointer hover:ring-1 hover:ring-violet-500 transition-all"
                onClick={() => handleSelectMovie(top)}
              >
                <p className="text-xs font-bold text-violet-400 tracking-widest mb-2">HIGHEST RATED</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-violet-400">{top.avgRating.toFixed(1)}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{top.title}</p>
                    <p className="text-xs text-slate-500">{top.year} · {top.ratingCount.toLocaleString()} ratings</p>
                  </div>
                </div>
              </div>
            )
          })()}

        </div>
      </main>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSelectMovie}
        availableGenres={genres}
      />
    </div>
  )
}