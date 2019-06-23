import * as fs from 'fs-extra'
import * as path from 'path'
import chalk from 'chalk'
import defaultsDeep from 'lodash/defaultsDeep'
import program from 'commander'
import * as DefaultOptions from '../options'
import { findSteamUsers, unzip as uncompress } from '../share/files'
import { selectUser, selectArchive } from './share'
import { Options } from '../typings'

const action = async (options: Options = DefaultOptions) => {
  options = defaultsDeep({}, options, DefaultOptions)

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

  const archiveFolder = path.join(options.archiveFolder, userdata.id)
  if (!fs.existsSync(archiveFolder)) {
    console.log(chalk.red.bold(`Can not found any files of user ${userdata.id}`))
    return
  }

  let archive = null
  if (options.filename) {
    const file = path.join(archiveFolder, `${options.filename}.zip`)
    archive = { file }

    !fs.existsSync(file) && console.log(chalk.red.bold(`Archive ${archive} is not exists`))
  }

  if (!archive) {
    archive = await selectArchive(archiveFolder)
  }

  await fs.remove(archive.file)
  console.log(chalk.green.bold(`Archive has been deleted successfully`))
}

program
.command('remove')
.description('remove archive')
.option('-s, --steam-folder <steamFolder>', `archive folder in steam, default: ${DefaultOptions.steamFolder}`)
.option('-u, --steam-user-id <steamUserId>', `set user id`)
.option('-a, --archive-folder <archiveFolder>', `storage archive folder, default: ${DefaultOptions.archiveFolder}`)
.option('-f, --filename <filename>', `set archive file`)
.action(action)
