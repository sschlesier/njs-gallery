import path from 'path'
import fs from 'fs'

const isDir = name => {
	return fs.lstatSync(name).isDirectory()
}

export function getGalleries() {
  const galleryPath = path.join(process.cwd(), 'pages')

  const names = fs.readdirSync(galleryPath).map(name => {
	  return path.join(galleryPath, name)
  }).filter(isDir).map(name => {
	  return path.basename(name)
  })

  return {galleries: names}
}
