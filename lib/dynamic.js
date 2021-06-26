import path from 'path'
import fs from 'fs/promises'
import mmm from 'mmmagic'

const publicPath = 'public/';

async function getDirectoryNames(searchPath) {
  var dirs = await fs.readdir(searchPath, {withFileTypes: true});
  dirs = dirs.filter(de => { return de.isDirectory() })

  return dirs.map(de => de.name)
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
  const dir = await fs.opendir(galleryPath);

  try {
    const fullPath = await findFirstImageFile(dir, galleryPath);
    return path.relative(publicPath, fullPath);
  }
  finally {
    console.log("closing dir");
    dir.close()
  }
}

async function buildGalleries() {
  const names = await getDirectoryNames(publicPath);

  const galleries = await Promise.all(names.map(async name => {
    const relativePath = path.join(publicPath, name);

    return {
      title: name,
      path: name + '/',
      thumbnail: await getThumbnailFor(relativePath),
    };
  }));

  return galleries;
}

export async function getGalleries() {
  return {galleries: await buildGalleries() }
}
