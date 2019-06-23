import * as fs from 'fs-extra'
import chalk from 'chalk'
import defaultsDeep from 'lodash/defaultsDeep'
import program from 'commander'
import * as DefaultOptions from '../options'
import { wrapAction, confirm } from './share'
import { Options } from '../typings'

const action = async (options: Options = DefaultOptions) => {
  options = defaultsDeep({}, options, DefaultOptions)

  await confirm('Do you sure remove all archives?')
  await fs.remove(options.archiveFolder)
  console.log(chalk.green.bold(`All archives have been removed`))
}

program
.command('clearAll')
.description('clear all archives')
.option('-a, --archive-folder <archiveFolder>', `set save path, default: ${DefaultOptions.archiveFolder}`)
.action(wrapAction(action))
