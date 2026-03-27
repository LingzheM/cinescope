import type { Movie } from '@cinescope/shared'

interface Props {
    movie: Movie
    variant: 'hero' | 'compact'
    onClick?: () => void
}

function StarRating({ rating }: { rating: number }) {
    const full = Math.floor(rating)
    const half = rating - full >= 0.5

    return (
        <span className='text-yellow-400 text-sm'>
            {'★'.repeat(full)}{half ? '½': ''}{'☆'.repeat(5 - full - (half ? 1: 0))}
            <span className='text-slate-400 text-xs ml-1'>{rating.toFixed(1)}</span>
        </span>
    )
}

export function MovieCard({ movie, variant, onClick }: Props) {
    if (variant === 'hero') {
        return (
            <div
                className='relative bg-gradient-to-b from-violet-950 to-slate-900 rounded-xl p-5 flex flex-col justify-end h-full cursor-pointer hover:ring-2 hover:ring-violet-500 transition-all'
                onClick={onClick}
            >
                <div className='absolute top-3 left-3 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full'>
                    🔥 #1 TRENDING
                </div>
                <div>
                    <h2 className='text-2xl font-black text-white leading-tight'>{movie.title}</h2>
                    <p className='text-violet-300 text-sm -mt-1'>
                        {movie.genres.join(' · ')} {movie.year ? `· ${movie.year}` : ''}
                    </p>
                    <div className='flex items-center gap-3 mt-2'>
                        <StarRating rating={movie.avgRating} />
                        <span className='text-slate-400 text-xs'>{movie.ratingCount.toLocaleString()} ratings</span>
                    </div>
                    <div className='flex gap-2 mt-4'>
                        <button className='bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors'>
                            View Details
                        </button>
                        <button className='bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-4 py-2 rounded-lg transition-colors'>
                            + Watchlist
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className='flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors'
            onClick={onClick}
        >
            <div className='w-8 h-12 bg-slate-700 rouned flex-shrink-0'/>
            <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-slate-200 truncate'>{movie.title}</p>
                <p className='text-xs text-slate-500'>{movie.genres[0]} · {movie.year ?? '—'}</p>
            </div>
            <StarRating rating={movie.avgRating} />
        </div>
    )
}