import * as fs from 'fs-extra'
import * as path from 'path'
import chalk from 'chalk'
import defaultsDeep from 'lodash/defaultsDeep'
import program from 'commander'
import * as DefaultOptions from '../options'
import { findSteamUsers } from '../share/files'
import { selectUser } from './share'
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

  await fs.remove(archiveFolder)
  console.log(chalk.green.bold(`Archives of ${userdata.nickanme} have been removed successfully`))
}

program
.command('clear')
.description('clear all archives of user')
.option('-s, --steam-folder <steamFolder>', `archive folder in steam, default: ${DefaultOptions.steamFolder}`)
.option('-u, --steam-user-id <steamUserId>', `set user id`)
.option('-a, --archive-folder <archiveFolder>', `storage archive folder, default: ${DefaultOptions.archiveFolder}`)
.action(action)
