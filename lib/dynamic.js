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
    // console.log("checking " + dirent.name);

    const localPath = path.join(dir.path, dirent.name)
    const mimeType = await detectFile(localPath);
    if( mimeType.startsWith('image')) {
      // console.log("chose " + localPath)
      return localPath;
    } else {
      findFirstImageFile(dir);
    }
  } else {
    findFirstImageFile(dir);
  }
}

async function getThumbnailFor(gallery) {
  const galleryPath = gallery.diskPath;
  const dir = await fs.opendir(galleryPath);

  try {
    const fullPath = await findFirstImageFile(dir);
    return path.relative(publicPath, fullPath);
  }
  finally {
    dir.close()
  }
}

async function enumerateImages(galleryName) {
  const diskPath = path.join(publicPath, galleryName);
  const dir = await fs.opendir(diskPath);

  var images = [];

  try {
    var dirent = await dir.read();
    do {
      if( dirent.isFile() )
      {
        // console.log("checking " + dirent.name);

        const localPath = path.join(dir.path, dirent.name)
        const mimeType = await detectFile(localPath);
        if( mimeType.startsWith('image')) {
          images.push(path.relative(publicPath, localPath));
        }
      }

      dirent = await dir.read();
    } while(dirent)
  }
  finally {
    dir.close();
  }

  return images;
}

async function tryReadFile(localPath) {
  try {
    return await fs.readFile(localPath);
  }
  catch {
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

  // console.log('loaded config for ' + localPath);
  return yaml.load(data);
}

async function adjustThumbnailPath(gallery) {
  //supports config file omitting the gallery name in the thumbnail property
  const potentialPaths = [
    path.join(gallery.diskPath, gallery.thumbnail),
    gallery.thumbnail,
  ];

  // console.log('adjusting thumbs ' + JSON.stringify(potentialPaths));

  for (let i = 0; i < potentialPaths.length; i++) {
    const potentialPath = potentialPaths[i];

    // console.log('attempting to find thumbnail at: ' + potentialPath);
    
    try{
      await fs.access(potentialPath);
      // console.log('located:' + potentialPath);
      if(potentialPath != gallery.thumbnail) {
        // console.log('adjusting thumbnail:' + potentialPath)
        gallery.thumbnail = path.relative(publicPath, potentialPath);
      } //else {
        // console.log('no adjustment needed')
      //}
      return;
    } catch {
      //try next item
      // console.log('no file at:' + fullPath);
    }
  };
}

async function ensureValidThumbnail(gallery) {
  if(gallery.thumbnail == undefined) {
    gallery.thumbnail = await getThumbnailFor(gallery);
  } else {
    await adjustThumbnailPath(gallery);
  }
}

async function buildGallery(name) {
    const relativePath = path.join(galleryPath, name);
    const config = await readConfig(path.join(relativePath));

    var gallery = {
      title: name,
      webPath: '/' + name,
      diskPath: path.join(galleryPath, name),
      ...config,
    };

    await ensureValidThumbnail(gallery);

    return gallery;
}

async function buildGalleries() {
  const names = await getDirectoryNames(galleryPath);

  return await Promise.all(names.map(buildGallery));
}

export async function getGalleries() {
  return {galleries: await buildGalleries() }
}

export async function getGlobalConfig() {
  return await readConfig(process.cwd());
}

export async function getImages(galleryName) {
  // console.log('getting images for ' + galleryName)
  return await enumerateImages(galleryName);
}