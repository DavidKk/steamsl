import * as os from 'os'
import * as fs from 'fs-extra'
import * as path from 'path'
import Zip from 'jszip'
import * as VDF from '@node-steam/vdf'

export const findFiles = (file: string, relativeTo: string) => {
  const fileMap: Array<{ file: string, destination: string }> = []

  const findDeep = (file: string): void => {
    const stat = fs.statSync(file)

    if (stat.isFile()) {
      const destination = file.replace(relativeTo, '')
      fileMap.push({ file, destination })
    }

    if (stat.isDirectory()) {
      const folder = path.isAbsolute(file) ? file : path.join(file, relativeTo)
      const files = fs.readdirSync(file)

      files.forEach((filename) => {
        let file = path.join(folder, filename)
        findDeep(file)
      })
    }
  }

  findDeep(file)
  return fileMap
}

export const findFileMap = (file: string, relativeTo: string, zip: Zip = new Zip()) => {
  let fileMap = findFiles(file, relativeTo)

  fileMap.forEach(({ file, destination }) => {
    let name = path.basename(destination)
    let folder = path.dirname(destination)
    let stream = fs.createReadStream(file)
    zip.folder(folder).file(name, stream)
  })

  return zip
}

export const zip = (folder: string, relativeTo: string = folder, zipFile: string) => {
  const zip = new Zip()
  findFileMap(folder, relativeTo, zip)

  return new Promise((resolve, reject) => {
    fs.ensureDirSync(path.dirname(zipFile))

    const writeStream = fs.createWriteStream(zipFile)
    writeStream.once('error', reject).once('close', resolve)
  
    zip
    .generateNodeStream({ streamFiles: true })
    .pipe(writeStream)
    .once('finish', () => writeStream.close())
    .once('error', reject)
  })
}

export const unzip = (file: string, folder: string) => {
  const zip = new Zip()
  
  return zip.loadAsync(fs.readFileSync(file)).then((contents) => {
    return Object.keys(contents.files).map((file) => {
      if (!zip.file(file)) {
        return
      }
  
      return zip.file(file).async('nodebuffer').then((content) => {
        file = path.join(folder, file)

        const parent = path.dirname(file)
        fs.ensureDirSync(parent)

        return fs.writeFile(file, content)
      })
    })
  })
}

export const findSteamUsers = (steamUserdataFolder: string) => {
  const userDataFolder = path.join(os.homedir(), steamUserdataFolder)
  const users = fs.readdirSync(userDataFolder).filter((item: any) => !isNaN(item * 1))

  const promises = users.map((id) => {
    const folder = path.join(userDataFolder, id)
    const file = path.join(folder, 'config/localconfig.vdf')

    return fs.readFile(file).then((buffer) => {
      const data = VDF.parse(buffer.toString('utf-8'))
      const store = data.UserLocalConfigStore || {}
      const friends = store.friends || store.Friends || {}
      const nickname = friends.PersonaName || name

      return { id, nickname, folder }
    })
  })

  return Promise.all(promises)
}

export const findArchives = (folder: string) => {
  return fs.readdir(folder).then((archives) => {
    archives = archives.filter((file) => path.extname(file) === '.zip')

    return archives.map((archive) => ({
      name: archive.replace(path.extname(archive), ''),
      file: path.join(folder, archive)
    }))
  })
}

export const genFileName = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = (d.getMonth() + 1 + '').padStart(2, '0')
  const date = (d.getDate() + '').padStart(2, '0')
  const hours = (d.getHours() + '').padStart(2, '0')
  const minutes = (d.getMinutes() + '').padStart(2, '0')
  const seconds = (d.getSeconds() + '').padStart(2, '0')
  return `${year}${month}${date}${hours}${minutes}${seconds}`
}
