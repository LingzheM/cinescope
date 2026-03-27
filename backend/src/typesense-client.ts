const HOST = process.env.TYPESENSE_HOST ?? 'localhost'
const PORT = process.env.TYPESENSE_HOST ?? '8108'
const KEY = process.env.TYPESENSE_API_KEY ?? 'cinescope-dev-key'

export const TYPESENSE_BASE = `http://${HOST}:${PORT}`
export const TYPESENSE_HEADERS = { 'X-TYPESENSE-API-KEY': KEY }
