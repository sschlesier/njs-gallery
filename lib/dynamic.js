import path from 'path'
import fs from 'fs/promises'
import mmm from 'mmmagic'
import yaml from 'js-yaml'

const publicPath = 'public/';
const galleryPath = publicPath;

async function getDirectoryNames(searchPath) {
  var dirs = await fs.readdir(searchPath, {withFileTypes: true});
  dirs = dirs.filter(de => { return de.isDirectory() })

  return dirs.map(de => de.name)
}

const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE)

async function detectFile(localPath) {
  let promise = await new Promise((resolve, reject) =>
    magic.detectFile(localPath, (err, mimeType) => {
      if(err) {
        reject(err);
      } else {
        resolve(mimeType);
      }
    })
  )

  return promise;
}

async function findFirstImageFile(dir) {
  const dirent = dir.readSync();
  if( dirent == null ) {
    return Promise.resolve("unknown");
  }

  if( dirent.isFile() )
  {
    console.log("checking " + dirent.name);

    const localPath = path.join(dir.path, dirent.name)
    const mimeType = await detectFile(localPath);
    if( mimeType.startsWith('image')) {
      console.log("chose " + localPath)
      return localPath;
    } else {
      findFirstImageFile(dir);
    }
  } else {
    findFirstImageFile(dir);
  }
}

async function getThumbnailFor(galleryRoot) {
  const dir = await fs.opendir(galleryRoot);

  try {
    const fullPath = await findFirstImageFile(dir);
    return path.relative(publicPath, fullPath);
  }
  finally {
    console.log("closing dir");
    dir.close()
  }
}

async function tryReadFile(localPath) {
  try {
    return await fs.readFile(localPath)
  }
  catch {
    console.log(localPath + ' not found');
    return null;
  }
}

async function readConfig(localPath) {
  var data = await tryReadFile(path.join(localPath, 'config.yml'));
  if(data == null) {
    data = await tryReadFile(path.join(localPath, 'config.yaml'));
  }

  if(data == null) { //no config file found
    return null;
  }

  console.log('loaded config for ' + localPath);
  return yaml.load(data);
}

async function buildGallery(name) {
    const relativePath = path.join(galleryPath, name);
    const config = await readConfig(path.join(relativePath));

    var gallery = {
      title: name,
      path: '/' + name,
      thumbnail: await getThumbnailFor(relativePath),
      ...config,
    };

    return gallery;
}

async function buildGalleries() {
  const names = await getDirectoryNames(galleryPath);

  return await Promise.all(names.map(buildGallery));
}

export async function getGalleries() {
  return {galleries: await buildGalleries() }
}
