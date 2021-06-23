import path from 'path'
import fs from 'fs'

function getDirectoryNames(searchPath) {
  const dirs = fs.readdirSync(searchPath, {withFileTypes: true})
    .filter(de => { return de.isDirectory() })

  return dirs.map(de => de.name )
}

export function getGalleries() {
  const pagesPath = path.join(process.cwd(), 'pages')

  const dirs = getDirectoryNames(pagesPath)

  const galleries = dirs.map(name => {
    return {
      title: name,
      path: path.join(pagesPath, name)
    }
  })

  return {galleries: galleries}
}
