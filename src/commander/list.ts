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
  const archives = await fs.readdir(archiveFolder)
  if (archives.length === 0) {
    console.log(chalk.red.bold(`Can not found any files of user ${userdata.id}`))
    return
  }

  const list = archives.map((archive) => archive.replace(path.extname(archive), ''))
  console.log(chalk.green.bold(`User ${userdata.nickname} has the following archives:`))
  console.log(list.map((name, index) => `${chalk.gray.bold(`${index})`)} ${chalk.white.bold(name)}`).join('\n'))
}

program
.command('list')
.description('list all archives of user')
.option('-s, --steam-folder <steamFolder>', `archive folder in steam, default: ${DefaultOptions.steamFolder}`)
.option('-u, --steam-user-id <steamUserId>', `set user id`)
.option('-a, --archive-folder <archiveFolder>', `storage archive folder, default: ${DefaultOptions.archiveFolder}`)
.action(action)
