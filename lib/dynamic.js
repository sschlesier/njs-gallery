import path from 'path'
import fs from 'fs'
import mmm from 'mmmagic'

function getDirectoryNames(searchPath) {
  const dirs = fs.readdirSync(searchPath, {withFileTypes: true})
    .filter(de => { return de.isDirectory() })

  return dirs.map(de => de.name )
}

const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE)

const detectFile = filePath => {
  return new Promise((resolve, reject) =>
    magic.detectFile(filePath, (err, mimeType) => {
      if(err) {
        reject(err)
      } else {
        resolve(mimeType)
      }
    })
  )
}

function getThumbnailFor(galleryPath) {
  const dir = fs.opendirSync(galleryPath)

  try {
    do {
      var dirent = dir.readSync()
      if( dirent != null && dirent.isFile() )
      {
        var filePath = path.join(galleryPath, dirent.name)
        console.log("checking " + filePath)
        detectFile(filePath).then( mimeType => {
          if( mimeType.startsWith('image')) {
            console.log("returning " + filePath)
            return filePath
          }
        })
      }
    } while(dirent != null)

    console.log("no thumb")
    return "no thumb" //no thumbnail found
  }
  finally {
    dir.close()
  }
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

  galleries.forEach( g => {
    var thumb = getThumbnailFor(g.path)
    g['thumbnail'] = thumb
  })

  return {galleries: galleries}
}
