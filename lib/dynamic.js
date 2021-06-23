import path from 'path'
import fs from 'fs'
import mmm from 'mmmagic'

function getDirectoryNames(searchPath) {
  const dirs = fs.readdirSync(searchPath, {withFileTypes: true})
    .filter(de => { return de.isDirectory() })

  return dirs.map(de => de.name )
}

const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE)

async function detectFile(filePath) {
  let promise = await new Promise((resolve, reject) =>
    magic.detectFile(filePath, (err, mimeType) => {
      if(err) {
        reject(err);
      } else {
        resolve(mimeType);
      }
    })
  )

  return promise;
}

async function findFirstImageFile(dir, basePath) {
  const dirent = dir.readSync();
  if( dirent == null ) {
    return Promise.resolve("unknown");
  }

  if( dirent.isFile() )
  {
    console.log("checking " + dirent.name);

    const filePath = path.join(basePath, dirent.name)
    const mimeType = await detectFile(filePath);
    if( mimeType.startsWith('image')) {
      console.log("chose " + filePath)
      return filePath;
    } else {
      findFirstImageFile(dir);
    }
  } else {
    findFirstImageFile(dir);
  }
}

async function getThumbnailFor(galleryPath) {
  const dir = fs.opendirSync(galleryPath);

  try {
    return await findFirstImageFile(dir, galleryPath);
  }
  finally {
    console.log("closing dir");
    dir.close()
  }
}

export async function getGalleries() {
  const pagesPath = path.join(process.cwd(), 'pages');

  const dirs = getDirectoryNames(pagesPath);

  const galleries = dirs.map(name => {
    const fullPath = path.join(pagesPath, name);

    return {
      title: name,
      path: fullPath,
      // thumbnail: await getThumbnailFor(fullPath),
      thumbnail: 'foo'
    }
  });

  // await galleries.forEach( async g => {
  //   var thumb = await getThumbnailFor(g.path)
  //   g['thumbnail'] = thumb
  // })

  return {galleries: galleries}
}
