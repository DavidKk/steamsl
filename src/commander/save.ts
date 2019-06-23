import * as fs from 'fs-extra'
import * as path from 'path'
import chalk from 'chalk'
import defaultsDeep from 'lodash/defaultsDeep'
import program from 'commander'
import * as DefaultOptions from '../options'
import { findSteamUsers, genFileName, zip as compress } from '../share/files'
import { selectUser, inputArchive, confirm, wrapAction } from './share'
import { Options } from '../typings'

const action = async (options: Options = DefaultOptions) => {
  options = defaultsDeep({}, options, DefaultOptions)
  const defaultArchiveName = genFileName()

  let userdata = null
  if (options.steamUserId) {
    const userid = options.steamUserId
    const users = await findSteamUsers(options.steamFolder)

    userdata = users.find((user) => user.id === userid)
    !userdata && console.log(chalk.red.bold(`User ${userid} is not found`))
  }

  if (!userdata) {
    userdata = await selectUser(options.steamFolder)
  }

  const folder = path.join(userdata.folder, '262060')
  if (!fs.existsSync(folder)) {
    console.log(chalk.yellow.bold('Can not found any archives'))
    return
  }

  const filename = options.filename ? `${options.filename}.zip` : await inputArchive(defaultArchiveName)
  const file = path.join(options.archiveFolder, userdata.id, filename)

  const handleSave = async () => {
    await compress(folder, folder, file)
    console.log(chalk.green.bold(`File of ${userdata.nickname} has been saved successfully`))
  }

  return options.overwrite !== true && fs.existsSync(file)
  ? confirm('File is exists, confirm to overwrite the file?').then(handleSave)
  : handleSave()
}

program
.command('save')
.description('save archives')
.option('-s, --steam-folder <steamFolder>', `set steam save path, default: ${DefaultOptions.steamFolder}`)
.option('-u, --steam-user-id <steamUserId>', `set user id`)
.option('-a, --archive-folder <archiveFolder>', `set save path, default: ${DefaultOptions.archiveFolder}`)
.option('-o, --overwrite', `set force overwrite files, default: ${DefaultOptions.overwrite}`)
.option('-f, --filename <filename>', 'set file name')
.action(wrapAction(action))
