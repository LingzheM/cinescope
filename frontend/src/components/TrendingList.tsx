import type { Movie } from '@cinescope/shared'
import { MovieCard } from './MovieCard'

interface Props {
  movies: Movie[]   // #2–#5
  onSelect: (movie: Movie) => void
}

export function TrendingList({ movies, onSelect }: Props) {
  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 h-full">
      <p className="text-xs font-bold text-violet-400 tracking-widest mb-3">TRENDING NOW</p>
      <div className="space-y-1">
        {movies.map((movie, i) => (
          <div key={movie.id} className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 w-5">#{i + 2}</span>
            <div className="flex-1">
              <MovieCard movie={movie} variant="compact" onClick={() => onSelect(movie)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}