import path from 'path'
import fs from 'fs'

function getDirectories(searchPath) {
  const dirs = fs.readdirSync(searchPath, {withFileTypes: true})
    .filter(de => { return de.isDirectory() })

  return dirs.map(de => de.name )
}

export function getGalleries() {
  const pagesPath = path.join(process.cwd(), 'pages')

  const dirs = getDirectories(pagesPath)

  return {galleries: dirs}
}
