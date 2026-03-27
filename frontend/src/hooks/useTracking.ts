import { useRef } from 'react'
import { postTrack } from '../api'

const SESSION_KEY = 'cinescope_session_id'

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function useTracking() {
  const sessionId = useRef(getOrCreateSessionId())

  function trackView(movieId: number) {
    // fire-and-forget — don't block UI
    postTrack({ movieId, sessionId: sessionId.current }).catch(() => {})
  }

  return { trackView }
}