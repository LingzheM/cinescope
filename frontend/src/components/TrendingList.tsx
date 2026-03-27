import type { Movie } from '@cinescope/shared'

interface Props {
  movies: Movie[]   // #2–#5
  onSelect: (movie: Movie) => void
}

export function TrendingList({ movies, onSelect }: Props) {
  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 h-full">
      <p className="text-xs font-bold text-violet-400 tracking-widest mb-3">TRENDING NOW</p>
      <div className="flex flex-col gap-2">
        {movies.map((movie, i) => (
          <div
            key={movie.id}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onSelect(movie)}
          >
            <span className="text-xs font-bold text-slate-600 w-5 flex-shrink-0">#{i + 2}</span>
            <span className="flex-1 text-sm text-slate-200 truncate">{movie.title}</span>
            <span className="text-yellow-400 text-xs flex-shrink-0">★{movie.avgRating.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}