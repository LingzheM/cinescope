/** Parse a single CSV line, handling RFC 4180 quoted fields. */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      // quoted field
      let field = ''
      i++ // skip opening quote
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"'
          i += 2
        } else if (line[i] === '"') {
          i++ // skip closing quote
          break
        } else {
          field += line[i++]
        }
      }
      fields.push(field)
      if (line[i] === ',') i++ // skip comma after closing quote
    } else {
      // unquoted field
      const end = line.indexOf(',', i)
      if (end === -1) {
        fields.push(line.slice(i))
        break
      }
      fields.push(line.slice(i, end))
      i = end + 1
    }
  }
  return fields
}

/** Parse full CSV text: skip header row, return data rows as string[][]. */
export function parseCsv(raw: string): string[][] {
  const lines = raw.split('\n').filter(l => l.trim().length > 0)
  return lines.slice(1).map(parseCsvLine)
}